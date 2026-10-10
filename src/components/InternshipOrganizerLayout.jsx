import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { Activity, Award, BriefcaseBusiness, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';

const navigation = [
  { label: 'Overview', to: '/internships', icon: LayoutDashboard, exact: true },
  { label: 'My Internships', to: '/internships/my-internships', icon: BriefcaseBusiness },
  { label: 'Create Internship', to: '/internships/create', icon: Plus },
  { label: 'Certificate Requests', to: '/internships/pending-invitations', icon: Award },
  { label: 'Analytics Preview', to: '/internships/analytics', icon: Activity },
];

export default function InternshipOrganizerLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = navigation.find((item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to));
  const initials = (currentUser?.name || 'Organizer').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="internship-portal min-h-screen w-full max-w-full overflow-x-clip bg-[#fbfaff] text-left text-gray-800">
      <header className="sticky top-0 z-40 w-full max-w-full border-b border-primary-100 bg-white/95 shadow-[0_4px_18px_-16px_rgba(79,45,120,.25)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          <Link to="/internships" aria-label="CertiChain organizer home" className="flex shrink-0 items-center">
            <img src="/CertiChain.png" alt="CertiChain" className="h-7 w-auto object-contain sm:h-9" />
          </Link>

          <nav aria-label="Primary internship navigation" className="hidden shrink-0 items-center gap-1 sm:gap-2 md:flex">
            {navigation.filter(({ to }) => ['/internships/my-internships', '/internships/create'].includes(to)).map(({ label, to, icon: Icon }) => {
              const selected = location.pathname === to;
              return <Link key={to} to={to} aria-label={label} title={label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[10px] font-bold transition sm:gap-2 sm:px-3.5 sm:text-xs ${selected ? 'bg-primary-100 text-primary-800' : 'bg-primary-50/70 text-primary-700 hover:bg-primary-100'}`}>
                <Icon size={14} strokeWidth={2.2} /><span className="hidden lg:inline">{label}</span>
              </Link>;
            })}
          </nav>

          <nav aria-label="Additional internship navigation" className="hidden min-w-0 items-center gap-1 xl:flex">
            {navigation.filter(({ to }) => !['/internships/my-internships', '/internships/create'].includes(to)).map(({ label, to, icon: Icon, exact }) => {
              const selected = exact ? location.pathname === to : location.pathname.startsWith(to);
              return <Link key={to} to={to} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${selected ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-primary-50/70 hover:text-primary-700'}`}>
                <Icon size={15} strokeWidth={2} />{label}
              </Link>;
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 py-1 pl-1 pr-3 xl:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-certi-gradient-purple text-[11px] font-bold text-white">{initials}</span>
              <span className="max-w-32 truncate text-xs font-semibold text-gray-700">{currentUser?.name || 'Organizer'}</span>
            </div>
            <button onClick={handleLogout} aria-label="Logout" title="Logout" className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-gray-500 transition hover:bg-primary-50 hover:text-primary-700 sm:px-3"><LogOut size={14} /><span className="hidden lg:inline">Logout</span></button>
            <button aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileNavOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-primary-100 text-primary-700 xl:hidden">{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>

        <nav className={`${mobileNavOpen ? 'grid' : 'hidden'} grid-cols-2 gap-2 border-t border-primary-100 bg-white px-4 py-3 xl:hidden`}>
          {navigation.map(({ label, to, icon: Icon, exact }) => {
            const selected = exact ? location.pathname === to : location.pathname.startsWith(to);
            return <Link key={to} to={to} onClick={() => setMobileNavOpen(false)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition ${selected ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}><Icon size={14} />{label}</Link>;
          })}
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-[11px] font-semibold text-gray-600 hover:bg-primary-50 hover:text-primary-700"><LogOut size={14} />Logout</button>
        </nav>
      </header>

      <main className="mx-auto min-h-[calc(100vh-74px)] w-full max-w-[1520px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10"><Outlet /></main>
      <footer className="border-t border-primary-100 bg-white/80 px-4 py-5 text-center text-[10px] text-gray-400"><span className="font-semibold text-primary-600">CertiChain</span><span className="mx-2">·</span>Organizer workspace</footer>
    </div>
  );
}
