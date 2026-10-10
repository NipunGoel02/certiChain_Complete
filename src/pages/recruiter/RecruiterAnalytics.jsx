import { useEffect, useMemo, useState } from 'react';
import { Activity, Award, BookOpenCheck, BriefcaseBusiness, RefreshCw, Users } from 'lucide-react';
import apiClient from '../../services/apiClient';

const palette = ['#8b5cf6', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
const statusColors = { pending: '#f59e0b', accepted: '#3b82f6', minted: '#22c55e', rejected: '#f43f5e' };

function Panel({ title, subtitle, children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_-22px_rgba(15,23,42,.25)] sm:p-6 ${className}`}>
    <div className="mb-5"><h2 className="text-sm font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}</div>
    {children}
  </section>;
}

function DonutChart({ segments, total, centerLabel }) {
  let cursor = 0;
  const stops = segments.filter((segment) => segment.value > 0).map((segment) => {
    const start = cursor;
    cursor += (segment.value / Math.max(total, 1)) * 100;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  const background = total > 0 && stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#e2e8f0 0% 100%)';

  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
    <div className="relative h-40 w-40 shrink-0 rounded-full p-[15px]" role="img" aria-label={`${total} ${centerLabel.toLowerCase()}`} style={{ background }}>
      <div className="grid h-full w-full place-content-center rounded-full bg-white text-center shadow-inner"><strong className="text-3xl tracking-tight text-slate-900">{total}</strong><span className="mt-0.5 max-w-24 text-[10px] leading-3 text-slate-400">{centerLabel}</span></div>
    </div>
    <div className="w-full space-y-3 sm:max-w-[220px]">
      {segments.map((segment) => <div key={segment.label} className="flex items-center gap-2.5 text-xs"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} /><span className="min-w-0 flex-1 truncate text-slate-500">{segment.label}</span><strong className="text-slate-800">{segment.value}</strong><span className="w-9 text-right text-[10px] text-slate-400">{total ? Math.round((segment.value / total) * 100) : 0}%</span></div>)}
    </div>
  </div>;
}

function BarList({ items, emptyLabel = 'No records yet' }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (!items.length) return <div className="grid min-h-36 place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">{emptyLabel}</div>;
  return <div className="space-y-4">{items.map((item, index) => <div key={item.label}>
    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate font-medium text-slate-600" title={item.label}>{item.label}</span><strong className="shrink-0 text-slate-800">{item.value}</strong></div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(item.value ? 5 : 0, (item.value / max) * 100)}%`, backgroundColor: item.color || palette[index % palette.length] }} /></div>
  </div>)}</div>;
}

function MetricCard({ label, value, note, icon: Icon, tone }) {
  const tones = { violet: 'bg-primary-50 text-primary-600', blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' };
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_-10px_rgba(15,23,42,.22)]"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[10px] text-slate-400">{note}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span></div></article>;
}

