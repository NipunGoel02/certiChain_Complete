const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Internship = require('../models/Internship');
const Assessment = require('../models/Assessment');
const { auth, isRecruiter } = require('../middleware/auth');
const { startAssessmentCall } = require('../services/livekitCalls');
const crypto = require('crypto');
const { JsonRpcProvider } = require('ethers');
const fetch = require('node-fetch');

const ASSESSMENT_ROLES = {
  'full-stack-intern': {
    title: 'Full Stack Intern',
    scenario: 'A user submits a signup form, but the UI spins forever and the user is not created. Ask the candidate to reason through how they would debug the browser, API, server logs, database write, and response handling. Ask one follow-up about validation or a failed database write.'
  },
  'frontend-intern': {
    title: 'Frontend Intern',
    scenario: 'A React page renders the same API request many times and feels slow. Ask the candidate how they would find the cause, fix the effect/state flow, and keep loading and error states accessible. Ask one follow-up about avoiding stale responses.'
  },
  'backend-intern': {
    title: 'Backend Intern',
    scenario: 'An API endpoint sometimes creates duplicate records when users retry after a timeout. Ask the candidate how they would investigate and design an idempotent, validated endpoint with safe database behavior. Ask one follow-up about concurrent requests.'
  }
};

function safeAgentSecretMatches(provided) {
  const expected = process.env.ASSESSMENT_CALLBACK_SECRET || '';
  if (!expected || !provided) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(String(provided));
  return expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function sanitizeTranscript(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 60).map((item) => ({
    speaker: item?.speaker === 'agent' ? 'agent' : 'candidate',
    text: String(item?.text || '').trim().slice(0, 1000),
    at: Number.isFinite(Number(item?.at)) ? Number(item.at) : 0
  })).filter((item) => item.text);
}

function limitedStrings(input, max = 6) {
  return Array.isArray(input) ? input.slice(0, max).map((value) => String(value || '').trim().slice(0, 400)).filter(Boolean) : [];
}

async function createAssessmentReport(roleTitle, transcript) {
  const candidateTurns = transcript.filter((item) => item.speaker === 'candidate');
  const candidateText = candidateTurns.map((item) => item.text).join(' ');
  if (candidateTurns.length < 2 || candidateText.length < 45) {
    return {
      summary: 'There was not enough candidate response to assess the technical skills in this call.',
      skillDimensions: [],
      strengths: [],
      areasToExplore: [],
      limitations: ['Insufficient candidate speech for a meaningful assessment.'],
      assessmentAvailable: false
    };
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Google Gemini is not configured for assessment reports.');
  const model = process.env.ASSESSMENT_REPORT_MODEL || 'gemini-3.5-flash-lite';
  const prompt = [
    'Create a concise, evidence-based technical interview report from this AI phone call transcript.',
    `Role: ${roleTitle}.`,
    'Assess only demonstrated technical reasoning in the candidate turns. Do not infer personality, protected traits, identity, or employability. Do not make a hire/reject recommendation.',
    'Use 0-4 integer scores only when there is enough evidence; otherwise use null (0 means no demonstrated signal, 1 limited, 2 partial fundamentals, 3 sound reasoning, 4 thorough reasoning). Every evidence entry must be an exact, short quote from a candidate turn. Never invent candidate quotes or claim code was run.',
    'Return valid JSON with keys: summary (string), assessmentAvailable (boolean), skillDimensions (array of {name, score, evidence}), strengths (string array), areasToExplore (string array), limitations (string array). Keep the report compact.',
    'Transcript:',
    JSON.stringify(transcript.map(({ speaker, text }) => ({ speaker, text })))
  ].join('\n');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, responseMimeType: 'application/json' }
    })
  });
  const responseBody = await response.json();
  if (!response.ok) throw new Error(responseBody?.error?.message || 'Gemini report generation failed.');
  const text = responseBody?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
  if (!text) throw new Error('Gemini returned an empty assessment report.');
  const generated = JSON.parse(text);
  const candidateLower = candidateText.toLowerCase();
  const skillDimensions = Array.isArray(generated.skillDimensions) ? generated.skillDimensions.slice(0, 6).map((dimension) => {
    const evidence = limitedStrings(dimension.evidence, 4).filter((quote) => candidateLower.includes(quote.toLowerCase()));
    const parsedScore = dimension.score === null || dimension.score === undefined ? null : Number(dimension.score);
    return {
      name: String(dimension.name || 'Technical reasoning').slice(0, 100),
      score: parsedScore !== null && Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 4 && evidence.length ? parsedScore : null,
      evidence
    };
  }) : [];
  return {
    summary: String(generated.summary || 'Assessment completed from the call transcript.').slice(0, 1000),
    assessmentAvailable: generated.assessmentAvailable === true && skillDimensions.some((dimension) => dimension.score !== null),
    skillDimensions,
    strengths: limitedStrings(generated.strengths),
    areasToExplore: limitedStrings(generated.areasToExplore),
    limitations: limitedStrings(generated.limitations)
  };
}

