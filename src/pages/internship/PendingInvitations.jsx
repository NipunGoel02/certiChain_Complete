import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Award, CalendarDays, Inbox, Sparkles } from 'lucide-react';

export default function PendingInvitations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/internships/certificates/requests', { headers: { Authorization: `Bearer ${token}` } });
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pending certificate requests');
      } finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  return <div className="space-y-6">
    <section><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-amber-600"><Award size={14} /> Certificate inbox</div><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pending certificate requests</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Requests waiting for a certificate to be reviewed and minted.</p></section>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Inbox size={18} /></span><span><strong className="block text-sm text-slate-900">{loading ? 'Loading…' : `${requests.length} pending`}</strong><span className="mt-0.5 block text-[11px] text-slate-400">Requests associated with this signed-in account</span></span></div>
    {loading ? <div className="space-y-3">{[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div> : error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : requests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Inbox size={22} /></span><h3 className="mt-4 text-base font-bold text-slate-900">You’re all caught up</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">There are no pending certificate requests for this account right now.</p></div> : <div className="space-y-3">{requests.map((request) => <article key={request.requestId} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"><div className="flex items-start gap-3.5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><Award size={19} /></span><div><h3 className="text-sm font-bold text-slate-900">{request.internshipTitle}</h3><p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-slate-400"><CalendarDays size={13} />Requested {new Date(request.requestedAt).toLocaleString()}</p><p className="mt-2 text-[11px] text-slate-500">Certificate request is ready to review.</p></div></div><button onClick={() => navigate(`/internships/certificate/${request.internshipId}`)} className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary-600">Review & mint <ArrowUpRight size={14} /></button></article>)}</div>}
    <div className="flex gap-2 rounded-xl bg-primary-50/70 p-3 text-[10px] leading-4 text-primary-700"><Sparkles size={14} className="mt-0.5 shrink-0" />Minting is completed from the certificate page after reviewing the request details.</div>
  </div>;
}
