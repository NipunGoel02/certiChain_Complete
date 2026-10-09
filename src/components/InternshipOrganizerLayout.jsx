import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';

export default function InternshipOrganizerLayout() {
  const [activeLink, setActiveLink] = useState('my-internships');
  const { currentUser } = useAuth();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-[320px] shrink-0">
        <div className="h-full relative rounded-r-3xl overflow-hidden">
          {/* gradient panel */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_-200px_-200px,#8b5cf6_10%,transparent_40%),radial-gradient(900px_500px_at_120%_120%,#f97316_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#5b2aa6] via-[#6a2bbf] to-[#7c2ef5] opacity-90" />
          {/* soft circles */}
          <div className="absolute -left-16 -top-16 w-40 h-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10 p-6">
            {/* brand block */}
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl mx-auto">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 21V7a3 3 0 013-3h10a3 3 0 013 3v14M9 8h1m4 0h1M8 12h2m4 0h2m-9 9v-5a1 1 0 011-1h4a1 1 0 011 1v5" />
              </svg>
            </div>

            <h2 className="text-white text-2xl font-bold mt-4 text-center">Internship Portal</h2>
            <p className="text-indigo-200 text-xs text-center">Organizer Workspace</p>

            <div className="mt-4 px-4 py-2 bg-white/10 rounded-full text-center">
              <span className="text-white text-xs font-medium">{currentUser?.name || 'Organizer'}</span>
            </div>

            {/* nav */}
            <nav className="mt-8 space-y-3">
              <Link
                to="/internships/my-internships"
                onClick={() => setActiveLink('my-internships')}
                className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  activeLink === 'my-internships'
                    ? 'bg-white/20 text-white shadow-lg border-l-4 border-amber-400'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0-2V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">My Internships</div>
                  <div className="text-[11px] opacity-75 -mt-0.5">View all internship listings</div>
                </div>
              </Link>

              <Link
                to="/internships/create"
                onClick={() => setActiveLink('create')}
                className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  activeLink === 'create'
                    ? 'bg-white/20 text-white shadow-lg border-l-4 border-amber-400'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">Create Internship</div>
                  <div className="text-[11px] opacity-75 -mt-0.5">Post & notify candidates</div>
                </div>
              </Link>

              <Link
                to="/internships/analytics"
                onClick={() => setActiveLink('analytics')}
                className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-indigo-200 hover:bg-white/10 hover:text-white"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 15v4m4-8v8m4-12v12m4-6v6" />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">Analytics</div>
                  <div className="text-[11px] opacity-75 -mt-0.5">Stats & reports</div>
                </div>
              </Link>

              <Link
                to="/internships/candidates"
                onClick={() => setActiveLink('candidates')}
                className="group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-indigo-200 hover:bg-white/10 hover:text-white"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 10-8 0v5h8v-5zM12 7a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">Candidate Directory</div>
                  <div className="text-[11px] opacity-75 -mt-0.5">Manage applicants</div>
                </div>
              </Link>
            </nav>

            {/* CTA */}
            <div className="mt-8">
              <Link
                to="/internships/create"
                onClick={() => setActiveLink('create')}
                className="block w-full rounded-xl text-center font-semibold text-gray-900 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 px-4 py-3 shadow-xl"
              >
                🎯 Create New Internship
              </Link>
              <p className="text-[11px] text-white/80 text-center mt-1">Send notifications to candidates</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1">
        {/* top bar */}
        <div className="px-8 pt-8">
          <div className="rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Internship Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Manage postings and notify candidates seamlessly</p>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full grid place-items-center">3</span>
                </button>

                <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white grid place-items-center font-bold">
                    {(currentUser?.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-700">{currentUser?.name || 'Organizer'}</div>
                    <div className="text-[11px] text-gray-500">Organizer</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* stat chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
              {[
                { label: 'Total Internships', value: '128', color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-500' },
                { label: 'This Month', value: '14', color: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-500' },
                { label: 'Pending Reviews', value: '6', color: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-500' },
                { label: 'Active Candidates', value: '423', color: 'bg-fuchsia-100 text-fuchsia-700', iconBg: 'bg-fuchsia-500' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-white shadow-[0_6px_24px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} grid place-items-center text-white`}>
                    <span>■</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800 leading-none">{s.value}</div>
                    <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${s.color}`}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* routed content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
