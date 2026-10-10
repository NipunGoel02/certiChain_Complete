const { LiveKitAPI } = require('livekit-server-sdk');

function getLiveKitHost(value) {
  return value.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
}

function toE164(value) {
  const input = String(value || '').trim();
  const digits = input.replace(/\D/g, '');
  const number = input.startsWith('+')
    ? '+' + digits
    : digits.length === 10
      ? '+91' + digits
      : '+' + digits;

  if (!/^\+[1-9]\d{7,14}$/.test(number)) {
    throw new Error('Participant mobile number is not a valid international number.');
  }

  return number;
}

async function startCertificateCall({
  phoneNumber,
  participantId,
  participantName,
  organizerName,
  internshipTitle,
  certificateType,
  requestId
}) {
  const liveKitUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const trunkId = process.env.LIVEKIT_SIP_TRUNK_ID;

  if (!liveKitUrl || !apiKey || !apiSecret || !trunkId) {
    throw new Error('LiveKit outbound calling is not configured.');
  }

  const phone = toE164(phoneNumber);
  const roomName = 'certichain-internship-' + requestId;
  const agentName = process.env.LIVEKIT_AGENT_NAME || 'certichain-agent';
  const metadata = JSON.stringify({
    call_type: 'internship_certificate',
    participant_id: participantId,
    participant_name: participantName,
    organizer_name: organizerName,
    internship_title: internshipTitle,
    certificate_type: certificateType,
    request_id: requestId
  });

  const livekit = new LiveKitAPI({
    host: getLiveKitHost(liveKitUrl),
    apiKey,
    secret: apiSecret
  });

  await livekit.agentDispatch.createDispatch(roomName, agentName, { metadata });
  await livekit.sip.createSipParticipant(trunkId, phone, roomName, {
    participantIdentity: 'certichain-user-' + participantId,
    participantName: participantName || 'CertiChain participant',
    participantMetadata: metadata,
    waitUntilAnswered: false
  });

  return { roomName };
}

async function startAssessmentCall({ phoneNumber, candidateId, candidateName, roleKey, roleTitle, assessmentId }) {
  const liveKitUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const trunkId = process.env.LIVEKIT_SIP_TRUNK_ID;

  if (!liveKitUrl || !apiKey || !apiSecret || !trunkId) {
    throw new Error('LiveKit outbound calling is not configured.');
  }

  const phone = toE164(phoneNumber);
  const roomName = 'certichain-assessment-' + assessmentId;
  const agentName = process.env.LIVEKIT_AGENT_NAME || 'certichain-agent';
  const metadata = JSON.stringify({
    call_type: 'skill_assessment',
    assessment_id: String(assessmentId),
    candidate_id: String(candidateId),
    candidate_name: candidateName || 'there',
    role_key: roleKey,
    role_title: roleTitle
  });

  const livekit = new LiveKitAPI({
    host: getLiveKitHost(liveKitUrl),
    apiKey,
    secret: apiSecret
  });

  await livekit.agentDispatch.createDispatch(roomName, agentName, { metadata });
  await livekit.sip.createSipParticipant(trunkId, phone, roomName, {
    participantIdentity: 'certichain-assessment-candidate-' + candidateId,
    participantName: candidateName || 'CertiChain candidate',
    participantMetadata: metadata,
    waitUntilAnswered: true,
    ringingTimeout: 30,
    timeout: 35,
    maxCallDuration: 300
  });

  return { roomName };
}

module.exports = { startCertificateCall, startAssessmentCall, toE164 };
