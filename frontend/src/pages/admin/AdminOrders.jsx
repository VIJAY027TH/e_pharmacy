import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ClipboardList, Search, Truck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { Drawer, EmptyState, ErrorState, LoadingState, OrderTimeline, PageHeader, StatusBadge, currency, formatDate } from '../../components/admin/AdminUI';

const statusOptions = ['PLACED', 'PRESCRIPTION_PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [deliveryError, setDeliveryError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setOrders(await adminService.getAllOrders()); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Orders could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSearch(searchParams.get('search') || ''); }, [searchParams]);
  useEffect(() => {
    const id = searchParams.get('order');
    if (id && orders.length) setSelectedOrder(orders.find((order) => String(order.id) === id) || null);
  }, [orders, searchParams]);
  useEffect(() => {
    if (!selectedOrder) { setDelivery(null); setDeliveryError(''); return; }
    let active = true;
    orderService.getDeliveryTracking(selectedOrder.id).then((data) => active && setDelivery(data)).catch((requestError) => active && setDeliveryError(requestError.response?.data?.message || 'Delivery information is not available yet.'));
    return () => { active = false; };
  }, [selectedOrder?.id]);

  const filtered = useMemo(() => orders.filter((order) => {
    const query = search.trim().toLowerCase();
    const searchable = [order.id, order.user?.name, order.user?.email].map((value) => String(value || '').toLowerCase());
    const matchesSearch = !query || searchable.some((value) => value.includes(query));
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    const date = new Date(order.createdAt);
    const now = new Date();
    const matchesPeriod = periodFilter === 'all' || (periodFilter === '30' && now - date <= 30 * 86400000 && now >= date) || (periodFilter === 'today' && date.toDateString() === now.toDateString());
    return matchesSearch && matchesStatus && matchesPayment && matchesPeriod;
  }), [orders, search, statusFilter, paymentFilter, periodFilter]);

  const searchOrders = (value) => { setSearch(value); setSearchParams(value.trim() ? { search: value.trim() } : {}); };
  const openOrder = (order) => { setSelectedOrder(order); setSearchParams((previous) => { const next = new URLSearchParams(previous); next.set('order', order.id); return next; }); };
  const closeOrder = () => { setSelectedOrder(null); setSearchParams((previous) => { const next = new URLSearchParams(previous); next.delete('order'); return next; }); };
  const changeStatus = async (orderId, newStatus) => {
    setUpdating(true); setError('');
    try { const updated = await adminService.updateOrderStatus(orderId, newStatus); setOrders((previous) => previous.map((order) => order.id === orderId ? { ...order, ...updated } : order)); setSelectedOrder((previous) => previous?.id === orderId ? { ...previous, ...updated } : previous); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Order status could not be updated.'); }
    finally { setUpdating(false); }
  };

  return <div className="admin-page orders-page">
    <PageHeader eyebrow="FULFILLMENT OPERATIONS" title="Orders" subtitle="Monitor, process and fulfill customer orders." actions={<div className="order-count-chip"><ClipboardList size={16} />{orders.length} total orders</div>} />
    <section className="orders-toolbar admin-panel"><label className="inventory-search"><Search size={17} /><input value={search} onChange={(event) => searchOrders(event.target.value)} placeholder="Search order, customer or email" aria-label="Search orders and customers" /></label><label className="compact-filter"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><label className="compact-filter"><span>Payment</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}><option value="all">All payments</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="REFUNDED">Refunded</option></select></label><label className="compact-filter"><span>Date</span><select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}><option value="all">Any time</option><option value="today">Today</option><option value="30">Last 30 days</option></select></label></section>
    {error && <ErrorState message={error} onRetry={load} />}
    <section className="admin-panel order-list-panel">{loading ? <LoadingState label="Loading order queue…" /> : filtered.length === 0 ? <EmptyState title={orders.length ? 'No orders match these filters' : 'No orders yet'} description={orders.length ? 'Adjust the search or filters to see more orders.' : 'New customer orders will appear in this workspace.'} icon={ClipboardList} /> : <><div className="table-caption"><span>{filtered.length} order{filtered.length === 1 ? '' : 's'} in view</span><span>Amounts and statuses from current order records</span></div><div className="admin-table-scroll"><table className="admin-table order-table"><thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th><span className="sr-only">Open details</span></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} onClick={() => openOrder(order)} className="clickable-row" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && openOrder(order)}>
      <td data-label="Order"><b className="order-id">#{order.id}</b><small className="row-secondary">{order.prescriptionId ? `Rx #${order.prescriptionId}` : 'Standard order'}</small></td><td data-label="Customer"><span className="customer-cell"><i>{order.user?.name?.slice(0, 1) || 'C'}</i><span><b>{order.user?.name || 'Customer'}</b><small>{order.user?.email || '—'}</small></span></span></td><td data-label="Placed">{formatDate(order.createdAt)}</td><td data-label="Items">{order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}</td><td data-label="Total" className="table-primary-value">{currency(order.totalAmount)}</td><td data-label="Payment"><StatusBadge status={order.paymentStatus} /></td><td data-label="Fulfillment"><StatusBadge status={order.orderStatus} /></td><td data-label="Details"><button className="table-open-button" onClick={(event) => { event.stopPropagation(); openOrder(order); }} aria-label={`Open order ${order.id}`}><ArrowUpRight size={17} /></button></td>
    </tr>)}</tbody></table></div></>}</section>

    <Drawer open={Boolean(selectedOrder)} onClose={closeOrder} title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order details'} subtitle={selectedOrder ? `Placed ${formatDate(selectedOrder.createdAt, true)}` : ''} width="wide" footer={selectedOrder && <div className="order-drawer-footer"><label>Update fulfillment<select disabled={updating} value={selectedOrder.orderStatus} onChange={(event) => changeStatus(selectedOrder.id, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label></div>}>
      {selectedOrder && <div className="order-detail-content"><div className="detail-status-row"><StatusBadge status={selectedOrder.orderStatus} /><StatusBadge status={selectedOrder.paymentStatus} /><span className="detail-total">{currency(selectedOrder.totalAmount)}</span></div><section className="detail-block"><h3>Fulfillment timeline</h3><OrderTimeline status={selectedOrder.orderStatus} /></section><section className="detail-block"><h3>Customer</h3><div className="detail-info-card"><b>{selectedOrder.user?.name || 'Customer'}</b><span>{selectedOrder.user?.email || '—'}</span><span>{selectedOrder.user?.phone || 'Phone not available'}</span><span className="detail-address">{selectedOrder.shippingAddress || selectedOrder.user?.address || 'Delivery address unavailable'}</span></div></section><section className="detail-block"><h3>Items</h3><div className="order-item-list">{selectedOrder.items?.map((item) => <div className="order-item-row" key={item.id}><span><b>{item.medicine?.name || 'Medicine'}</b><small>{item.quantity} × {currency(item.price)}</small></span><b>{currency(item.subtotal)}</b></div>)}</div><div className="pricing-total"><span>Order total</span><b>{currency(selectedOrder.totalAmount)}</b></div></section><section className="detail-block"><h3>Payment & prescription</h3><div className="detail-info-grid"><div><small>Payment status</small><StatusBadge status={selectedOrder.paymentStatus} /></div><div><small>Prescription</small><span>{selectedOrder.prescriptionId ? `Prescription #${selectedOrder.prescriptionId}` : 'No prescription linked'}</span></div></div></section><section className="detail-block"><h3><Truck size={16} /> Delivery information</h3>{delivery ? <div className="detail-info-grid"><div><small>Tracking number</small><span>{delivery.trackingNumber || '—'}</span></div><div><small>Delivery status</small><StatusBadge status={delivery.deliveryStatus} /></div><div><small>Estimated delivery</small><span>{formatDate(delivery.estimatedDelivery)}</span></div></div> : deliveryError ? <p className="muted-note">{deliveryError}</p> : <p className="muted-note">Loading delivery information…</p>}</section><div className="drawer-inline-note"><CalendarDays size={15} /> Changes to fulfillment are saved through the order service.</div></div>}
    </Drawer>
  </div>;
};
