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

## ProofCall recruiter assessments

ProofCall is a separate recruiter-triggered call flow. The existing internship
certificate notification call remains unchanged. A recruiter chooses a role in
`/recruiter`, then explicitly clicks **Call candidate**; the API reads the saved
candidate phone number from MongoDB and starts the LiveKit SIP call. The voice
agent identifies itself as AI, says the call transcript will be summarized for
the recruiter, and tells the candidate they can end the call. There is no prior
consent gate in this flow.

The worker submits its transcript to the backend callback using a shared secret.
The backend uses the existing `GOOGLE_API_KEY` to create a structured, evidence-
based technical report. Candidate phone, transcript, report, and evidence stay in
MongoDB. In the recruiter **ProofCall** page, the recruiter can send the report's
SHA-256 digest in a zero-value self-transaction from their MetaMask wallet on
Sepolia. The backend checks the mined transaction's sender, recipient, chain and
data before attaching it to the report. No report content is written to the
blockchain.

Add these settings to `certichain backend/.env` (never to a `VITE_` variable):

    ASSESSMENT_CALLBACK_SECRET=<long random shared secret>
    CERTICHAIN_API_URL=http://localhost:5000
    ASSESSMENT_REPORT_MODEL=gemini-3.5-flash-lite
    SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

The API and voice worker load that backend `.env`, so the callback secret must be
identical for both. If the worker is remote, set `CERTICHAIN_API_URL` to a
publicly reachable HTTPS URL for this backend. The recruiter needs a MetaMask
wallet with Sepolia ETH only when anchoring a report; call placement itself uses
the existing LiveKit/Twilio SIP configuration. A candidate without a saved
mobile number cannot be called.

Open `/recruiter/assessments` to review call status, evidence, transcript and
proof. Reports without enough candidate speech are explicitly marked insufficient
instead of receiving invented skill scores. The report is a recruiter aid and
does not make a hiring decision.
