import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Clock3, Plus, Search, Sparkles } from 'lucide-react';

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set';
const getStatus = (internship) => {
  const now = Date.now();
  if (new Date(internship.startDate).getTime() > now) return { label: 'Upcoming', classes: 'bg-blue-50 text-blue-700 ring-blue-600/10' };
  if (new Date(internship.endDate).getTime() < now) return { label: 'Completed', classes: 'bg-slate-100 text-slate-600 ring-slate-500/10' };
  return { label: 'In progress', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' };
};

export default function MyInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/internships/organizer', { headers: { Authorization: `Bearer ${token}` } });
        setInternships(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch internships');
      } finally { setLoading(false); }
    };
    fetchInternships();
  }, []);

  const filteredInternships = useMemo(() => internships.filter((item) => `${item.title || ''} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase())), [internships, query]);

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-primary-600"><BriefcaseBusiness size={14} /> Your opportunities</div><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My internships</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Keep track of every internship record and the participant certificate request attached to it.</p></div><Link to="/internships/create" className="inline-flex w-fit items-center gap-2 rounded-xl bg-certi-gradient-purple px-4 py-3 text-sm font-semibold text-white shadow-button transition hover:-translate-y-0.5 hover:shadow-lg"><Plus size={16} /> New internship</Link></section>

    <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex items-center gap-2 text-xs text-slate-500"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-600"><BriefcaseBusiness size={15} /></span><span><strong className="text-slate-900">{loading ? '—' : internships.length}</strong> {internships.length === 1 ? 'internship record' : 'internship records'}</span></div><label className="relative block w-full sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search internships" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-primary-300 focus:ring-4 focus:ring-primary-100" /></label></div>

    {loading ? <div className="grid gap-4 xl:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div> : error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : filteredInternships.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-500"><Sparkles size={22} /></span><h3 className="mt-4 text-base font-bold text-slate-900">{query ? 'No matching internships' : 'No internships yet'}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{query ? 'Try a different title or keyword.' : 'Create your first internship record to get started.'}</p>{!query && <Link to="/internships/create" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"><Plus size={14} /> Create internship</Link>}</div> : <div className="grid gap-4 xl:grid-cols-2">{filteredInternships.map((internship, index) => {
      const status = getStatus(internship);
      const pendingRequests = (internship.certificateRequests || []).filter((request) => request.status === 'pending').length;
      return <article key={internship._id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_-20px_rgba(15,23,42,.3)] transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_18px_42px_-24px_rgba(91,62,170,.28)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-certi-gradient-purple" />
        <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3.5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><BriefcaseBusiness size={19} /></span><div className="min-w-0"><h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">{internship.title}</h3><span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${status.classes}`}>{status.label}</span></div></div><Link aria-label={`View ${internship.title} details`} to={`/internships/${internship._id}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"><ArrowUpRight size={16} /></Link></div>
        <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{internship.description || 'No description provided.'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-slate-400" />{formatDate(internship.startDate)} – {formatDate(internship.endDate)}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={13} className="text-slate-400" />{pendingRequests ? `${pendingRequests} certificate request${pendingRequests === 1 ? '' : 's'} pending` : 'No pending requests'}</span></div>
        <div className="mt-4 flex justify-end"><Link to={`/internships/${internship._id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800">View details <ArrowUpRight size={14} /></Link></div>
      </article>;
    })}</div>}
  </div>;
}