export default function RecruiterAnalytics() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiClient.get('/recruiter/candidates')
      .then(({ data }) => { if (active) setCandidates(Array.isArray(data.candidates) ? data.candidates : []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Analytics could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const analytics = useMemo(() => {
    const courseStatusCounts = { completed: 0, enrolled: 0 };
    const categories = new Map();
    const coursePopularity = new Map();
    const internshipCounts = new Map();
    const certificateStatuses = { pending: 0, accepted: 0, minted: 0, rejected: 0 };
    let courseRecords = 0;
    let completedLearners = 0;
    let internshipLearners = 0;

    candidates.forEach((candidate) => {
      let hasCompletedCourse = false;
      candidate.courses.forEach((course) => {
        courseRecords += 1;
        if (course.status === 'completed') {
          courseStatusCounts.completed += 1;
          hasCompletedCourse = true;
        } else {
          courseStatusCounts.enrolled += 1;
        }
        if (course.category) {
          if (!categories.has(course.category)) categories.set(course.category, new Set());
          categories.get(course.category).add(String(candidate._id));
        }
        if (!coursePopularity.has(course.title)) coursePopularity.set(course.title, new Set());
        coursePopularity.get(course.title).add(String(candidate._id));
      });
      if (hasCompletedCourse) completedLearners += 1;
      if (candidate.internships.length) internshipLearners += 1;
      candidate.internships.forEach((internship) => {
        if (!internshipCounts.has(internship.title)) internshipCounts.set(internship.title, new Set());
        internshipCounts.get(internship.title).add(String(candidate._id));
      });
      candidate.certificateRequests.forEach((request) => {
        if (certificateStatuses[request.status] !== undefined) certificateStatuses[request.status] += 1;
      });
    });

    const toBars = (map) => [...map.entries()].map(([label, people]) => ({ label, value: people.size })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)).slice(0, 7);
    const requestTotal = Object.values(certificateStatuses).reduce((sum, value) => sum + value, 0);
    return {
      courseRecords,
      courseStatusCounts,
      categories: toBars(categories),
      popularCourses: toBars(coursePopularity),
      internships: toBars(internshipCounts),
      certificateStatuses,
      requestTotal,
      completedLearners,
      internshipLearners
    };
  }, [candidates]);

  const metrics = [
    { label: 'Learner accounts', value: candidates.length, note: 'All learner accounts in the database', icon: Users, tone: 'violet' },
    { label: 'Completed a course', value: analytics.completedLearners, note: 'Learners with a completion record', icon: BookOpenCheck, tone: 'emerald' },
    { label: 'Joined an internship', value: analytics.internshipLearners, note: 'At least one participation record', icon: BriefcaseBusiness, tone: 'blue' },
    { label: 'Certificate requests', value: analytics.requestTotal, note: 'Request records saved in the database', icon: Award, tone: 'amber' }
  ];

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[26px] border border-primary-100 bg-gradient-to-br from-white via-primary-50 to-[#f1e9ff] px-6 py-8 shadow-[0_20px_55px_-38px_rgba(140,92,196,.35)] sm:px-9 sm:py-9">
      <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-primary-700"><Activity size={13} /> Recruiter insights</span><h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-[38px]">Talent <span className="bg-certi-gradient-purple bg-clip-text text-transparent">analytics</span></h1><p className="mt-2 text-sm text-gray-600">A live summary of learner, course, internship, and certificate-request records.</p></div><button onClick={() => setRefreshKey((value) => value + 1)} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2.5 text-xs font-bold text-primary-700 shadow-sm transition hover:bg-primary-50 disabled:opacity-60"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh data</button></div>
    </section>

    {error ? <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">{error}</div> : loading ? <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400"><span className="inline-flex items-center gap-2"><RefreshCw size={16} className="animate-spin" /> Loading database analytics…</span></div> : <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} value={loading ? '—' : metric.value} />)}</section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Course records" subtitle="Completed and enrolled records currently saved for learners"><DonutChart total={analytics.courseRecords} centerLabel="course records" segments={[{ label: 'Completed', value: analytics.courseStatusCounts.completed, color: '#22c55e' }, { label: 'Enrolled', value: analytics.courseStatusCounts.enrolled, color: '#8b5cf6' }]} /></Panel>
        <Panel title="Certificate request status" subtitle="Internship certificate-request states stored in the database"><DonutChart total={analytics.requestTotal} centerLabel="requests" segments={Object.entries(analytics.certificateStatuses).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value, color: statusColors[label] }))} /></Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Learners by course field" subtitle="Unique learners represented in each course category"><BarList items={analytics.categories} emptyLabel="No course categories saved" /></Panel>
        <Panel title="Most popular courses" subtitle="Learner count per course record"><BarList items={analytics.popularCourses} emptyLabel="No course records saved" /></Panel>
      </section>

      <Panel title="Internship participation" subtitle="Learner counts for internship records; participation is shown as stored"><BarList items={analytics.internships} emptyLabel="No internship participation records saved" /></Panel>
      <p className="text-center text-[10px] text-slate-400">Analytics reflect saved database records. NFT images and blockchain data are not included.</p>
    </>}
  </div>;
}
