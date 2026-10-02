import React, { useEffect, useRef } from 'react';
import { Activity, AlertCircle, CheckCircle2, Clock3, FileQuestion, Loader2 } from 'lucide-react';

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return <header className="admin-page-header"><div><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="admin-page-actions">{actions}</div>}</header>;
}

export function MetricCard({ label, value, note, icon: Icon = Activity, tone = 'green' }) {
  return <article className={`metric-card tone-${tone}`}><span className="metric-icon"><Icon size={18} /></span><span className="metric-label">{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}

const statusTone = (status = '') => {
  const value = status.toUpperCase();
  if (['DELIVERED', 'APPROVED', 'ACTIVE', 'PAID', 'IN STOCK', 'HEALTHY'].includes(value)) return 'good';
  if (['CANCELLED', 'REJECTED', 'INACTIVE', 'OUT OF STOCK', 'FAILED', 'REFUNDED'].includes(value)) return 'bad';
  if (['PENDING', 'PRESCRIPTION_PENDING', 'LOW STOCK', 'EXPIRED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'CONFIRMED', 'PLACED'].includes(value)) return 'pending';
  return 'neutral';
};

export function StatusBadge({ status, children }) {
  const text = children || String(status || 'Unknown').replaceAll('_', ' ');
  return <span className={`status-badge ${statusTone(status || text)}`}><i aria-hidden="true" />{text}</span>;
}

export function EmptyState({ title, description, action, icon: Icon = FileQuestion }) {
  return <div className="admin-empty"><span><Icon size={21} /></span><b>{title}</b><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = 'Loading workspace' }) {
  return <div className="admin-loading" role="status"><Loader2 size={19} className="spin" /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="admin-error" role="alert"><AlertCircle size={18} /><span>{message || 'This information could not be loaded.'}</span>{onRetry && <button onClick={onRetry}>Try again</button>}</div>;
}

export function Drawer({ open, title, subtitle, onClose, children, footer, width = 'medium' }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); onCloseRef.current(); }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) { event.preventDefault(); return; }
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return <div className="drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <button className="drawer-backdrop" aria-label="Close panel" onClick={onClose} />
    <section ref={panelRef} tabIndex={-1} className={`admin-drawer drawer-${width}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header className="drawer-header"><div><h2 id="drawer-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close panel">×</button></header>
      <div className="drawer-body">{children}</div>{footer && <footer className="drawer-footer">{footer}</footer>}
    </section>
  </div>;
}

export function OrderTimeline({ status }) {
  const steps = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const aliases = { PACKED: 'PROCESSING', OUT_FOR_DELIVERY: 'SHIPPED', PRESCRIPTION_PENDING: 'PLACED' };
  const current = aliases[status] || status;
  const index = status === 'CANCELLED' ? -1 : steps.indexOf(current);
  return <ol className={`order-timeline ${status === 'CANCELLED' ? 'timeline-cancelled' : ''}`} aria-label={`Order progress: ${String(status || 'unknown').replaceAll('_', ' ').toLowerCase()}`}>
    {steps.map((step, stepIndex) => <li className={stepIndex < index ? 'complete' : stepIndex === index ? 'current' : ''} key={step}><span>{stepIndex < index ? <CheckCircle2 size={14} /> : stepIndex === index ? <Clock3 size={14} /> : <i />}</span><b>{step === 'PLACED' ? 'Order placed' : step[0] + step.slice(1).toLowerCase()}</b></li>)}
  </ol>;
}

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
}

export function currency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}
