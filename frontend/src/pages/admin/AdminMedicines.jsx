import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit3, Ellipsis, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { medicineService } from '../../services/medicineService';
import { Drawer, EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge, currency } from '../../components/admin/AdminUI';

const blankMedicine = { name: '', brand: '', composition: '', dosage: '', unitType: 'units', unitsPerPack: 1, description: '', price: '', stockQuantity: '', categoryId: '', requiresPrescription: false, imageUrl: '', ailment: '' };

const stockStatus = (quantity) => Number(quantity) <= 0 ? 'Out of stock' : Number(quantity) <= 10 ? 'Low stock' : 'In stock';

export const AdminMedicines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [rxFilter, setRxFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(blankMedicine);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [medicineRows, categoryRows] = await Promise.all([medicineService.getAllMedicines(), medicineService.getCategories()]);
      setMedicines(medicineRows); setCategories(categoryRows);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The inventory could not be loaded.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSearch(searchParams.get('search') || ''); }, [searchParams]);

  const filtered = useMemo(() => medicines.filter((medicine) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [medicine.name, medicine.brand, medicine.composition, medicine.ailment].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || String(medicine.category?.id || '') === categoryFilter;
    const quantity = Number(medicine.stockQuantity);
    const matchesStock = stockFilter === 'all' || (stockFilter === 'out' ? quantity <= 0 : stockFilter === 'low' ? quantity > 0 && quantity <= 10 : quantity > 10);
    const matchesRx = rxFilter === 'all' || (rxFilter === 'required' ? medicine.requiresPrescription : !medicine.requiresPrescription);
    return matchesSearch && matchesCategory && matchesStock && matchesRx;
  }), [medicines, search, categoryFilter, stockFilter, rxFilter]);

  const openCreate = () => { setEditingId(null); setFormData({ ...blankMedicine, categoryId: categories[0]?.id || '' }); setFormError(''); setDrawerOpen(true); };
  const openEdit = (medicine) => { setEditingId(medicine.id); setFormData({ name: medicine.name || '', brand: medicine.brand || '', composition: medicine.composition || '', dosage: medicine.dosage || '', unitType: medicine.unitType || 'units', unitsPerPack: medicine.unitsPerPack || 1, description: medicine.description || '', price: medicine.price ?? '', stockQuantity: medicine.stockQuantity ?? '', categoryId: medicine.category?.id || '', requiresPrescription: Boolean(medicine.requiresPrescription), imageUrl: medicine.imageUrl || '', ailment: medicine.ailment || '' }); setFormError(''); setDrawerOpen(true); };

  const saveMedicine = async (event) => {
    event.preventDefault(); setSaving(true); setFormError('');
    const payload = { ...formData, price: Number(formData.price), stockQuantity: Number(formData.stockQuantity), categoryId: Number(formData.categoryId), unitsPerPack: Number(formData.unitsPerPack) };
    try {
      if (editingId) await adminService.updateMedicine(editingId, payload);
      else await adminService.createMedicine(payload);
      setDrawerOpen(false); await load();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'The medicine could not be saved. Please review the fields and try again.');
    } finally { setSaving(false); }
  };

  const deleteMedicine = async (medicine) => {
    if (!window.confirm(`Delete ${medicine.name} from the catalog?`)) return;
    try { await adminService.deleteMedicine(medicine.id); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'This medicine could not be deleted.'); }
  };

  const setGlobalSearch = (value) => { setSearch(value); setSearchParams(value.trim() ? { search: value.trim() } : {}); };

  return <div className="admin-page inventory-page">
    <PageHeader eyebrow="CATALOG OPERATIONS" title="Inventory" subtitle="Manage medicines, availability, pricing and prescription requirements." actions={<button className="admin-action primary" onClick={openCreate}><Plus size={16} /> Add medicine</button>} />
    <section className="inventory-overview-strip"><div><span>CATALOG ITEMS</span><b>{medicines.length}</b></div><div><span>LOW STOCK</span><b>{medicines.filter((medicine) => Number(medicine.stockQuantity) > 0 && Number(medicine.stockQuantity) <= 10).length}</b></div><div><span>OUT OF STOCK</span><b>{medicines.filter((medicine) => Number(medicine.stockQuantity) <= 0).length}</b></div><div><span>RX REQUIRED</span><b>{medicines.filter((medicine) => medicine.requiresPrescription).length}</b></div></section>
    <section className="inventory-workspace admin-panel">
      <div className="inventory-toolbar"><label className="inventory-search"><Search size={17} /><input value={search} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search name, brand or composition" aria-label="Search inventory" /></label><div className="inventory-filters"><label><span>Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label><span>Stock</span><select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}><option value="all">All stock</option><option value="healthy">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></label><label><span>Prescription</span><select value={rxFilter} onChange={(event) => setRxFilter(event.target.value)}><option value="all">All medicines</option><option value="required">Required</option><option value="not-required">Not required</option></select></label></div></div>
      {loading ? <LoadingState label="Loading inventory…" /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? <EmptyState title={medicines.length ? 'No matching medicines' : 'Your inventory is empty'} description={medicines.length ? 'Try adjusting the search or filters.' : 'Add the first medicine to start organizing your catalog.'} icon={FileText} action={!medicines.length && <button className="admin-action primary" onClick={openCreate}><Plus size={15} /> Add medicine</button>} /> : <>
        <div className="table-caption"><span>{filtered.length} medicine{filtered.length === 1 ? '' : 's'}</span><span>Availability reflects current catalog stock</span></div>
        <div className="admin-table-scroll"><table className="admin-table inventory-table"><thead><tr><th>Medicine</th><th>Category</th><th>Price</th><th>Stock</th><th>Prescription</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filtered.map((medicine) => <tr key={medicine.id}>
          <td data-label="Medicine"><div className="table-medicine"><span className="medicine-thumb">{medicine.imageUrl ? <img src={medicine.imageUrl} alt="" /> : <FileText size={17} />}</span><span><b>{medicine.name}</b><small>{medicine.brand || 'Generic'}{medicine.dosage ? ` · ${medicine.dosage}` : ''}</small></span></div></td>
          <td data-label="Category">{medicine.category?.name || 'Uncategorized'}</td><td data-label="Price" className="table-primary-value">{currency(medicine.price)}</td><td data-label="Stock"><b>{medicine.stockQuantity}</b> <span className="muted-cell">packs</span></td><td data-label="Prescription"><StatusBadge status={medicine.requiresPrescription ? 'PENDING' : 'NEUTRAL'}>{medicine.requiresPrescription ? 'Required' : 'Not required'}</StatusBadge></td><td data-label="Status"><StatusBadge status={stockStatus(medicine.stockQuantity)} /></td>
          <td data-label="Actions"><details className="row-actions"><summary aria-label={`Actions for ${medicine.name}`}><Ellipsis size={18} /></summary><div><button onClick={() => openEdit(medicine)}><Edit3 size={14} /> Edit details</button><button className="danger-option" onClick={() => deleteMedicine(medicine)}><Trash2 size={14} /> Delete medicine</button></div></details></td>
        </tr>)}</tbody></table></div>
      </>}
    </section>

    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? 'Edit medicine' : 'Add a medicine'} subtitle="Catalog details are saved to the pharmacy inventory." width="wide" footer={<><button className="admin-action secondary" onClick={() => setDrawerOpen(false)}>Cancel</button><button className="admin-action primary" type="submit" form="medicine-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add medicine'}</button></>}>
      <form id="medicine-form" className="admin-form" onSubmit={saveMedicine}>
        {formError && <div className="inline-error" role="alert">{formError}</div>}
        <fieldset><legend>Medicine identity</legend><div className="admin-form-grid"><label className="span-2">Medicine name<input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></label><label>Brand<input value={formData.brand} onChange={(event) => setFormData({ ...formData, brand: event.target.value })} /></label><label>Category<select required value={formData.categoryId} onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Dosage<input placeholder="e.g. 500 mg" value={formData.dosage} onChange={(event) => setFormData({ ...formData, dosage: event.target.value })} /></label><label>Composition<input value={formData.composition} onChange={(event) => setFormData({ ...formData, composition: event.target.value })} /></label></div></fieldset>
        <fieldset><legend>Pack & availability</legend><div className="admin-form-grid"><label>Price<input type="number" min="0" step="0.01" required value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} /></label><label>Stock quantity (packs)<input type="number" min="0" required value={formData.stockQuantity} onChange={(event) => setFormData({ ...formData, stockQuantity: event.target.value })} /></label><label>Units per pack<input type="number" min="1" step="1" required value={formData.unitsPerPack} onChange={(event) => setFormData({ ...formData, unitsPerPack: event.target.value })} /><small>Number of individual units in one saleable pack.</small></label><label>Unit type<select required value={formData.unitType} onChange={(event) => setFormData({ ...formData, unitType: event.target.value })}><option value="units">Units</option><option value="tablets">Tablets</option><option value="capsules">Capsules</option><option value="ml">Millilitres (ml)</option><option value="g">Grams (g)</option><option value="sachets">Sachets</option></select></label><label>Target ailment<input value={formData.ailment} onChange={(event) => setFormData({ ...formData, ailment: event.target.value })} /></label><label>Image URL<input type="url" value={formData.imageUrl} onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })} /></label></div><label className="check-field"><input type="checkbox" checked={formData.requiresPrescription} onChange={(event) => setFormData({ ...formData, requiresPrescription: event.target.checked })} /><span><b>Prescription required</b><small>Mark medicines that require prescription review at checkout.</small></span></label></fieldset>
        <fieldset><legend>Clinical description</legend><label>Description<textarea rows="4" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} /></label></fieldset>
      </form>
    </Drawer>
  </div>;
};
