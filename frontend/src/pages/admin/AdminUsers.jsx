import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, Phone, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Drawer, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge, currency, formatDate } from '../../components/admin/AdminUI';

export const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const results = await Promise.allSettled([adminService.getAllUsers(), adminService.getAllOrders(), adminService.getPrescriptions()]);
    if (results[0].status === 'rejected') setError(results[0].reason?.response?.data?.message || 'Customer accounts could not be loaded.');
    else setUsers(results[0].value);
    setOrders(results[1].status === 'fulfilled' ? results[1].value : []);
    setPrescriptions(results[2].status === 'fulfilled' ? results[2].value : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQuery(searchParams.get('search') || ''); }, [searchParams]);

  const filtered = useMemo(() => users.filter((user) => {
    const queryMatches = !query.trim() || [user.name, user.email, user.phone, user.role].some((value) => String(value || '').toLowerCase().includes(query.trim().toLowerCase()));
    return queryMatches && (statusFilter === 'all' || user.status === statusFilter);
  }), [users, query, statusFilter]);

  const administratorAccounts = users.filter((user) => user.role === 'ROLE_ADMIN');
  const customerAccounts = filtered.filter((user) => user.role !== 'ROLE_ADMIN');

  const searchCustomers = (value) => { setQuery(value); setSearchParams(value.trim() ? { search: value.trim() } : {}); };
  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try { const updated = await adminService.updateUserStatus(user.id, nextStatus); setUsers((previous) => previous.map((row) => row.id === user.id ? { ...row, ...updated } : row)); setSelectedCustomer((previous) => previous?.id === user.id ? { ...previous, ...updated } : previous); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Customer status could not be updated.'); }
  };

  const customerOrders = selectedCustomer ? orders.filter((order) => order.user?.id === selectedCustomer.id) : [];
  const customerPrescriptions = selectedCustomer ? prescriptions.filter((prescription) => prescription.user?.id === selectedCustomer.id) : [];

  return <div className="admin-page customers-page">
    <PageHeader eyebrow="CUSTOMER DIRECTORY" title="Customers" subtitle="Manage customer accounts and account activity." actions={<span className="order-count-chip"><Users size={16} />{customerAccounts.length} customers · {users.length} {users.length === 1 ? 'account' : 'accounts'}</span>} />
    <section className="customer-toolbar admin-panel"><label className="inventory-search"><Search size={17} /><input value={query} onChange={(event) => searchCustomers(event.target.value)} placeholder="Find by name, email or phone" aria-label="Search customers" /></label><label className="compact-filter"><span>Account status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All accounts</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label></section>
    {loading ? <LoadingState label="Loading customer directory…" /> : error ? <ErrorState message={error} onRetry={load} /> : <>
      {administratorAccounts.length > 0 && <section className="admin-account-panel"><h2>Administrator account</h2>{administratorAccounts.map((user) => <button type="button" className="admin-account-card" key={user.id} onClick={() => setSelectedCustomer(user)}><span className="customer-profile-avatar">A</span><span><b>Administrator</b><small>{user.email}</small></span><StatusBadge status={user.status} /><span className="admin-role-label"><ShieldCheck size={15} /> Protected role</span></button>)}</section>}
      {customerAccounts.length === 0 ? <EmptyState title={users.length ? (query || statusFilter !== 'all' ? 'No matching customers' : 'No customers yet') : 'No accounts yet'} description={users.length ? 'Customer accounts will appear here when users register.' : 'Accounts will appear here after registration.'} icon={Users} /> : <section className="admin-panel customer-list-panel"><div className="table-caption"><span>{customerAccounts.length} customer{customerAccounts.length === 1 ? '' : 's'}</span><span>Account response does not include registration dates.</span></div><div className="admin-table-scroll"><table className="admin-table customer-table"><thead><tr><th>Customer</th><th>Phone</th><th>Role</th><th>Orders</th><th>Prescription activity</th><th>Status</th><th><span className="sr-only">Account action</span></th></tr></thead><tbody>{customerAccounts.map((user) => <tr key={user.id} onClick={() => setSelectedCustomer(user)} className="clickable-row" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setSelectedCustomer(user)}>
      <td data-label="Customer"><span className="customer-cell"><i>{user.name?.slice(0, 1) || 'U'}</i><span><b>{user.name}</b><small>{user.email}</small></span></span></td><td data-label="Phone">{user.phone || 'Not provided'}</td><td data-label="Role"><StatusBadge status={user.role === 'ROLE_ADMIN' ? 'PENDING' : 'NEUTRAL'}>{user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}</StatusBadge></td><td data-label="Orders">{orders.filter((order) => order.user?.id === user.id).length}</td><td data-label="Prescription activity">{prescriptions.filter((prescription) => prescription.user?.id === user.id).length}</td><td data-label="Status"><StatusBadge status={user.status} /></td><td data-label="Action">{user.role !== 'ROLE_ADMIN' && <button className={`admin-action small ${user.status === 'ACTIVE' ? 'danger-outline' : 'secondary'}`} onClick={(event) => { event.stopPropagation(); toggleStatus(user); }}>{user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>}</td>
    </tr>)}</tbody></table></div></section>}
    </>}

    <Drawer open={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} title={selectedCustomer?.role === 'ROLE_ADMIN' ? 'Administrator' : selectedCustomer?.name || 'Customer profile'} subtitle={selectedCustomer?.email || ''} width="wide" footer={selectedCustomer?.role !== 'ROLE_ADMIN' && selectedCustomer && <button className={`admin-action ${selectedCustomer.status === 'ACTIVE' ? 'danger' : 'primary'}`} onClick={() => toggleStatus(selectedCustomer)}><ShieldCheck size={15} />{selectedCustomer.status === 'ACTIVE' ? 'Deactivate account' : 'Reactivate account'}</button>}>
      {selectedCustomer && <div className="customer-detail-content"><div className="customer-profile-hero"><span className="customer-profile-avatar">{selectedCustomer.role === 'ROLE_ADMIN' ? 'A' : selectedCustomer.name?.slice(0, 1) || 'U'}</span><div><h3>{selectedCustomer.role === 'ROLE_ADMIN' ? 'Administrator' : selectedCustomer.name}</h3><StatusBadge status={selectedCustomer.status} /></div></div><section className="detail-block"><h3>Contact information</h3><div className="customer-contact-list"><p><Mail size={16} />{selectedCustomer.email}</p><p><Phone size={16} />{selectedCustomer.phone || 'Phone not provided'}</p><p><MapPin size={16} />{selectedCustomer.address || 'Address not provided'}</p><p><UserRound size={16} />{selectedCustomer.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer account'}</p></div></section><section className="detail-block"><div className="panel-heading"><h3>Order history</h3><span>{customerOrders.length} orders</span></div>{customerOrders.length ? <div className="compact-record-list">{customerOrders.map((order) => <div key={order.id}><span><b>Order #{order.id}</b><small>{formatDate(order.createdAt)}</small></span><span>{currency(order.totalAmount)}</span><StatusBadge status={order.orderStatus} /></div>)}</div> : <p className="muted-note">No orders are associated with this account.</p>}</section><section className="detail-block"><div className="panel-heading"><h3>Prescription history</h3><span>{customerPrescriptions.length} submissions</span></div>{customerPrescriptions.length ? <div className="compact-record-list">{customerPrescriptions.map((prescription) => <div key={prescription.id}><span><b>Prescription #{prescription.id}</b><small>Submitted {formatDate(prescription.uploadedAt)}</small></span><StatusBadge status={prescription.status} /></div>)}</div> : <p className="muted-note">No prescription submissions are associated with this account.</p>}</section><p className="data-limitation-note">Registration date is not included in the current customer API response.</p></div>}
    </Drawer>
  </div>;
};
