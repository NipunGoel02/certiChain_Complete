from __future__ import annotations

import asyncio
import json
import logging
import os
from pathlib import Path
from urllib.request import Request, urlopen

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


class SkillAssessmentAgent(Agent):
    def __init__(self, role_title: str, scenario: str) -> None:
        super().__init__(
            instructions=(
                "You are CertiChain's automated AI technical interviewer. This is a "
                "short, structured voice assessment for the role "
                f"{role_title}. Speak naturally in Hindi, Hinglish, or English, "
                "matching the candidate. Introduce yourself clearly as an AI "
                "assistant, explain that a recruiter requested this role-related "
                "technical conversation, and tell them they may end the call at any "
                "time. Tell them the call transcript will be saved and shared with that "
                "recruiter. Do not require a prior yes/consent before continuing. Ask the "
                "scenario below, listen, then ask one concise follow-up based on "
                "their answer. If they do not want to continue, thank them and end "
                "politely without pressure. Keep this to a few minutes. Do not ask "
                "for personal, financial, password, or wallet information. Do not "
                "make a hiring/rejection recommendation or state a score. Assess only "
                "technical reasoning demonstrated in their words; never invent "
                "evidence or claim code was run. Scenario: "
                f"{scenario}"
            ),
            tts=murf.TTS(
                voice="hi-IN-anisha",
                style="Conversation",
                tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
                text_pacing=True,
            ),
        )


def _post_assessment_result(assessment_id: str, stage: str, transcript: list[dict]) -> None:
    api_url = os.getenv("CERTICHAIN_API_URL", "http://localhost:5000").rstrip("/")
    secret = os.getenv("ASSESSMENT_CALLBACK_SECRET", "")
    if not secret:
        logger.error("ProofCall callback secret is not configured; assessment=%s", assessment_id)
        return
    payload = json.dumps({
        "assessmentId": assessment_id,
        "stage": stage,
        "transcript": transcript,
    }).encode("utf-8")
    request = Request(
        f"{api_url}/api/recruiter/assessments/voice-result",
        data=payload,
        headers={"Content-Type": "application/json", "x-certichain-agent-secret": secret},
        method="POST",
    )
    try:
        with urlopen(request, timeout=45) as response:
            response.read()
    except Exception:
        logger.exception("ProofCall callback failed: assessment=%s stage=%s", assessment_id, stage)


async def post_assessment_result(assessment_id: str, stage: str, transcript: list[dict]) -> None:
    await asyncio.to_thread(_post_assessment_result, assessment_id, stage, transcript)


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

    call_type = call_metadata.get("call_type")
    if call_type not in {"internship_certificate", "skill_assessment"}:
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

    transcript: list[dict] = []
    session_closed = asyncio.Event()
    session.on("conversation_item_added", lambda event: transcript.append({
        "speaker": "candidate" if event.item.role == "user" else "agent",
        "text": (event.item.text_content or "").strip(),
        "at": event.created_at,
    }) if hasattr(event.item, "role") else None)
    session.on("close", lambda _event: session_closed.set())

    is_assessment = call_type == "skill_assessment"
    role_title = call_metadata.get("role_title") or "technical intern"
    role_key = call_metadata.get("role_key") or "full-stack-intern"
    scenarios = {
        "full-stack-intern": (
            "A user submits a signup form, but the UI spins forever and the user is "
            "not created. Ask how they would debug the browser, API, server logs, "
            "database write, and response handling. Follow up about validation or a "
            "failed database write."
        ),
        "frontend-intern": (
            "A React page renders the same API request many times and feels slow. "
            "Ask how they would find the cause, fix the effect/state flow, and keep "
            "loading and error states accessible. Follow up about stale responses."
        ),
        "backend-intern": (
            "An API endpoint sometimes creates duplicate records when users retry "
            "after a timeout. Ask how they would investigate and design an "
            "idempotent, validated endpoint with safe database behavior. Follow up "
            "about concurrent requests."
        ),
    }
    active_agent = SkillAssessmentAgent(role_title, scenarios.get(role_key, scenarios["full-stack-intern"])) if is_assessment else CertificateCallAgent()

    await session.start(
        agent=active_agent,
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

    logger.info(
        "Outbound call connected: participant=%s type=%s id=%s",
        caller.identity,
        call_type,
        call_metadata.get("assessment_id") if is_assessment else call_metadata.get("request_id"),
    )

    if is_assessment:
        assessment_id = str(call_metadata.get("assessment_id") or "")
        await post_assessment_result(assessment_id, "started", [])
        await session.generate_reply(
            instructions=(
                "Start this ProofCall now. Introduce yourself as CertiChain's AI "
                "technical interviewer. Say a recruiter requested a short "
                f"technical conversation for {role_title}. Mention they can end "
                "the call at any time, and that the transcript will be saved and shared "
                "with the recruiter. Do not ask them to agree before you ask "
                "the scenario. Then ask the role scenario conversationally. Do not "
                "mention scores or a hiring decision."
            )
        )
        await session_closed.wait()
        await post_assessment_result(assessment_id, "completed", transcript)
        return

    participant_name = call_metadata.get("participant_name") or "there"
    organizer_name = call_metadata.get("organizer_name") or "your internship organizer"
    internship_title = call_metadata.get("internship_title") or "your internship"
    certificate_type = call_metadata.get("certificate_type") or "completion"

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
