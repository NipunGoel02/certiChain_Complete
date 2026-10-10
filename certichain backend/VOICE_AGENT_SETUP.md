# CertiChain outbound certificate calls

CertiChain runs its own LiveKit voice agent from the voice_agent directory. It does
not import or call the separate Murf AI project. The Python worker uses Deepgram
for speech recognition, Gemini for responses, and Murf Falcon for speech output.
The Node API dispatches that worker and asks LiveKit SIP to call the participant's
signup number.

## Configure the services

Add the voice settings from .env.example to the existing .env in this directory;
preserve the application's current database and authentication settings. Set the
LiveKit project values, outbound SIP trunk ID, Deepgram key, Google key, and Murf
key. The LiveKit project must have an outbound SIP trunk configured with a phone
provider and caller ID. If using Twilio, configure Twilio Elastic SIP Trunking in
LiveKit and use that trunk's LiveKit ID as LIVEKIT_SIP_TRUNK_ID.

## Run locally

Start the Express backend from certichain backend:

    npm install
    npm run dev

In another terminal, start the CertiChain voice worker:

    cd voice_agent
    uv sync
    uv run python src/agent.py dev

Start the existing Vite frontend from the project root as usual. When an internship
certificate request is created for a registered email, the API stores the request
and then dispatches the voice agent to call the phone number on that account. The
participant can still open Profile and mint the NFT themselves with MetaMask.

New signups need to provide a valid mobile number. A participant created before
this field was added can still receive an in-app request, but the backend skips the
call until that account has a saved number.
