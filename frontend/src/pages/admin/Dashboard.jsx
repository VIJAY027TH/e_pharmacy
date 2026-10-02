import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, DollarSign, FileCheck2, PackageSearch, Pill, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader, MetricCard, StatusBadge, EmptyState, LoadingState, ErrorState, currency, formatDate } from '../../components/admin/AdminUI';

const attentionStatus = new Set(['PLACED', 'CONFIRMED', 'PROCESSING', 'PACKED']);

export const Dashboard = () => {
  const [data, setData] = useState({ stats: null, orders: [], inventory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const results = await Promise.allSettled([adminService.getDashboardStats(), adminService.getAllOrders(), adminService.getInventoryReport()]);
    if (results.every((result) => result.status === 'rejected')) {
      setError(results[0].reason?.response?.data?.message || 'The operations overview could not be loaded.');
    } else {
      setData({
        stats: results[0].status === 'fulfilled' ? results[0].value : null,
        orders: results[1].status === 'fulfilled' ? results[1].value : [],
        inventory: results[2].status === 'fulfilled' ? results[2].value : [],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingState label="Preparing the operations overview…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { stats, orders, inventory } = data;
  const pendingOrders = orders.filter((order) => attentionStatus.has(order.orderStatus));
  const lowStock = inventory.filter((medicine) => Number(medicine.stockQuantity) > 0 && Number(medicine.stockQuantity) <= 10);
  const outOfStock = inventory.filter((medicine) => Number(medicine.stockQuantity) <= 0);
  const healthyStock = inventory.filter((medicine) => Number(medicine.stockQuantity) > 10);
  const orderStates = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => ({ status, count: orders.filter((order) => order.orderStatus === status).length }));
  const maxOrderCount = Math.max(1, ...orderStates.map((item) => item.count));
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return <div className="admin-page dashboard-page">
    <PageHeader eyebrow="PHARMACY OPERATIONS" title="Good morning, Administrator" subtitle="Here’s what needs attention across PharmaVital today." actions={<span className="today-stamp">Live overview <i /> Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>} />

    <section className="dashboard-metrics" aria-label="Operational summary">
      <MetricCard label="Recorded orders" value={stats?.totalOrders ?? orders.length} note="All-time orders" icon={ClipboardList} tone="green" />
      <MetricCard label="Recorded revenue" value={stats?.totalRevenue == null ? '—' : currency(stats.totalRevenue)} note="Cumulative recorded sales" icon={DollarSign} tone="amber" />
      <MetricCard label="Pending prescriptions" value={stats?.pendingPrescriptions ?? '—'} note="Awaiting pharmacist review" icon={FileCheck2} tone="blue" />
      <MetricCard label="Low-stock medicines" value={stats?.lowStockMedicines ?? lowStock.length} note="10 units or fewer" icon={AlertTriangle} tone="red" />
    </section>

    <section className="attention-section">
      <div className="section-title-row"><div><span className="admin-eyebrow">REVIEW QUEUE</span><h2>Needs attention</h2></div><span className="attention-live"><i /> Based on current records</span></div>
      <div className="attention-grid">
        <Link to="/admin/prescriptions" className="attention-item"><span className="attention-symbol amber"><FileCheck2 size={18} /></span><span><b>Prescriptions awaiting review</b><small>Open the pharmacist review queue</small></span><strong>{stats?.pendingPrescriptions ?? '—'}</strong><ArrowRight size={16} /></Link>
        <Link to="/admin/medicines" className="attention-item"><span className="attention-symbol red"><PackageSearch size={18} /></span><span><b>{inventory.length === 0 ? 'Inventory is empty' : lowStock.length + outOfStock.length === 0 ? 'Stock levels are healthy' : 'Medicines running low'}</b><small>{inventory.length === 0 ? 'Add catalog items to monitor stock' : lowStock.length + outOfStock.length === 0 ? 'No low-stock medicines' : `${outOfStock.length} currently out of stock`}</small></span><strong>{stats?.lowStockMedicines ?? lowStock.length + outOfStock.length}</strong><ArrowRight size={16} /></Link>
        <Link to="/admin/orders" className="attention-item"><span className="attention-symbol blue"><ClipboardList size={18} /></span><span><b>Orders to process</b><small>Placed, confirmed, or processing</small></span><strong>{pendingOrders.length}</strong><ArrowRight size={16} /></Link>
      </div>
    </section>

    <div className="dashboard-analysis-grid">
      <section className="admin-panel order-activity-panel"><div className="panel-heading"><div><span className="admin-eyebrow">FULFILLMENT</span><h2>Order activity</h2></div><Link to="/admin/orders" className="subtle-link">All orders <ArrowRight size={14} /></Link></div>
        {orders.length ? <div className="activity-bars" role="img" aria-label="Order counts by current order status">{orderStates.map(({ status, count }) => <div className="activity-bar-row" key={status}><span>{status.replaceAll('_', ' ')}</span><div className="bar-track"><i style={{ width: `${Math.max(count ? 5 : 0, (count / maxOrderCount) * 100)}%` }} /></div><b>{count}</b></div>)}</div> : <EmptyState title="No order activity yet" description="Order status activity will appear here when orders are recorded." icon={ClipboardList} />}
      </section>
      <section className="admin-panel inventory-health-panel"><div className="panel-heading"><div><span className="admin-eyebrow">CATALOG</span><h2>Inventory health</h2></div><Link to="/admin/medicines" className="subtle-link">Inventory <ArrowRight size={14} /></Link></div>
        {inventory.length ? <><div className="stock-health-number"><strong>{inventory.length}</strong><span>catalog medicines</span></div><div className="stock-health-track" aria-label={`${healthyStock.length} healthy, ${lowStock.length} low, ${outOfStock.length} out of stock`}><i className="stock-healthy" style={{ width: `${healthyStock.length / inventory.length * 100}%` }} /><i className="stock-low" style={{ width: `${lowStock.length / inventory.length * 100}%` }} /><i className="stock-empty" style={{ width: `${outOfStock.length / inventory.length * 100}%` }} /></div><div className="stock-legend"><span><i className="stock-healthy" /> Healthy <b>{healthyStock.length}</b></span><span><i className="stock-low" /> Low stock <b>{lowStock.length}</b></span><span><i className="stock-empty" /> Out of stock <b>{outOfStock.length}</b></span></div>{lowStock.length + outOfStock.length === 0 && <div className="inventory-clear-state"><CheckCircle2 size={17} /><span><b>No low-stock medicines</b><small>All catalog items are above the low-stock threshold.</small></span></div>}</> : <EmptyState title="No catalog medicines" description="Add products to the inventory to start monitoring stock health." icon={Pill} action={<Link className="admin-action primary" to="/admin/medicines">Open inventory</Link>} />}
      </section>
    </div>

    <section className="admin-panel recent-orders-panel"><div className="panel-heading"><div><span className="admin-eyebrow">LATEST FULFILLMENT</span><h2>Recent orders</h2></div><Link to="/admin/orders" className="subtle-link">View order queue <ArrowRight size={14} /></Link></div>
      {recentOrders.length ? <div className="recent-order-list">{recentOrders.map((order) => <Link to={`/admin/orders?order=${order.id}`} key={order.id} className="recent-order-row"><span className="order-ref">#{order.id}</span><span className="recent-customer"><b>{order.user?.name || 'Customer'}</b><small>{order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'} · {formatDate(order.createdAt)}</small></span><span className="recent-total">{currency(order.totalAmount)}</span><StatusBadge status={order.orderStatus} /><ArrowRight size={15} className="row-arrow" /></Link>)}</div> : <EmptyState title="No recent orders" description="New orders will appear here." icon={ClipboardList} />}
    </section>
    <div className="dashboard-footnote"><Users size={15} /><span>{stats?.totalUsers ?? '—'} {stats?.totalUsers === 1 ? 'registered account' : 'registered accounts'}</span><i /><Pill size={15} /><span>{stats?.totalMedicines ?? inventory.length} medicines in the catalog</span></div>
  </div>;
};