function serialiseAssessment(assessment, includeTranscript = false) {
  const result = {
    _id: assessment._id,
    candidate: assessment.candidate,
    candidateName: assessment.candidateName,
    roleKey: assessment.roleKey,
    roleTitle: assessment.roleTitle,
    status: assessment.status,
    report: assessment.report,
    reportHash: assessment.reportHash,
    proof: assessment.proof,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt
  };
  if (includeTranscript) result.transcript = assessment.transcript;
  return result;
}

function getSepoliaProvider() {
  return new JsonRpcProvider(process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com', 11155111);
}

function canonicalise(value) {
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalise(value[key])]));
  }
  return value;
}

function assessmentHashPayload(assessment) {
  return JSON.stringify(canonicalise({
    schemaVersion: 1,
    role: { key: assessment.roleKey, title: assessment.roleTitle },
    transcript: Array.from(assessment.transcript || [], (item) => ({
      speaker: item.speaker,
      text: item.text,
      at: item.at
    })),
    report: assessment.report
  }));
}

function storedReportHashIsValid(assessment) {
  if (!assessment.hashPayload || !assessment.reportHash) return false;
  const currentPayload = assessmentHashPayload(assessment);
  const actualHash = '0x' + crypto.createHash('sha256').update(currentPayload, 'utf8').digest('hex');
  return currentPayload === assessment.hashPayload && actualHash.toLowerCase() === assessment.reportHash.toLowerCase();
}

// Recruiters search learner records already stored in MongoDB. This endpoint
// deliberately does not query wallets or the blockchain.
router.get('/candidates', auth, isRecruiter, async (req, res) => {
  try {
    const { q = '', courseId = '', category = '', internship = '', certificateStatus = '' } = req.query;
    const users = await User.find({ role: 'user' })
      .select('name profilePicture enrolledCourses completedCourses')
      .sort({ name: 1 })
      .lean();

    if (users.length === 0) return res.json({ candidates: [], total: 0 });

    const userIds = users.map((user) => user._id);
    const courseIds = [...new Set(users.flatMap((user) => [
      ...(user.enrolledCourses || []),
      ...(user.completedCourses || [])
    ]).map(String))];

    const [courses, internships] = await Promise.all([
      courseIds.length ? Course.find({ _id: { $in: courseIds } }).select('title category description thumbnail').lean() : [],
      Internship.find({ participants: { $in: userIds } })
        .select('title description startDate endDate participants certificateRequests')
        .lean()
    ]);

    const courseById = new Map(courses.map((course) => [String(course._id), course]));
    const internshipsByUser = new Map(userIds.map((id) => [String(id), []]));
    for (const internshipRecord of internships) {
      for (const participantId of internshipRecord.participants || []) {
        const list = internshipsByUser.get(String(participantId));
        if (!list) continue;
        const requests = (internshipRecord.certificateRequests || []).filter(
          (request) => String(request.participant) === String(participantId)
        );
        list.push({
          _id: internshipRecord._id,
          title: internshipRecord.title,
          description: internshipRecord.description,
          startDate: internshipRecord.startDate,
          endDate: internshipRecord.endDate,
          certificateRequests: requests.map((request) => ({
            status: request.status,
            certificateType: request.certificateType,
            requestedAt: request.requestedAt
          }))
        });
      }
    }

    const candidates = users.map((user) => {
      const enrolled = new Set((user.enrolledCourses || []).map(String));
      const completed = new Set((user.completedCourses || []).map(String));
      const allCourseIds = new Set([...enrolled, ...completed]);
      const userCourses = [...allCourseIds].map((id) => {
        const course = courseById.get(id);
        if (!course) return null;
        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          description: course.description,
          thumbnail: course.thumbnail,
          status: completed.has(id) ? 'completed' : 'enrolled'
        };
      }).filter(Boolean);

      const userInternships = internshipsByUser.get(String(user._id)) || [];
      const certificateRequests = userInternships.flatMap((record) =>
        record.certificateRequests.map((request) => ({
          internshipTitle: record.title,
          status: request.status,
          certificateType: request.certificateType,
          requestedAt: request.requestedAt
        }))
      );

      return {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        courses: userCourses,
        internships: userInternships,
        certificateRequests
      };
    });

    const normalizedQuery = String(q).trim().toLowerCase();
    const normalizedInternship = String(internship).trim().toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const hasCourse = !courseId || candidate.courses.some((course) => String(course._id) === String(courseId));
      const hasCategory = !category || candidate.courses.some((course) => course.category === category);
      const hasInternship = !normalizedInternship || candidate.internships.some((record) =>
        `${record.title || ''} ${record.description || ''}`.toLowerCase().includes(normalizedInternship)
      );
      const hasCertificateStatus = !certificateStatus || candidate.certificateRequests.some(
        (request) => request.status === certificateStatus
      );
      const searchable = [candidate.name,
        ...candidate.courses.flatMap((course) => [course.title, course.category]),
        ...candidate.internships.flatMap((record) => [record.title, record.description])
      ].join(' ').toLowerCase();
      return hasCourse && hasCategory && hasInternship && hasCertificateStatus &&
        (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    res.json({ candidates: filtered, total: filtered.length });
  } catch (error) {
    console.error('Recruiter candidate search failed:', error);
    res.status(500).json({ message: 'Could not load candidate records' });
  }
});

