import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ArrowUpRight, Award, BriefcaseBusiness, CalendarDays, CircleHelp, Plus, Sparkles, Users } from 'lucide-react';

const dateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set';

export default function InternshipOverview() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/internships/organizer', { headers: { Authorization: `Bearer ${token}` } });
        setInternships(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load your internships right now.');
      } finally { setLoading(false); }
    };
    fetchInternships();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const active = internships.filter((item) => new Date(item.startDate).getTime() <= now && new Date(item.endDate).getTime() >= now).length;
    const pending = internships.reduce((total, item) => total + (item.certificateRequests || []).filter((request) => request.status === 'pending').length, 0);
    const participants = new Set(internships.flatMap((item) => item.participants || []).map((participant) => typeof participant === 'string' ? participant : participant?._id).filter(Boolean)).size;
    return [{ label: 'Internship records', value: internships.length, note: 'Created by your account', icon: BriefcaseBusiness, tone: 'violet' }, { label: 'Currently active', value: active, note: 'Based on internship dates', icon: Activity, tone: 'emerald' }, { label: 'Pending certificates', value: pending, note: 'Waiting for participant action', icon: Award, tone: 'amber' }, { label: 'Participants', value: participants, note: 'Unique linked accounts', icon: Users, tone: 'blue' }];
  }, [internships]);

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[26px] border border-primary-100 bg-gradient-to-br from-white via-primary-50 to-[#f1e9ff] px-6 py-8 shadow-[0_20px_55px_-38px_rgba(140,92,196,.35)] sm:px-9 sm:py-10">
      <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" /><div className="absolute bottom-[-130px] right-[23%] h-60 w-60 rounded-full bg-[#eadcff]/70 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-end"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-primary-700"><Sparkles size={13} /> Your organizer studio</span><h2 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900 sm:text-[40px] sm:leading-[1.1]">Good work deserves<br className="hidden sm:block" /> a <span className="bg-certi-gradient-purple bg-clip-text text-transparent">lasting record.</span></h2><p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">Create internships, send certificate requests, and keep each opportunity in one clear workspace.</p></div><Link to="/internships/create" className="inline-flex w-fit items-center gap-2 rounded-xl bg-certi-gradient-purple px-4 py-3 text-sm font-bold text-white shadow-button transition hover:-translate-y-0.5 hover:shadow-lg"><Plus size={17} /> Create internship <ArrowUpRight size={15} /></Link></div>
    </section>

    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_-10px_rgba(15,23,42,.22)]"><div className="flex items-start justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone === 'violet' ? 'bg-primary-50 text-primary-500' : tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}><Icon size={17} /></span></div><div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100" /> : value}</div><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>)}
    </section>

    <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-sm font-bold text-slate-900">Recently created</h3><p className="mt-1 text-[11px] text-slate-400">Your latest internship records</p></div><Link to="/internships/my-internships" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800">View all <ArrowRight size={14} /></Link></div>
        {error ? <div className="m-5 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-xl bg-slate-50" />)}</div> : internships.length === 0 ? <div className="px-6 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-500"><BriefcaseBusiness size={21} /></div><p className="mt-4 text-sm font-semibold text-slate-800">Your first internship starts here</p><p className="mt-1 text-xs text-slate-400">Create a record to send a participant their certificate request.</p><Link to="/internships/create" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-600"><Plus size={14} /> Create internship</Link></div> : <div className="divide-y divide-slate-100">{internships.slice(0, 4).map((item) => <Link key={item._id} to={`/internships/${item._id}`} className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800 group-hover:text-primary-600">{item.title}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400"><CalendarDays size={12} />{dateLabel(item.startDate)} – {dateLabel(item.endDate)}</p></div><ArrowUpRight size={16} className="shrink-0 text-slate-300 group-hover:text-primary-500" /></Link>)}</div>}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900">Quick actions</h3><p className="mt-1 text-[11px] text-slate-400">Pick up where you left off</p></div><span className="text-primary-500"><Sparkles size={17} /></span></div><div className="mt-5 space-y-2.5"><Link to="/internships/create" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-primary-200 hover:bg-primary-50/60"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-100 text-primary-600"><Plus size={17} /></span><span className="flex-1"><span className="block text-xs font-bold text-slate-800">New internship</span><span className="mt-0.5 block text-[10px] text-slate-400">Create and notify a participant</span></span><ArrowRight size={14} className="text-slate-300" /></Link><Link to="/internships/my-internships" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700"><BriefcaseBusiness size={16} /></span><span className="flex-1"><span className="block text-xs font-bold text-slate-800">Manage records</span><span className="mt-0.5 block text-[10px] text-slate-400">Review your internships</span></span><ArrowRight size={14} className="text-slate-300" /></Link><Link to="/internships/pending-invitations" className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-200 hover:bg-amber-50/50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700"><Award size={16} /></span><span className="flex-1"><span className="block text-xs font-bold text-slate-800">Certificate requests</span><span className="mt-0.5 block text-[10px] text-slate-400">Check pending participant requests</span></span><ArrowRight size={14} className="text-slate-300" /></Link></div><div className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3 text-[10px] leading-4 text-slate-500"><CircleHelp size={14} className="mt-0.5 shrink-0 text-slate-400" />Dashboard metrics reflect internship records available to this account.</div></section>
    </div>
  </div>;
}
