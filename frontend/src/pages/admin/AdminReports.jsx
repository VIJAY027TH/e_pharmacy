import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BarChart3, Boxes, FileCheck2, Package, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, StatusBadge, currency } from '../../components/admin/AdminUI';

export const AdminReports = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const responses = await Promise.allSettled([adminService.getSalesReport(), adminService.getInventoryReport(), adminService.getPrescriptions()]);
    if (responses.every((response) => response.status === 'rejected')) setError('Reports are unavailable right now.');
    else {
      setSales(responses[0].status === 'fulfilled' ? responses[0].value : []);
      setInventory(responses[1].status === 'fulfilled' ? responses[1].value : []);
      setPrescriptions(responses[2].status === 'fulfilled' ? responses[2].value : []);
    }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const orderStatuses = useMemo(() => {
    const counts = {};
    sales.forEach((order) => { counts[order.orderStatus] = (counts[order.orderStatus] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [sales]);
  const stock = useMemo(() => ({
    healthy: inventory.filter((medicine) => Number(medicine.stockQuantity) > 10).length,
    low: inventory.filter((medicine) => Number(medicine.stockQuantity) > 0 && Number(medicine.stockQuantity) <= 10).length,
    out: inventory.filter((medicine) => Number(medicine.stockQuantity) <= 0).length,
  }), [inventory]);
  const rxStatusCounts = useMemo(() => ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'].map((status) => ({ status, count: prescriptions.filter((prescription) => prescription.status === status).length })), [prescriptions]);
  const totalRecordedAmount = sales.filter((order) => order.paymentStatus === 'PAID').reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const maxStatusCount = Math.max(1, ...orderStatuses.map(([, count]) => count));

  if (loading) return <LoadingState label="Preparing reports…" />;
  return <div className="admin-page reports-page"><PageHeader eyebrow="OPERATIONAL ANALYTICS" title="Reports & insights" subtitle="Review the current order, inventory and prescription records." actions={<span className="report-period-note">Current database records</span>} />
    {error && <ErrorState message={error} onRetry={load} />}
    <section className="report-metrics"><MetricCard label="Orders in report" value={sales.length} note="All current order records" icon={Package} tone="green" /><MetricCard label="Paid order revenue" value={currency(totalRecordedAmount)} note="Sum of orders marked paid" icon={TrendingUp} tone="amber" /><MetricCard label="Catalog medicines" value={inventory.length} note="Current inventory list" icon={Boxes} tone="blue" /><MetricCard label="Prescription submissions" value={prescriptions.length} note="All current review states" icon={FileCheck2} tone="green" /></section>
    <div className="reports-grid">
      <section className="admin-panel report-panel"><div className="panel-heading"><div><span className="admin-eyebrow">SALES OVERVIEW</span><h2>Order activity</h2></div><span className="report-subtitle">By current fulfillment state</span></div>{orderStatuses.length ? <div className="report-bar-list">{orderStatuses.map(([status, count]) => <div className="report-bar-row" key={status}><span>{String(status).replaceAll('_', ' ')}</span><div className="report-bar-track"><i style={{ width: `${count / maxStatusCount * 100}%` }} /></div><b>{count}</b></div>)}</div> : <EmptyState title="No order data" description="Order activity will appear when records are available." icon={BarChart3} />}</section>
      <section className="admin-panel report-panel"><div className="panel-heading"><div><span className="admin-eyebrow">INVENTORY HEALTH</span><h2>Stock position</h2></div><span className="report-subtitle">Status at the 10 unit threshold</span></div><div className="report-stock-summary"><div><i className="stock-healthy" /><span>Healthy stock</span><b>{stock.healthy}</b></div><div><i className="stock-low" /><span>Low stock</span><b>{stock.low}</b></div><div><i className="stock-empty" /><span>Out of stock</span><b>{stock.out}</b></div></div>{inventory.filter((medicine) => Number(medicine.stockQuantity) <= 10).length > 0 && <div className="report-alert-list">{inventory.filter((medicine) => Number(medicine.stockQuantity) <= 10).slice(0, 5).map((medicine) => <div key={medicine.id}><AlertTriangle size={15} /><span>{medicine.name}</span><StatusBadge status={Number(medicine.stockQuantity) <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'} /></div>)}</div>}</section>
      <section className="admin-panel report-panel"><div className="panel-heading"><div><span className="admin-eyebrow">PRESCRIPTION ACTIVITY</span><h2>Review states</h2></div><Link className="subtle-link" to="/admin/prescriptions">Review queue <span aria-hidden="true">→</span></Link></div>{prescriptions.length ? <div className="rx-state-grid">{rxStatusCounts.map(({ status, count }) => <div key={status}><StatusBadge status={status} /><b>{count}</b></div>)}</div> : <EmptyState title="No prescription submissions" description="Prescription review activity will appear here." icon={FileCheck2} />}</section>
      <section className="admin-panel report-panel"><div className="panel-heading"><div><span className="admin-eyebrow">SALES DETAIL</span><h2>Recent order amounts</h2></div><span className="report-subtitle">Latest records available</span></div>{sales.length ? <div className="report-order-list">{[...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6).map((order) => <div key={order.id}><span><b>Order #{order.id}</b><small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date unavailable'}</small></span><span>{currency(order.totalAmount)}</span><StatusBadge status={order.orderStatus} /></div>)}</div> : <EmptyState title="No sales records" description="Order amounts will appear as orders are created." icon={TrendingUp} />}</section>
    </div>
    <p className="report-data-note">Report totals are calculated from the order, inventory and prescription records returned by the existing APIs. No daily sales history endpoint is available.</p>
  </div>;
};
