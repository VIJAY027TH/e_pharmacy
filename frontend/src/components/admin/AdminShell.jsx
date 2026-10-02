import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, BarChart3, Boxes, ChevronDown, CircleHelp, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Package, Search, Settings2, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  { label: 'WORKSPACE', items: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/medicines', label: 'Inventory', icon: Boxes },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { to: '/admin/prescriptions', label: 'Prescriptions', icon: FileText },
  ] },
  { label: 'DIRECTORY', items: [
    { to: '/admin/users', label: 'Customers', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Package },
    { to: '/admin/reports', label: 'Reports & insights', icon: BarChart3 },
  ] },
  { label: 'PREFERENCES', items: [
    { to: '/profile', label: 'System', icon: Settings2 },
  ] },
];

function AdminSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('medicines');
  const submit = (event) => {
    event.preventDefault();
    const destinations = { medicines: '/admin/medicines', orders: '/admin/orders', customers: '/admin/users' };
    navigate(`${destinations[scope]}?search=${encodeURIComponent(query.trim())}`);
  };
  return <form className="admin-global-search" onSubmit={submit} role="search">
    <Search size={17} aria-hidden="true" />
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${scope}…`} aria-label={`Search ${scope}`} />
    <select value={scope} onChange={(event) => setScope(event.target.value)} aria-label="Search in"><option value="medicines">Medicines</option><option value="orders">Orders</option><option value="customers">Customers</option></select>
    <button type="submit" aria-label="Run search"><Search size={15} /></button>
  </form>;
}

export function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const signOut = () => { logout(); navigate('/login'); };

  return <div className="admin-app">
    <header className="admin-topbar">
      <div className="admin-topbar-brand"><button className="admin-menu-toggle" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation"><Menu size={19} /></button><Link to="/admin" className="pv-wordmark"><span className="pv-logo"><Activity size={18} /><i>+</i></span><span>Pharma<span>Vital</span></span></Link><span className="workspace-divider" /><span className="workspace-title">CARE OPERATIONS</span></div>
      <AdminSearch />
      <div className="admin-topbar-actions"><Link to="/admin/prescriptions" className="topbar-icon" aria-label="Prescription review queue" title="Prescription review queue"><Bell size={18} /></Link><button className="topbar-icon" aria-label="Help" title="Help" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /></button><details className="admin-profile-menu"><summary><span className="admin-avatar">{user?.name?.slice(0, 1) || 'A'}</span><span className="admin-profile-name"><b>{user?.name || 'Administrator'}</b><small>Administrator</small></span><ChevronDown size={14} /></summary><div className="profile-menu-popover"><Link to="/profile">Account profile</Link><button onClick={signOut}><LogOut size={15} /> Sign out</button></div></details></div>
    </header>
    <nav className="admin-context-nav" aria-label="Administration sections"><div className="context-nav-scroll">{navGroups.map((group, groupIndex) => <React.Fragment key={group.label}>{groupIndex > 0 && <span className="context-nav-separator" aria-hidden="true" />}{group.items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `context-nav-link ${isActive || (to !== '/admin' && location.pathname.startsWith(to)) ? 'active' : ''}`}><Icon size={15} /><span>{label}</span></NavLink>)}</React.Fragment>)}</div><span className="secure-workspace"><ShieldCheck size={14} /> Secure workspace</span></nav>
    <div className={`admin-mobile-nav-wrap ${mobileNavOpen ? 'open' : ''}`} aria-hidden={!mobileNavOpen}>
      <button className="mobile-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
      <aside className="admin-mobile-nav"><div className="mobile-nav-head"><Link to="/admin" className="pv-wordmark"><span className="pv-logo"><Activity size={18} /><i>+</i></span><span>Pharma<span>Vital</span></span></Link><button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>{navGroups.map((group) => <section key={group.label}><small>{group.label}</small>{group.items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `mobile-admin-link ${isActive ? 'active' : ''}`}><Icon size={17} />{label}</NavLink>)}</section>)}<button className="mobile-signout" onClick={signOut}><LogOut size={16} /> Sign out</button></aside>
    </div>
    <main className="admin-workspace-main">{children}</main>
    {helpOpen && <div className="help-dialog-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setHelpOpen(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title"><button className="icon-button" onClick={() => setHelpOpen(false)} aria-label="Close help">×</button><CircleHelp size={22} /><h2 id="help-title">Workspace help</h2><p>Use the section navigation to manage inventory, orders, prescription reviews and customer accounts. Contact your system administrator if you need access assistance.</p><button className="admin-action primary" onClick={() => setHelpOpen(false)}>Got it</button></section></div>}
  </div>;
}
