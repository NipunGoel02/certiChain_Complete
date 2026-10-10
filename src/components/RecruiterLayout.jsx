import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, BriefcaseBusiness, FileCheck2, LogOut, Search } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function RecruiterLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (currentUser?.name || 'Recruiter').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <div className="internship-portal min-h-screen bg-[#fbfaff] text-left text-gray-800">
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/95 shadow-[0_4px_18px_-16px_rgba(79,45,120,.25)] backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <Link to="/recruiter" aria-label="CertiChain recruiter home" className="flex shrink-0 items-center">
          <img src="/CertiChain.png" alt="CertiChain" className="h-7 w-auto object-contain sm:h-9" />
        </Link>
        <nav aria-label="Recruiter workspace" className="flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50/60 p-1">
          <NavLink to="/recruiter" end className={({ isActive }) => `inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${isActive ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-primary-700'}`}><Search size={14} /><span className="hidden sm:inline">Candidates</span></NavLink>
          <NavLink to="/recruiter/analytics" className={({ isActive }) => `inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${isActive ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-primary-700'}`}><Activity size={14} /><span className="hidden sm:inline">Analytics</span></NavLink>
          <NavLink to="/recruiter/assessments" className={({ isActive }) => `inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${isActive ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-primary-700'}`}><FileCheck2 size={14} /><span className="hidden sm:inline">ProofCall</span></NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 py-1 pl-1 pr-3 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-certi-gradient-purple text-[11px] font-bold text-white">{initials}</span>
            <span className="max-w-40 truncate text-xs font-semibold text-gray-700">{currentUser?.name || 'Recruiter'}</span>
          </div>
          <button onClick={handleLogout} aria-label="Logout" title="Logout" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"><LogOut size={14} /><span className="hidden sm:inline">Logout</span></button>
        </div>
      </div>
    </header>
    <main className="mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1520px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10"><Outlet /></main>
    <footer className="border-t border-primary-100 bg-white/80 px-4 py-5 text-center text-[10px] text-gray-400"><span className="font-semibold text-primary-600">CertiChain</span><span className="mx-2">·</span><BriefcaseBusiness className="mr-1 inline" size={12} />Recruiter workspace</footer>
  </div>;
}
