import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: 'Hackathons', to: '/hackathons' },
    ...(currentUser?.role === 'user' ? [{ label: 'My profile', to: '/profile' }] : []),
    ...(currentUser?.role === 'internship' ? [{ label: 'Internship studio', to: '/internships' }] : []),
    ...(currentUser?.role === 'hackathon organizer' ? [{ label: 'Organizer studio', to: '/organizer/my-hackathons' }] : []),
    ...(currentUser?.role === 'recruiter' ? [{ label: 'Talent studio', to: '/recruiter' }] : []),
    ...(currentUser?.role === 'admin' ? [{ label: 'Admin', to: '/admin' }] : []),
  ];
  const handleLogout = async () => { await logout(); setOpen(false); navigate('/'); };
  const nav = (mobile = false) => links.map(({ label, to }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `cc-public-link${isActive ? ' is-active' : ''}${mobile ? ' cc-public-link--mobile' : ''}`}>{label}</NavLink>);

  return <header className="cc-public-header">
    <div className="cc-public-header__inner">
      <Link to="/" className="cc-brand" aria-label="CertiChain home"><img src="/CertiChain.png" alt="CertiChain" /></Link>
      <nav className="cc-public-nav" aria-label="Main navigation">{nav()}</nav>
      <div className="cc-public-actions">
        {currentUser ? <button className="cc-logout" onClick={handleLogout}><LogOut size={16} /><span>Log out</span></button> : <><Link className="cc-signin" to="/login">Sign in</Link><Link className="cc-button cc-button--primary" to="/signup">Get started</Link></>}
      </div>
      <button className="cc-menu-toggle cc-public-menu-toggle" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <nav className="cc-public-mobile" aria-label="Mobile navigation">{nav(true)}{currentUser ? <button className="cc-public-link cc-public-link--mobile" onClick={handleLogout}><LogOut size={16} />Log out</button> : <><Link className="cc-public-link cc-public-link--mobile" to="/login" onClick={() => setOpen(false)}>Sign in</Link><Link className="cc-public-link cc-public-link--mobile" to="/signup" onClick={() => setOpen(false)}>Create account</Link></>}</nav>}
  </header>;
}
