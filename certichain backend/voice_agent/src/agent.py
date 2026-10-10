from __future__ import annotations

import json
import logging
from pathlib import Path

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    UserInputTranscribedEvent,
    cli,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel


load_dotenv(Path(__file__).resolve().parents[2] / ".env")
logger = logging.getLogger("certichain-voice-agent")
server = AgentServer()


class CertificateCallAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are CertiChain's automated voice assistant calling about an "
                "internship certificate request. Speak naturally in Hindi, "
                "Hinglish, or English, matching the participant. Explain only that "
                "their organizer submitted a certificate request and guide them to "
                "log in to CertiChain, open Profile, find Pending Internship "
                "Invitations, and tap Mint Certificate. The participant must review "
                "and approve the MetaMask transaction themselves. Never claim the "
                "certificate has already been minted, ask for passwords or wallet "
                "recovery phrases, or request payment details. Keep the call brief "
                "and answer simple questions. If you do not know an answer, direct "
                "them to the CertiChain website's support channel."
            ),
            tts=murf.TTS(
                voice="hi-IN-anisha",
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True,
            ),
        )


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="certichain-agent")
async def certificate_call(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}

    try:
        call_metadata = json.loads(ctx.job.metadata or "{}")
    except json.JSONDecodeError:
        logger.exception("Invalid certificate-call metadata")
        return

    if call_metadata.get("call_type") != "internship_certificate":
        logger.warning("Ignoring unsupported outbound call type")
        return

    await ctx.connect()
    caller = await ctx.wait_for_participant()

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(model="gemini-3.5-flash-lite"),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    @session.on("user_input_transcribed")
    def update_voice_for_language(event: UserInputTranscribedEvent) -> None:
        if not event.is_final or not event.text.strip():
            return

        devanagari = any("\u0900" <= char <= "\u097f" for char in event.text)
        voice = "hi-IN-anisha" if devanagari else "en-IN-anisha"
        session.tts.update_options(voice=voice)

    await session.start(
        agent=CertificateCallAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    participant_name = call_metadata.get("participant_name") or "there"
    organizer_name = call_metadata.get("organizer_name") or "your internship organizer"
    internship_title = call_metadata.get("internship_title") or "your internship"
    certificate_type = call_metadata.get("certificate_type") or "completion"

    logger.info(
        "Certificate call connected: participant=%s request=%s",
        caller.identity,
        call_metadata.get("request_id"),
    )

    await session.generate_reply(
        instructions=(
            "Start the outbound call now. Clearly introduce yourself as CertiChain's "
            "automated AI voice assistant. Greet the participant by name, tell them "
            f"{organizer_name} submitted a {certificate_type} certificate request "
            f"for {internship_title}, and explain they can log in, open Profile, "
            "and choose Pending Internship Invitations to mint it. Tell them the "
            "MetaMask transaction is theirs to review and approve. Keep the first "
            "message concise and ask if they need the steps repeated. "
            f"The participant's name is {participant_name}."
        )
    )


if __name__ == "__main__":
    cli.run_app(server)
