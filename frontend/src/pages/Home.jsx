import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, ClipboardCheck, Clock3, FileText, HeartPulse, ShieldCheck, Truck, UploadCloud } from 'lucide-react';
import { medicineService } from '../services/medicineService';
import { MedicineCard } from '../components/MedicineCard';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
  { to: '/medicines', label: 'Medicine marketplace', detail: 'Browse trusted treatments', icon: Activity, color: 'indigo' },
  { to: '/prescriptions', label: 'Prescription center', detail: 'Upload and track reviews', icon: FileText, color: 'teal' },
  { to: '/orders', label: 'Order tracking', detail: 'Stay up to date on delivery', icon: Truck, color: 'blue' },
  { to: '/profile', label: 'Your health profile', detail: 'Keep your details current', icon: HeartPulse, color: 'violet' },
];

export const Home = () => {
  const { isAdmin } = useAuth();
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([medicineService.getAllMedicines(), medicineService.getCategories()])
      .then(([medicines, resultCategories]) => {
        if (!active) return;
        setFeaturedMedicines(medicines.slice(0, 3));
        setCategories(resultCategories);
      })
      .catch((error) => console.error('Unable to load PharmaVital home data:', error))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const shortcuts = isAdmin ? [
    { to: '/admin', label: 'Operations overview', detail: 'Monitor pharmacy activity', icon: Activity, color: 'indigo' },
    { to: '/admin/medicines', label: 'Inventory management', detail: 'Review catalog and stock', icon: FileText, color: 'teal' },
    { to: '/admin/prescriptions', label: 'Prescription reviews', detail: 'Open the pharmacist queue', icon: ShieldCheck, color: 'blue' },
    { to: '/admin/reports', label: 'Reports and analytics', detail: 'View available summaries', icon: ClipboardCheck, color: 'violet' },
  ] : quickLinks;

  return <div className="home-page">
    <section className="home-hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> DIGITAL HEALTHCARE, THOUGHTFULLY DELIVERED</div>
        <h1>Healthcare,<br /><span>simplified.</span></h1>
        <p>Discover trusted medicines, manage prescriptions, and follow your healthcare orders from one secure platform.</p>
        <div className="hero-actions"><Link to={isAdmin ? '/admin/medicines' : '/medicines'} className="primary-button">{isAdmin ? 'Manage catalog' : 'Explore medicines'} <ArrowRight size={17} /></Link><Link to={isAdmin ? '/admin/prescriptions' : '/prescriptions'} className="secondary-button">{isAdmin ? <FileText size={17} /> : <UploadCloud size={17} />} {isAdmin ? 'Review prescriptions' : 'Upload prescription'}</Link></div>
        <div className="hero-assurance"><span className="assurance-icon"><ShieldCheck size={17} /></span><span><b>Care with confidence</b><small>Prescription aware · Secure account</small></span></div>
      </div>
      <div className="hero-visual" aria-label="Healthcare service overview">
        <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        <div className="visual-caption"><span className="visual-symbol"><Activity size={26} /></span><div><b>Care, connected.</b><small>Your health essentials in one place</small></div></div>
        <div className="visual-card visual-card-main"><span className="visual-card-icon"><HeartPulse size={20} /></span><div><small>HEALTHCARE, ON YOUR TERMS</small><strong>A clearer way to manage care.</strong><span>Browse, verify, and stay informed.</span></div><span className="visual-check"><BadgeCheck size={19} /></span></div>
        <div className="visual-floating floating-top"><span><ShieldCheck size={17} /></span><div><b>Prescription-aware</b><small>Pharmacist review workflow</small></div></div>
        <div className="visual-floating floating-bottom"><span><Truck size={17} /></span><div><b>Order visibility</b><small>Updates through fulfillment</small></div></div>
        <span className="hero-decoration decor-a" /><span className="hero-decoration decor-b" />
      </div>
      <div className="hero-index"><span>01</span><i /> HEALTH, IN ONE PLACE</div>
    </section>

    <section className="quick-access-section"><div className="section-heading"><div><span className="section-kicker">{isAdmin ? 'PHARMACY OPERATIONS' : 'YOUR HEALTH HUB'}</span><h2>{isAdmin ? 'Operations at a glance' : 'Where do you want to start?'}</h2></div><p>{isAdmin ? 'Shortcuts to the pharmacy management workspace.' : 'Tools to make everyday healthcare easier to manage.'}</p></div><div className="quick-access-grid">{shortcuts.map(({ to, label, detail, icon: Icon, color }) => <Link to={to} className="quick-access-card" key={to}><span className={`quick-icon ${color}`}><Icon size={20} /></span><span className="quick-copy"><b>{label}</b><small>{detail}</small></span><ArrowUpRight size={17} className="quick-arrow" /></Link>)}</div></section>

    <section className="category-section"><div className="section-heading"><div><span className="section-kicker">FIND WHAT YOU NEED</span><h2>Browse by category</h2></div><Link to="/medicines" className="text-link">View all medicines <ArrowRight size={15} /></Link></div><div className="category-grid">{categories.slice(0, 5).map((category, index) => <Link key={category.id} to={`/medicines?categoryId=${category.id}`} className={`category-tile category-tone-${index % 4}`}><span className="category-index">0{index + 1}</span><span className="category-mark"><Activity size={21} /></span><b>{category.name}</b><small>{category.description || 'Explore available medicines'}</small><ArrowUpRight size={16} className="category-arrow" /></Link>)}</div></section>

    <section className="featured-section"><div className="section-heading"><div><span className="section-kicker">THE PHARMAVITAL CATALOG</span><h2>Everyday essentials</h2><p>Explore medicines available through the PharmaVital catalog.</p></div><Link to="/medicines" className="text-link">Explore catalog <ArrowRight size={15} /></Link></div>{loading ? <div className="medicine-skeleton-grid">{[1, 2, 3].map((item) => <div className="medicine-skeleton" key={item}><div /><span /><span /></div>)}</div> : featuredMedicines.length ? <div className="featured-medicine-grid">{featuredMedicines.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} />)}</div> : <div className="home-empty"><Activity size={20} /><span>There are no featured medicines to show right now.</span><Link to="/medicines">Browse the catalog</Link></div>}</section>

    <section className="trust-section"><div className="trust-intro"><span className="section-kicker">THE PHARMAVITAL DIFFERENCE</span><h2>Healthcare that feels more connected.</h2><p>Useful tools and clear information help you stay in control of your care journey.</p></div><div className="trust-grid"><article><span><BadgeCheck size={19} /></span><b>Verified catalog</b><p>Medicine details and availability come from the live pharmacy catalog.</p></article><article><span><ClipboardCheck size={19} /></span><b>Prescription safety</b><p>Prescription requirements stay visible from browsing through checkout.</p></article><article><span><ShieldCheck size={19} /></span><b>Secure access</b><p>Your account actions stay connected to authenticated pharmacy services.</p></article><article><span><Clock3 size={19} /></span><b>Order visibility</b><p>Review fulfillment progress and delivery updates from your account.</p></article></div></section>
  </div>;
};
