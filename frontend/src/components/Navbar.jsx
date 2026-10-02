import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Activity, Bell, ChevronRight, ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Package, Pill, Search, Settings2, ShieldCheck, ShoppingCart, Users, X } from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/medicines', label: 'Medicines', icon: Pill },
  { to: '/admin/categories', label: 'Categories', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: Activity },
];

function Brand({ compact = false, to = '/' }) {
  return <Link to={to} className={`flex items-center gap-2.5 font-bold tracking-tight text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>
    <span className="brand-mark"><Activity aria-hidden="true" className="h-5 w-5" /><span className="brand-cross">+</span></span>
    <span>Pharma<span className="text-sage-700">Vital</span></span>
  </Link>;
}

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onAdmin = isAdmin && location.pathname.startsWith('/admin');
  const close = () => setMobileOpen(false);
  const signOut = () => { logout(); close(); navigate('/login'); };

  if (onAdmin) return <>
    <button className="admin-mobile-toggle" aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}><Menu /></button>
    {mobileOpen && <button className="admin-backdrop" aria-label="Close navigation" onClick={close} />}
    <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="admin-brand"><Brand compact to="/admin" /><button className="admin-close" aria-label="Close navigation" onClick={close}><X size={19} /></button></div>
      <div className="admin-workspace"><span className="workspace-icon"><ShieldCheck size={18} /></span><div><b>Pharmacy operations</b><small>Management workspace</small></div></div>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="admin-nav" aria-label="Admin navigation">{adminLinks.map(({ to, label, icon: Icon, end }) => {
        const active = end ? location.pathname === to : location.pathname.startsWith(to);
        return <Link key={to} to={to} onClick={close} className={`admin-nav-link ${active ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{active && <ChevronRight className="ml-auto" size={15} />}</Link>;
      })}</nav>
      <div className="admin-sidebar-bottom"><Link to="/profile" onClick={close} className="admin-nav-link"><Settings2 size={18} /><span>Profile settings</span></Link><div className="admin-user"><span className="avatar">{user?.name?.slice(0, 1) || 'A'}</span><div className="min-w-0"><b>{user?.name || 'Administrator'}</b><small>Administrator</small></div><button onClick={signOut} aria-label="Log out" title="Log out" className="logout-icon"><LogOut size={17} /></button></div></div>
    </aside>
  </>;

  return <header className="site-header">
    <div className="site-header-inner"><Brand />
      <nav className="customer-nav" aria-label="Main navigation">
        <Link to="/" className={location.pathname === '/' ? 'selected' : ''}>Home</Link><Link to="/medicines" className={location.pathname.startsWith('/medicines') ? 'selected' : ''}>Medicines</Link>
        {isAuthenticated && !isAdmin && <><Link to="/orders" className={location.pathname === '/orders' ? 'selected' : ''}>My Orders</Link><Link to="/prescriptions" className={location.pathname === '/prescriptions' ? 'selected' : ''}>Prescriptions</Link></>}
      </nav>
      <div className="header-actions">
        <Link className="header-icon search-shortcut" to="/medicines" aria-label="Search medicines" title="Search medicines"><Search size={18} /></Link>
        {isAuthenticated && !isAdmin && <Link className="header-icon" to="/notifications" aria-label="Notifications"><Bell size={18} /></Link>}
        {!isAdmin && <Link className="header-icon cart-shortcut" to={isAuthenticated ? '/cart' : '/login'} aria-label={`Cart, ${itemCount} items`}><ShoppingCart size={18} />{itemCount > 0 && <span className="cart-count">{itemCount}</span>}</Link>}
        {isAuthenticated ? <><Link to="/profile" className="profile-shortcut"><span className="avatar">{user?.name?.slice(0, 1) || 'U'}</span><span className="profile-name">{user?.name?.split(' ')[0] || 'Profile'}</span></Link><button className="header-icon logout-shortcut" onClick={signOut} aria-label="Log out" title="Log out"><LogOut size={18} /></button></> : <><Link to="/login" className="sign-in-link">Sign in</Link><Link to="/register" className="primary-button nav-join">Create account</Link></>}
        <button className="mobile-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
    {mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation"><Link onClick={close} to="/">Home</Link><Link onClick={close} to="/medicines">Medicines</Link>{isAuthenticated && !isAdmin && <><Link onClick={close} to="/orders">My Orders</Link><Link onClick={close} to="/prescriptions">Prescription Center</Link><Link onClick={close} to="/profile">Profile</Link></>}{isAdmin && <Link onClick={close} to="/admin">Operations overview</Link>}{isAuthenticated ? <button onClick={signOut}>Log out</button> : <Link onClick={close} to="/login">Sign in</Link>}</nav>}
  </header>;
};
