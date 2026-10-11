import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function WorkspaceShell({ title, navItems, footerLabel = 'Workspace' }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (currentUser?.name || currentUser?.email || 'C')
    .trim().split(/[\s@]+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return <div className="cc-workspace">
    <a className="cc-skip-link" href="#workspace-main">Skip to main content</a>
    <button type="button" className="cc-menu-toggle" aria-label={menuOpen ? 'Close workspace navigation' : 'Open workspace navigation'} aria-expanded={menuOpen} aria-controls="workspace-sidebar" onClick={() => setMenuOpen((open) => !open)}>
      {menuOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
    {menuOpen && <button className="cc-sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="cc-workspace__layout">
      <aside id="workspace-sidebar" className={`cc-sidebar${menuOpen ? ' is-open' : ''}`} aria-label={`${title} sidebar`}>
        <div className="cc-sidebar__brand"><Link to="/" aria-label="CertiChain home"><img src="/CertiChain.png" alt="CertiChain" /></Link><span className="cc-sidebar__workspace"><span className="cc-sidebar__workspace-mark">{title.slice(0, 1).toUpperCase()}</span><span><small>WORKSPACE</small><strong>{title}</strong></span></span></div>
        <div className="cc-sidebar__section-label">MENU</div>
        <nav className="cc-workspace__nav" aria-label={`${title} navigation`}>
          {navItems.map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `cc-nav-link${isActive ? ' is-active' : ''}`}>
            {Icon && <Icon size={17} aria-hidden="true" />}<span>{label}</span><ArrowUpRight className="cc-nav-link__arrow" size={14} aria-hidden="true" />
          </NavLink>)}
        </nav>
        <div className="cc-sidebar__spacer" />
        <div className="cc-sidebar__account"><span className="cc-account__avatar" aria-hidden="true">{initials}</span><span className="cc-account__identity"><strong>{currentUser?.name || title}</strong><small>{currentUser?.email || footerLabel}</small></span><button type="button" className="cc-logout" onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut size={17} aria-hidden="true" /></button></div>
      </aside>
      <div className="cc-workspace__column">
        <header className="cc-workspace__topbar"><div><span className="cc-workspace__crumb">CertiChain <span>/</span> {title}</span><h1 className="cc-workspace__top-title">{navItems.find((item) => item.end ? pathname === item.to : pathname.startsWith(item.to))?.label || title}</h1></div><div className="cc-topbar__actions"><span className="cc-topbar__status"><span /> Signed in</span><span className="cc-account__avatar cc-account__avatar--small" aria-hidden="true">{initials}</span></div></header>
        <main id="workspace-main" className="cc-workspace__main"><Outlet /></main>
        <footer className="cc-workspace__footer"><span>CertiChain</span><span aria-hidden="true">·</span>{footerLabel}<span className="cc-workspace__footer-end">Verified credentials, clearly presented</span></footer>
      </div>
    </div>
  </div>;
}
