import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Footer = () => <footer className="site-footer">
  <div className="footer-main">
    <div className="footer-brand"><Link to="/" className="footer-logo"><span className="brand-mark"><Activity size={18} /><span className="brand-cross">+</span></span><span>Pharma<span>Vital</span></span></Link><p>Your trusted digital healthcare companion. Care, clarity, and your medicines in one place.</p><span className="footer-trust"><ShieldCheck size={15} /> Care designed around you</span></div>
    <div><h3>Explore</h3><Link to="/medicines">Medicines <ArrowUpRight size={13} /></Link><Link to="/orders">My orders <ArrowUpRight size={13} /></Link><Link to="/prescriptions">Prescriptions <ArrowUpRight size={13} /></Link></div>
    <div><h3>Your account</h3><Link to="/profile">Profile <ArrowUpRight size={13} /></Link><Link to="/cart">Shopping cart <ArrowUpRight size={13} /></Link><Link to="/notifications">Notifications <ArrowUpRight size={13} /></Link></div>
    <div className="footer-support"><h3>Support</h3><p>For help with an order or prescription, contact your pharmacy care team using the support details they provided.</p></div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} PharmaVital</span><span>Secure care. Clear choices.</span></div>
</footer>;