// A recruiter explicitly starts each assessment call from the directory.
// Candidate phone numbers remain server-only and are never returned in search results.
router.post('/assessments', auth, isRecruiter, async (req, res) => {
  let assessment;
  try {
    const { candidateId, roleKey } = req.body || {};
    if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: 'Choose a valid candidate.' });
    }
    const role = ASSESSMENT_ROLES[roleKey];
    if (!role) return res.status(400).json({ message: 'Choose a supported assessment role.' });

    const candidate = await User.findOne({ _id: candidateId, role: 'user' }).select('name phoneNumber');
    if (!candidate) return res.status(404).json({ message: 'Candidate account was not found.' });
    if (!candidate.phoneNumber) {
      return res.status(409).json({ message: 'This candidate account has no saved mobile number.' });
    }

    const activeStatuses = ['initiating', 'ringing', 'in_progress'];
    const activeCall = await Assessment.findOne({ candidate: candidate._id, status: { $in: activeStatuses } }).select('_id');
    if (activeCall) return res.status(409).json({ message: 'This candidate already has an active ProofCall.' });

    assessment = await Assessment.create({
      candidate: candidate._id,
      recruiter: req.user.id,
      candidateName: candidate.name,
      roleKey,
      roleTitle: role.title,
      status: 'initiating'
    });

    const call = await startAssessmentCall({
      phoneNumber: candidate.phoneNumber,
      candidateId: candidate._id,
      candidateName: candidate.name,
      roleKey,
      roleTitle: role.title,
      assessmentId: assessment._id
    });
    await Assessment.updateOne(
      { _id: assessment._id, status: 'initiating' },
      { $set: { roomName: call.roomName, status: 'ringing' } }
    );
    const updatedAssessment = await Assessment.findById(assessment._id);
    return res.status(201).json({ assessment: serialiseAssessment(updatedAssessment) });
  } catch (error) {
    console.error('Could not start ProofCall:', error.message);
    const sipCode = Number(error.sipStatusCode);
    const outcome = [408, 480, 486, 487, 603].includes(sipCode) ? 'no_answer' : 'failed';
    if (assessment) await Assessment.updateOne(
      { _id: assessment._id, status: { $in: ['initiating', 'ringing'] } },
      { $set: { status: outcome } }
    ).catch(() => {});
    const message = outcome === 'no_answer'
      ? 'The call was not answered or could not connect. You can try again later.'
      : error.message?.includes('not configured') || error.message?.includes('valid international')
      ? error.message
      : 'The call could not be started. Check the outbound calling setup and try again.';
    return res.status(502).json({ message });
  }
});

router.get('/assessments', auth, isRecruiter, async (req, res) => {
  try {
    const assessments = await Assessment.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ assessments: assessments.map((item) => serialiseAssessment(item)) });
  } catch (error) {
    console.error('Could not load ProofCall assessments:', error.message);
    return res.status(500).json({ message: 'Assessment reports could not be loaded.' });
  }
});

router.get('/assessments/:id', auth, isRecruiter, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid assessment ID.' });
    const assessment = await Assessment.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!assessment) return res.status(404).json({ message: 'Assessment was not found.' });
    return res.json({ assessment: serialiseAssessment(assessment, true) });
  } catch (error) {
    console.error('Could not load ProofCall report:', error.message);
    return res.status(500).json({ message: 'Assessment report could not be loaded.' });
  }
});

