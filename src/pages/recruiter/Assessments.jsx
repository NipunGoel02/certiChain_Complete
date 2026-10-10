import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { Activity, AlertCircle, Anchor, CheckCircle2, Clock3, ExternalLink, FileCheck2, PhoneCall, RefreshCw, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';

const statusLabels = {
  initiating: 'Preparing call',
  ringing: 'Calling candidate',
  in_progress: 'Interview in progress',
  completed: 'Report ready',
  no_answer: 'No answer',
  failed: 'Call failed',
  report_failed: 'Report could not be generated'
};

const statusTone = {
  initiating: 'bg-blue-50 text-blue-700',
  ringing: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-violet-50 text-violet-700',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-rose-50 text-rose-700',
  report_failed: 'bg-amber-50 text-amber-800'
};

function Score({ value }) {
  if (value === null || value === undefined) return <span className="text-xs font-semibold text-slate-400">Insufficient evidence</span>;
  return <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-800">{value}/4</span>;
}

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [transcripts, setTranscripts] = useState({});
  const [transcriptLoading, setTranscriptLoading] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [verification, setVerification] = useState({});

  const loadAssessments = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await apiClient.get('/recruiter/assessments');
      setAssessments(Array.isArray(data.assessments) ? data.assessments : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load recruiter assessments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
    const timer = window.setInterval(() => loadAssessments(true), 8000);
    return () => window.clearInterval(timer);
  }, [loadAssessments]);

  const anchorReport = async (assessment) => {
    setBusyId(assessment._id);
    setNotice({ type: '', message: '' });
    try {
      if (!window.ethereum) throw new Error('MetaMask is required to anchor a report on Sepolia.');
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      let network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        await provider.send('wallet_switchEthereumChain', [{ chainId: '0xaa36a7' }]);
        network = await provider.getNetwork();
      }
      if (Number(network.chainId) !== 11155111) throw new Error('Switch MetaMask to Sepolia and retry.');
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      await apiClient.patch('/auth/wallet', { walletAddress });
      const transaction = await signer.sendTransaction({
        to: walletAddress,
        value: 0n,
        data: assessment.reportHash
      });
      setNotice({ type: 'pending', message: 'Report hash transaction sent. Waiting for Sepolia confirmation…' });
      await transaction.wait();
      const { data } = await apiClient.post(`/recruiter/assessments/${assessment._id}/proof`, {
        chainId: 11155111,
        txHash: transaction.hash
      });
      setAssessments((items) => items.map((item) => item._id === assessment._id ? data.assessment : item));
      setNotice({ type: 'success', message: 'Report hash anchored and verified on Sepolia.' });
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || err.message || 'Could not anchor this report.' });
    } finally {
      setBusyId('');
    }
  };

  const verifyReport = async (assessment) => {
    setBusyId(assessment._id);
    setNotice({ type: '', message: '' });
    try {
      const { data } = await apiClient.get(`/recruiter/assessments/${assessment._id}/verify`);
      setVerification((existing) => ({ ...existing, [assessment._id]: data.valid }));
      setNotice({ type: data.valid ? 'success' : 'error', message: data.valid ? 'The on-chain transaction matches this report hash.' : 'The on-chain proof does not match the stored report.' });
    } catch (err) {
      setNotice({ type: 'error', message: err.response?.data?.message || 'Could not verify this transaction.' });
    } finally {
      setBusyId('');
    }
  };

  const loadTranscript = async (assessmentId) => {
    if (transcripts[assessmentId] || transcriptLoading[assessmentId]) return;
    setTranscriptLoading((items) => ({ ...items, [assessmentId]: true }));
    try {
      const { data } = await apiClient.get(`/recruiter/assessments/${assessmentId}`);
      setTranscripts((items) => ({ ...items, [assessmentId]: data.assessment.transcript || [] }));
    } catch {
      setTranscripts((items) => ({ ...items, [assessmentId]: [] }));
    } finally {
      setTranscriptLoading((items) => ({ ...items, [assessmentId]: false }));
    }
  };

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[26px] border border-primary-100 bg-gradient-to-br from-white via-primary-50 to-[#f1e9ff] px-6 py-8 shadow-[0_20px_55px_-38px_rgba(140,92,196,.35)] sm:px-9 sm:py-9">
      <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" />
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
        <div><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-primary-700"><PhoneCall size={13} /> ProofCall</span><h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-[38px]">Assessment <span className="bg-certi-gradient-purple bg-clip-text text-transparent">reports</span></h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Review technical evidence from role-based AI calls and anchor a report hash on Sepolia for independent verification.</p></div>
        <button type="button" onClick={() => loadAssessments(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-xs font-bold text-primary-700 shadow-sm hover:bg-primary-50 disabled:opacity-60"><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
      </div>
    </section>

    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs leading-5 text-blue-900"><strong>Candidate privacy:</strong> calls use the saved account number, which is not shown in this portal. The AI identifies itself and tells the candidate the transcript will be saved and shared with the recruiter. Reports and transcripts stay off-chain; only a SHA-256 hash is sent to Sepolia.</div>
    {notice.message && <div role="status" className={`rounded-xl border p-3 text-xs ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : notice.type === 'pending' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{notice.message}</div>}
    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">{error}</div>}
    {loading ? <div className="grid min-h-56 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400"><span className="inline-flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> Loading assessment reports…</span></div> : assessments.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Activity size={28} className="mx-auto text-primary-300" /><p className="mt-3 text-sm font-semibold text-slate-800">No ProofCalls yet</p><p className="mt-1 text-xs text-slate-500">Choose a role in Candidates and click Call candidate to begin.</p></div> : <div className="space-y-4">
      {assessments.map((assessment) => {
        const report = assessment.report;
        return <article key={assessment._id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_-22px_rgba(15,23,42,.25)]">
          <div className="h-1 bg-certi-gradient-purple" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900">{assessment.candidateName}</h2><p className="mt-1 text-xs text-slate-500">{assessment.roleTitle} <span className="mx-1.5">·</span> {new Date(assessment.createdAt).toLocaleString()}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusTone[assessment.status] || 'bg-slate-100 text-slate-600'}`}>{statusLabels[assessment.status] || assessment.status}</span></div>
            {['initiating', 'ringing', 'in_progress'].includes(assessment.status) && <p className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-xs text-blue-800"><PhoneCall size={15} className="animate-pulse" /> The agent is calling or speaking with the candidate. This page refreshes automatically.</p>}
            {assessment.status === 'no_answer' && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-3 text-xs text-amber-800">The candidate did not answer or the carrier could not connect the call. You can retry from Candidates.</p>}
            {assessment.status === 'failed' && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-3 text-xs text-rose-700">The call could not be started. Check the LiveKit outbound trunk and candidate mobile number.</p>}
            {assessment.status === 'report_failed' && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-3 text-xs text-amber-800">The call finished, but the report could not be processed. Check the voice-worker callback secret and Gemini configuration.</p>}
            {report && <>
              <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">Summary</p><p className="mt-2 text-sm leading-6 text-slate-700">{report.summary}</p>{!report.assessmentAvailable && <p className="mt-2 text-xs font-semibold text-amber-700">No skill rating: the call did not provide enough candidate responses.</p>}</div>
              {report.skillDimensions?.length > 0 && <div className="mt-5"><h3 className="text-xs font-bold text-slate-800">Technical signals</h3><div className="mt-2 grid gap-3 md:grid-cols-2">{report.skillDimensions.map((dimension, index) => <div key={`${dimension.name}-${index}`} className="rounded-xl border border-slate-200 p-3.5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-800">{dimension.name}</span><Score value={dimension.score} /></div>{dimension.evidence?.length > 0 ? <ul className="mt-2 space-y-1.5">{dimension.evidence.map((quote, quoteIndex) => <li key={quoteIndex} className="border-l-2 border-primary-300 pl-2.5 text-[11px] leading-5 text-slate-600">“{quote}”</li>)}</ul> : <p className="mt-2 text-[11px] text-slate-400">No direct supporting quote retained</p>}</div>)}</div></div>}
              <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><h3 className="text-xs font-bold text-emerald-900">Observed strengths</h3>{report.strengths?.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-emerald-900/80">{report.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No strengths recorded</p>}</div><div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4"><h3 className="text-xs font-bold text-amber-900">Areas to explore</h3>{report.areasToExplore?.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-900/80">{report.areasToExplore.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No follow-up areas recorded</p>}</div></div>
              {report.limitations?.length > 0 && <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>Limitations: {report.limitations.join(' · ')}</span></div>}
              <details className="mt-5 rounded-xl border border-slate-200" onToggle={(event) => { if (event.currentTarget.open) loadTranscript(assessment._id); }}><summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-700">View call transcript</summary><div className="max-h-80 space-y-2 overflow-y-auto border-t border-slate-100 px-4 py-3">{transcriptLoading[assessment._id] ? <p className="text-xs text-slate-500">Loading transcript…</p> : (transcripts[assessment._id] || []).map((item, index) => <div key={`${item.at}-${index}`} className="text-xs leading-5"><strong className={item.speaker === 'candidate' ? 'text-primary-700' : 'text-slate-500'}>{item.speaker === 'candidate' ? assessment.candidateName : 'CertiChain AI'}:</strong><span className="ml-2 text-slate-700">{item.text}</span></div>)}</div></details>
              <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50/40 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-xs font-bold text-slate-800"><ShieldCheck size={15} className="text-primary-600" /> Tamper-evident report proof</p><p className="mt-1 text-[10px] leading-4 text-slate-500">The recruiter wallet sends the report digest to itself on Sepolia. Report and transcript stay in CertiChain.</p><code className="mt-3 block break-all rounded-lg bg-white px-3 py-2 text-[10px] text-slate-600">{assessment.reportHash}</code></div><div className="flex flex-wrap gap-2">{assessment.proof?.txHash ? <><button type="button" onClick={() => verifyReport(assessment)} disabled={busyId === assessment._id} className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-[11px] font-bold text-primary-700 disabled:opacity-60"><FileCheck2 size={14} />{busyId === assessment._id ? 'Checking…' : 'Verify proof'}</button><a href={`https://sepolia.etherscan.io/tx/${assessment.proof.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600"><ExternalLink size={13} /> Etherscan</a></> : <button type="button" onClick={() => anchorReport(assessment)} disabled={busyId === assessment._id || !assessment.reportHash} className="inline-flex items-center gap-2 rounded-lg bg-certi-gradient-purple px-3 py-2 text-[11px] font-bold text-white disabled:opacity-60"><Anchor size={14} />{busyId === assessment._id ? 'Waiting…' : 'Anchor report hash'}</button>}</div></div>{assessment.proof?.txHash && <p className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500"><CheckCircle2 size={13} className={verification[assessment._id] === false ? 'text-rose-600' : 'text-emerald-600'} />{verification[assessment._id] === true ? 'Verified from the Sepolia transaction' : verification[assessment._id] === false ? 'Proof did not match' : `Anchored in block ${assessment.proof.blockNumber || 'confirmed'}`}<span>·</span><code className="break-all">{assessment.proof.txHash}</code></p>}</div>
            </>}
          </div>
        </article>;
      })}
    </div>}
    <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400"><Clock3 size={12} /> AI-generated technical observations support recruiter review; they do not make a hiring decision.</p>
  </div>;
}
