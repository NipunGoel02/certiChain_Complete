import { useEffect, useMemo, useState } from 'react';
import { Award, BookOpenCheck, BriefcaseBusiness, PhoneCall, Search, SlidersHorizontal, Users } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Link } from 'react-router-dom';

const assessmentRoles = [
  { key: 'full-stack-intern', title: 'Full Stack Intern' },
  { key: 'frontend-intern', title: 'Frontend Intern' },
  { key: 'backend-intern', title: 'Backend Intern' }
];

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
const certificateTone = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  accepted: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  minted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/10'
};

function FilterSelect({ label, value, onChange, children }) {
  return <label className="block min-w-0 flex-1">
    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
      {children}
    </select>
  </label>;
}

export default function CandidateDirectory() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [category, setCategory] = useState('');
  const [internshipId, setInternshipId] = useState('');
  const [courseStatus, setCourseStatus] = useState('');
  const [certificateStatus, setCertificateStatus] = useState('');
  const [assessmentRole, setAssessmentRole] = useState(assessmentRoles[0].key);
  const [callingCandidate, setCallingCandidate] = useState('');
  const [callNotice, setCallNotice] = useState({ type: '', message: '' });

  useEffect(() => {
    let active = true;
    apiClient.get('/recruiter/candidates')
      .then(({ data }) => { if (active) setCandidates(Array.isArray(data.candidates) ? data.candidates : []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Candidate records could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const courses = useMemo(() => {
    const byId = new Map();
    candidates.forEach((candidate) => candidate.courses.forEach((course) => byId.set(String(course._id), course)));
    return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [candidates]);
  const categories = useMemo(() => uniqueSorted(courses.map((course) => course.category)), [courses]);
  const internships = useMemo(() => {
    const byId = new Map();
    candidates.forEach((candidate) => candidate.internships.forEach((item) => byId.set(String(item._id), item)));
    return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [candidates]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const courseMatch = (!courseId || candidate.courses.some((course) => String(course._id) === courseId)) &&
        (!category || candidate.courses.some((course) => course.category === category)) &&
        (!courseStatus || candidate.courses.some((course) => course.status === courseStatus));
      const internshipMatch = !internshipId || candidate.internships.some((item) => String(item._id) === internshipId);
      const certificateMatch = !certificateStatus || candidate.certificateRequests.some((request) => request.status === certificateStatus);
      const searchable = [candidate.name,
        ...candidate.courses.flatMap((course) => [course.title, course.category]),
        ...candidate.internships.flatMap((item) => [item.title, item.description])
      ].join(' ').toLowerCase();
      return courseMatch && internshipMatch && certificateMatch && (!query || searchable.includes(query));
    });
  }, [candidates, search, courseId, category, internshipId, courseStatus, certificateStatus]);

  const stats = useMemo(() => [
    { label: 'Learner accounts', value: candidates.length, icon: Users, tone: 'violet' },
    { label: 'Course records', value: candidates.reduce((sum, item) => sum + item.courses.length, 0), icon: BookOpenCheck, tone: 'blue' },
    { label: 'Internship links', value: candidates.reduce((sum, item) => sum + item.internships.length, 0), icon: BriefcaseBusiness, tone: 'emerald' },
    { label: 'Certificate requests', value: candidates.reduce((sum, item) => sum + item.certificateRequests.length, 0), icon: Award, tone: 'amber' }
  ], [candidates]);

  const clearFilters = () => { setSearch(''); setCourseId(''); setCategory(''); setInternshipId(''); setCourseStatus(''); setCertificateStatus(''); };

  const startAssessment = async (candidate) => {
    setCallingCandidate(candidate._id);
    setCallNotice({ type: '', message: '' });
    try {
      const { data } = await apiClient.post('/recruiter/assessments', { candidateId: candidate._id, roleKey: assessmentRole });
      setCallNotice({ type: 'success', message: `ProofCall started for ${data.assessment.candidateName}. Track the call and report in Assessments.` });
    } catch (err) {
      setCallNotice({ type: 'error', message: err.response?.data?.message || 'The call could not be started.' });
    } finally {
      setCallingCandidate('');
    }
  };

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[26px] border border-primary-100 bg-gradient-to-br from-white via-primary-50 to-[#f1e9ff] px-6 py-8 shadow-[0_20px_55px_-38px_rgba(140,92,196,.35)] sm:px-9 sm:py-10">
      <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" />
      <div className="relative z-10 max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-primary-700"><Search size={13} /> Talent search</span><h1 className="mt-5 text-3xl font-semibold tracking-tight text-gray-900 sm:text-[40px] sm:leading-[1.1]">Find your next <span className="bg-certi-gradient-purple bg-clip-text text-transparent">great teammate.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">Explore learner course records, internship participation, and certificate request history in CertiChain.</p></div>
    </section>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_-10px_rgba(15,23,42,.22)] sm:p-5"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold text-slate-500 sm:text-xs">{label}</span><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${tone === 'violet' ? 'bg-primary-50 text-primary-500' : tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Icon size={16} /></span></div><div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{loading ? '—' : value}</div></article>)}
    </section>

    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_-22px_rgba(15,23,42,.25)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Candidate filters</h2><p className="mt-1 text-[11px] text-slate-400">Combine fields to narrow down learner records</p></div><button onClick={clearFilters} className="text-[11px] font-semibold text-primary-600 hover:text-primary-800">Reset</button></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="block sm:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">Search profiles</span><span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100"><Search size={15} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, course, category, or internship" className="w-full border-0 p-0 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0" /></span></label>
        <FilterSelect label="Course" value={courseId} onChange={setCourseId}><option value="">Any course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</FilterSelect>
        <FilterSelect label="Course field" value={category} onChange={setCategory}><option value="">Any field</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</FilterSelect>
        <FilterSelect label="Course record" value={courseStatus} onChange={setCourseStatus}><option value="">Enrolled or completed</option><option value="completed">Completed</option><option value="enrolled">Enrolled</option></FilterSelect>
        <FilterSelect label="Internship participation" value={internshipId} onChange={setInternshipId}><option value="">Any internship</option>{internships.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</FilterSelect>
        <FilterSelect label="Certificate request" value={certificateStatus} onChange={setCertificateStatus}><option value="">Any request status</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="minted">Marked minted</option><option value="rejected">Rejected</option></FilterSelect>
      </div>
    </section>

    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-900">Candidates <span className="ml-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] text-primary-700">{filtered.length}</span></h2><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">Assessment role<select value={assessmentRole} onChange={(event) => setAssessmentRole(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:border-primary-300">{assessmentRoles.map((role) => <option key={role.key} value={role.key}>{role.title}</option>)}</select></label><Link to="/recruiter/assessments" className="rounded-lg border border-primary-200 bg-white px-3 py-2 text-[11px] font-bold text-primary-700 hover:bg-primary-50">Assessment reports</Link><span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><SlidersHorizontal size={12} /> Database records</span></div></div>
      {callNotice.message && <div role="status" className={`mb-4 rounded-xl border p-3 text-xs ${callNotice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{callNotice.message}</div>}
      {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : loading ? <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((id) => <div key={id} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}</div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Users className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-semibold text-slate-700">No matching candidates</p><p className="mt-1 text-xs text-slate-400">Try clearing one or more filters.</p></div> : <div className="grid gap-4 lg:grid-cols-2">{filtered.map((candidate) => <article key={candidate._id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_28px_-22px_rgba(15,23,42,.25)]"><div className="h-1 bg-certi-gradient-purple" /><div className="p-5 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-50 text-sm font-bold text-primary-700">{candidate.profilePicture ? <img src={candidate.profilePicture.startsWith('http') ? candidate.profilePicture : `${import.meta.env.VITE_BACKEND_URL || 'https://nft-project-2y3b.onrender.com'}${candidate.profilePicture}`} alt="" className="h-full w-full object-cover" /> : (candidate.name || 'U').slice(0, 1).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate text-sm font-bold text-slate-900">{candidate.name}</h3><p className="mt-0.5 text-[10px] text-slate-400">CertiChain learner</p></div><span className="ml-auto rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">Profile</span></div>
        <div className="mt-5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">Courses · {candidate.courses.length}</p>{candidate.courses.length ? <div className="mt-2 flex flex-wrap gap-1.5">{candidate.courses.map((course) => <span key={course._id} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${course.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{course.title} · {course.status}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">No course records</p>}</div>
        <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">Internships · {candidate.internships.length}</p>{candidate.internships.length ? <div className="mt-2 flex flex-wrap gap-1.5">{candidate.internships.map((item) => <span key={item._id} title={item.description} className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-semibold text-primary-700">{item.title} · participant</span>)}</div> : <p className="mt-2 text-xs text-slate-400">No internship records</p>}</div>
        <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">Certificate requests · {candidate.certificateRequests.length}</p>{candidate.certificateRequests.length ? <div className="mt-2 flex flex-wrap gap-1.5">{candidate.certificateRequests.map((request, index) => <span key={`${request.internshipTitle}-${index}`} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${certificateTone[request.status] || 'bg-slate-50 text-slate-600 ring-slate-500/10'}`}>{request.internshipTitle} · {request.status}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">No certificate request records</p>}</div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-[10px] leading-4 text-slate-400">Calls the saved account number and starts a role-based AI interview.</p><button type="button" onClick={() => startAssessment(candidate)} disabled={Boolean(callingCandidate)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-certi-gradient-purple px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"><PhoneCall size={14} />{callingCandidate === candidate._id ? 'Starting…' : 'Call candidate'}</button></div>
      </div></article>)}</div>}
    </section>
  </div>;
}
