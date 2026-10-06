import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Edit3, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { medicineService } from '../../services/medicineService';
import { Drawer, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/admin/AdminUI';

export const AdminCategories = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [medicineCounts, setMedicineCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [reassignModal, setReassignModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const rows = await medicineService.getCategories();
      setCategories(rows);
      const counts = await Promise.all(rows.map(async (category) => {
        try { return [category.id, await adminService.getCategoryMedicineCount(category.id)]; }
        catch { return [category.id, null]; }
      }));
      setMedicineCounts(Object.fromEntries(counts));
    } catch (requestError) { setError(requestError.response?.data?.message || 'Categories could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQuery(searchParams.get('search') || ''); }, [searchParams]);

  const openCreate = () => { setEditingCategory(null); setFormData({ name: '', description: '' }); setFormError(''); setDrawerOpen(true); };
  const openEdit = (category) => { setEditingCategory(category); setFormData({ name: category.name || '', description: category.description || '' }); setFormError(''); setDrawerOpen(true); };

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setFormError('');
    try {
      if (editingCategory) await adminService.updateCategory(editingCategory.id, formData);
      else await adminService.createCategory(formData);
      setDrawerOpen(false); await load();
    } catch (requestError) { setFormError(requestError.response?.data?.message || 'The category could not be saved.'); }
    finally { setSaving(false); }
  };

  const requestDelete = async (category) => {
    try {
      const count = await adminService.getCategoryMedicineCount(category.id);
      if (count === 0) {
        if (window.confirm(`Delete “${category.name}”?`)) { await adminService.deleteCategory(category.id); await load(); }
        return;
      }
      const available = categories.filter((item) => item.id !== category.id);
      if (!available.length) { setError(`“${category.name}” contains ${count} medicines. Create another category before removing it.`); return; }
      setReassignModal({ category, medicineCount: count, replacementId: String(available[0].id), error: '' });
    } catch (requestError) { setError(requestError.response?.data?.message || 'The category could not be checked or deleted.'); }
  };

  const reassignAndDelete = async () => {
    if (!reassignModal) return;
    try { await adminService.deleteCategory(reassignModal.category.id, reassignModal.replacementId); setReassignModal(null); await load(); }
    catch (requestError) { setReassignModal({ ...reassignModal, error: requestError.response?.data?.message || 'The category could not be deleted.' }); }
  };

  const filtered = categories.filter((category) => `${category.name} ${category.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className="admin-page categories-page">
    <PageHeader eyebrow="CATALOG STRUCTURE" title="Medicine categories" subtitle="Organize the PharmaVital inventory into clear therapeutic groups." actions={<button className="admin-action primary" onClick={openCreate}><Plus size={16} /> New category</button>} />
    <div className="category-toolbar admin-panel"><label className="inventory-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" aria-label="Search categories" /></label><span>{categories.length} categories</span></div>
    {loading ? <LoadingState label="Loading categories…" /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? <EmptyState title={categories.length ? 'No matching categories' : 'No categories yet'} description={categories.length ? 'Try a different search.' : 'Create categories to organize the medicine catalog.'} icon={FolderOpen} action={!categories.length && <button className="admin-action primary" onClick={openCreate}><Plus size={15} /> Create category</button>} /> : <div className="category-list">{filtered.map((category, index) => <article className="category-row admin-panel" key={category.id}><span className={`category-monogram monogram-${index % 4}`}><Activity size={19} /></span><div className="category-row-copy"><h2>{category.name}</h2><p>{category.description || 'No description has been added.'}</p><span className="category-item-count">{medicineCounts[category.id] === null || medicineCounts[category.id] === undefined ? 'Count unavailable' : `${medicineCounts[category.id]} ${medicineCounts[category.id] === 1 ? 'medicine' : 'medicines'}`}</span></div><span className="category-status">Catalog category</span><div className="category-row-actions"><button className="admin-action small secondary" onClick={() => openEdit(category)}><Edit3 size={14} /> Edit</button><button className="admin-action small danger-outline" onClick={() => requestDelete(category)} aria-label={`Delete ${category.name}`}><Trash2 size={14} /></button></div></article>)}</div>}

    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingCategory ? 'Edit category' : 'Create a category'} subtitle="Use a clear name customers and staff can recognize." footer={<><button className="admin-action secondary" onClick={() => setDrawerOpen(false)}>Cancel</button><button className="admin-action primary" type="submit" form="category-form" disabled={saving}>{saving ? 'Saving…' : editingCategory ? 'Save category' : 'Create category'}</button></>}>
      <form id="category-form" className="admin-form" onSubmit={save}>{formError && <div className="inline-error" role="alert">{formError}</div>}<fieldset><legend>Category details</legend><label>Category name<input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="e.g. Primary Vitality & Daily Health" /></label><label>Description<textarea rows="4" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Describe the care area" /></label></fieldset></form>
    </Drawer>

    <Drawer open={Boolean(reassignModal)} onClose={() => setReassignModal(null)} title="Reassign medicines" subtitle="A category with medicines must be safely reassigned before deletion." footer={<><button className="admin-action secondary" onClick={() => setReassignModal(null)}>Keep category</button><button className="admin-action danger" onClick={reassignAndDelete}><Trash2 size={14} /> Move & delete</button></>}>
      {reassignModal && <div className="reassign-content"><div className="reassign-notice"><Activity size={18} /><p><b>{reassignModal.medicineCount} medicines</b> currently use <b>{reassignModal.category.name}</b>. Select a destination category before deleting it.</p></div>{reassignModal.error && <div className="inline-error" role="alert">{reassignModal.error}</div>}<label className="admin-form-label">Move medicines to<select value={reassignModal.replacementId} onChange={(event) => setReassignModal({ ...reassignModal, replacementId: event.target.value })}>{categories.filter((category) => category.id !== reassignModal.category.id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div>}
    </Drawer>
  </div>;
};