// The voice worker can update call state and submit a transcript, but only with
// a server-side shared secret. The secret is never sent to the browser.
router.post('/assessments/voice-result', async (req, res) => {
  if (!safeAgentSecretMatches(req.get('x-certichain-agent-secret'))) {
    return res.status(401).json({ message: 'Voice-agent authentication failed.' });
  }
  try {
    const { assessmentId, stage } = req.body || {};
    if (!assessmentId || !mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ message: 'Invalid assessment ID.' });
    }
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: 'Assessment was not found.' });
    if (stage === 'started') {
      if (assessment.status === 'ringing' || assessment.status === 'initiating') assessment.status = 'in_progress';
      await assessment.save();
      return res.json({ success: true });
    }
    if (stage !== 'completed') return res.status(400).json({ message: 'Unsupported call update.' });
    if (assessment.report) return res.json({ success: true, status: assessment.status });

    const transcript = sanitizeTranscript(req.body.transcript);
    if (!transcript.length) {
      assessment.status = 'report_failed';
      await assessment.save();
      return res.status(422).json({ message: 'The call ended without a usable transcript.' });
    }
    const report = await createAssessmentReport(assessment.roleTitle, transcript);
    assessment.transcript = transcript;
    assessment.report = report;
    const hashPayload = assessmentHashPayload(assessment);
    assessment.hashPayload = hashPayload;
    assessment.reportHash = '0x' + crypto.createHash('sha256').update(hashPayload, 'utf8').digest('hex');
    assessment.status = 'completed';
    await assessment.save();
    return res.json({ success: true, reportHash: assessment.reportHash });
  } catch (error) {
    console.error('Could not process ProofCall transcript:', error.message);
    if (req.body?.assessmentId) {
      await Assessment.findByIdAndUpdate(req.body.assessmentId, { $set: { status: 'report_failed' } }).catch(() => {});
    }
    return res.status(500).json({ message: 'Assessment report generation failed.' });
  }
});

router.post('/assessments/:id/proof', auth, isRecruiter, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid assessment ID.' });
    const chainId = Number(req.body?.chainId);
    const txHash = String(req.body?.txHash || '');
    if (chainId !== 11155111 || !/^0x[a-f\d]{64}$/i.test(txHash)) {
      return res.status(400).json({ message: 'Provide a confirmed Sepolia transaction.' });
    }
    const [assessment, recruiter] = await Promise.all([
      Assessment.findOne({ _id: req.params.id, recruiter: req.user.id }).select('+hashPayload'),
      User.findById(req.user.id).select('walletAddress')
    ]);
    if (!assessment) return res.status(404).json({ message: 'Assessment was not found.' });
    if (!storedReportHashIsValid(assessment) || !recruiter?.walletAddress) {
      return res.status(409).json({ message: 'A completed report and connected recruiter wallet are required.' });
    }
    const expectedWallet = recruiter.walletAddress.toLowerCase();
    const provider = getSepoliaProvider();
    const [transaction, receipt] = await Promise.all([provider.getTransaction(txHash), provider.getTransactionReceipt(txHash)]);
    if (!transaction || !receipt || receipt.status !== 1 || Number(transaction.chainId) !== 11155111 || transaction.value !== 0n ||
        transaction.from.toLowerCase() !== expectedWallet || transaction.to?.toLowerCase() !== expectedWallet ||
        transaction.data.toLowerCase() !== assessment.reportHash.toLowerCase()) {
      return res.status(422).json({ message: 'This transaction does not contain the report hash from the connected recruiter wallet.' });
    }
    assessment.proof = {
      chainId: 11155111,
      txHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      anchoredAt: new Date(),
      walletAddress: transaction.from
    };
    await assessment.save();
    return res.json({ assessment: serialiseAssessment(assessment) });
  } catch (error) {
    console.error('Could not verify ProofCall transaction:', error.message);
    return res.status(502).json({ message: 'Sepolia transaction could not be verified. Try again after it confirms.' });
  }
});

router.get('/assessments/:id/verify', auth, isRecruiter, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid assessment ID.' });
    const assessment = await Assessment.findOne({ _id: req.params.id, recruiter: req.user.id }).select('+hashPayload');
    if (!assessment) return res.status(404).json({ message: 'Assessment was not found.' });
    if (!assessment.proof?.txHash || !assessment.reportHash) return res.status(409).json({ message: 'This report has not been anchored yet.' });
    const provider = getSepoliaProvider();
    const [transaction, receipt] = await Promise.all([
      provider.getTransaction(assessment.proof.txHash), provider.getTransactionReceipt(assessment.proof.txHash)
    ]);
    const valid = Boolean(storedReportHashIsValid(assessment) && transaction && receipt?.status === 1 && Number(transaction.chainId) === 11155111 && transaction.value === 0n &&
      transaction.to?.toLowerCase() === transaction.from.toLowerCase() &&
      transaction.data.toLowerCase() === assessment.reportHash.toLowerCase() &&
      transaction.from.toLowerCase() === String(assessment.proof.walletAddress).toLowerCase());
    return res.json({ valid, chainId: 11155111, txHash: assessment.proof.txHash, reportHash: assessment.reportHash });
  } catch (error) {
    console.error('Could not verify ProofCall anchor:', error.message);
    return res.status(502).json({ message: 'Blockchain verification is temporarily unavailable.' });
  }
});

module.exports = router;
