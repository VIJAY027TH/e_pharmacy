import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, FileCheck2, FileImage, FileText, Search, ShieldCheck, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { medicineService } from '../../services/medicineService';
import API from '../../services/api';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge, formatDate } from '../../components/admin/AdminUI';

const queueTabs = [{ key: 'PENDING', label: 'Needs review' }, { key: 'APPROVED', label: 'Approved' }, { key: 'REJECTED', label: 'Rejected' }, { key: 'EXPIRED', label: 'Expired' }];

function useSecureDocument(fileUrl) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!fileUrl) return undefined;
    let active = true; let objectUrl = '';
    setLoading(true); setError(''); setDocumentUrl('');
    const base = API.defaults.baseURL || '/api';
    const origin = base.startsWith('http') ? new URL(base).origin : window.location.origin;
    API.get(`${origin}${fileUrl}`, { responseType: 'blob' }).then((response) => {
      objectUrl = URL.createObjectURL(response.data);
      if (active) setDocumentUrl(objectUrl);
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || 'Document preview could not be loaded.');
    }).finally(() => active && setLoading(false));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileUrl]);
  return { documentUrl, loading, error };
}

function DocumentPanel({ prescription }) {
  const { documentUrl, loading, error } = useSecureDocument(prescription?.fileUrl);
  const filename = prescription?.fileUrl?.split('/').pop() || 'Prescription document';
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(filename);
  return <div className="prescription-document"><div className="document-toolbar"><span><FileImage size={15} /> Original submission</span>{documentUrl && <a href={documentUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open separately</a>}</div>{loading ? <div className="document-placeholder"><span className="document-loader" /><b>Loading secure preview…</b></div> : error ? <div className="document-placeholder document-error"><FileText size={23} /><b>Preview unavailable</b><small>{error}</small></div> : documentUrl ? isImage ? <img className="document-image-preview" src={documentUrl} alt={`Prescription submitted by ${prescription?.user?.name || 'customer'}`} /> : <iframe className="document-frame" src={documentUrl} title={`Prescription ${prescription.id} document preview`} /> : <div className="document-placeholder"><FileText size={24} /><b>Select a submission to review</b><small>The submitted document preview will appear here.</small></div>}</div>;
}

export const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [medicineIds, setMedicineIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [rxRows, medicineRows] = await Promise.all([adminService.getPrescriptions(), medicineService.getAllMedicines()]);
      setPrescriptions(rxRows); setMedicines(medicineRows);
      setSelectedId((previous) => previous && rxRows.some((prescription) => prescription.id === previous) ? previous : rxRows.find((prescription) => prescription.status === 'PENDING')?.id ?? rxRows[0]?.id ?? null);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Prescription records could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const currentList = useMemo(() => prescriptions.filter((prescription) => prescription.status === activeTab && `${prescription.user?.name || ''} ${prescription.user?.email || ''} ${prescription.id}`.toLowerCase().includes(query.trim().toLowerCase())), [prescriptions, activeTab, query]);
  const selected = prescriptions.find((prescription) => prescription.id === selectedId) || null;
  const selectPrescription = (prescription) => { setSelectedId(prescription.id); setMedicineIds([]); setNotes(''); setActionError(''); };
  const toggleMedicine = (medicineId) => setMedicineIds((previous) => previous.includes(medicineId) ? previous.filter((id) => id !== medicineId) : [...previous, medicineId]);

  const approve = async () => {
    setActionError('');
    if (medicineIds.length === 0) { setActionError('Select at least one authorized medicine before approving.'); return; }
    setSaving(true);
    try { await adminService.approvePrescription(selected.id, notes || undefined, medicineIds); await load(); setActiveTab('APPROVED'); }
    catch (requestError) { setActionError(requestError.response?.data?.message || 'This prescription could not be approved.'); }
    finally { setSaving(false); }
  };
  const reject = async () => {
    if (!selected) return;
    setActionError(''); setSaving(true);
    try { await adminService.rejectPrescription(selected.id, notes || undefined); await load(); setActiveTab('REJECTED'); }
    catch (requestError) { setActionError(requestError.response?.data?.message || 'This prescription could not be rejected.'); }
    finally { setSaving(false); }
  };

  return <div className="admin-page prescription-page">
    <PageHeader eyebrow="PHARMACIST WORKSPACE" title="Prescription center" subtitle="Review and manage prescription submissions with a clear, secure workflow." actions={<span className="order-count-chip"><ShieldCheck size={16} /> Clinical review queue</span>} />
    <div className="prescription-workbench">
      <aside className="prescription-queue admin-panel"><div className="queue-header"><div><span className="admin-eyebrow">SUBMISSIONS</span><h2>Review queue</h2></div><span className="queue-total">{prescriptions.length}</span></div><label className="queue-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find patient or ID" aria-label="Find prescription" /></label><div className="queue-tabs" role="tablist" aria-label="Filter prescription status">{queueTabs.map((tab) => <button key={tab.key} role="tab" aria-selected={activeTab === tab.key} className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}><span>{tab.label}</span><b>{prescriptions.filter((prescription) => prescription.status === tab.key).length}</b></button>)}</div>
        {loading ? <LoadingState label="Loading submissions…" /> : error ? <ErrorState message={error} onRetry={load} /> : currentList.length ? <div className="prescription-queue-list">{currentList.map((prescription) => <button key={prescription.id} className={`prescription-queue-item ${selectedId === prescription.id ? 'selected' : ''}`} onClick={() => selectPrescription(prescription)}><span className="queue-patient-avatar">{prescription.user?.name?.slice(0, 1) || 'P'}</span><span className="queue-patient-info"><b>{prescription.user?.name || 'Patient'}</b><small>Prescription #{prescription.id}</small><small>Submitted {formatDate(prescription.uploadedAt)}</small></span><StatusBadge status={prescription.status} /></button>)}</div> : <EmptyState title={query ? 'No matching submissions' : `No ${activeTab.toLowerCase()} submissions`} description={query ? 'Try a different patient name or ID.' : 'This review queue is clear.'} icon={FileCheck2} />}
      </aside>
      <section className="prescription-review-panel admin-panel">{selected ? <>
        <div className="review-panel-head"><div><span className="admin-eyebrow">PRESCRIPTION #{selected.id}</span><h2>{selected.user?.name || 'Patient submission'}</h2><p>{selected.user?.email || 'Patient email not available'}</p></div><StatusBadge status={selected.status} /></div>
        <div className="prescription-meta-strip"><div><small>Submitted</small><b>{formatDate(selected.uploadedAt, true)}</b></div><div><small>Verified by</small><b>{selected.verifiedBy || 'Awaiting review'}</b></div></div>
        <DocumentPanel prescription={selected} />
        {selected.medicines?.length > 0 && <section className="authorized-medicines"><h3>Authorized medicines</h3><div>{selected.medicines.map((medicine) => <span key={medicine.id}>{medicine.name}{medicine.dosage ? ` · ${medicine.dosage}` : ''}</span>)}</div></section>}
        {selected.status === 'PENDING' ? <section className="review-decision"><div className="review-decision-heading"><span className="admin-eyebrow">PHARMACIST DECISION</span><h3>Review authorization</h3><p>Select the medicines covered by the submitted prescription, then approve or reject it.</p></div>{actionError && <div className="inline-error" role="alert">{actionError}</div>}
          <fieldset className="medicine-authorization"><legend>Medicines this prescription covers</legend><div>{medicines.map((medicine) => <label key={medicine.id} className={medicineIds.includes(medicine.id) ? 'checked' : ''}><input type="checkbox" checked={medicineIds.includes(medicine.id)} onChange={() => toggleMedicine(medicine.id)} /><span><b>{medicine.name}</b><small>{medicine.dosage || medicine.composition || 'Catalog medicine'}{medicine.requiresPrescription ? ' · Rx' : ''}</small></span></label>)}</div></fieldset>
          <label className="admin-form-label">Review notes <textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add clinical review notes (optional)" /></label>
          <div className="review-actions"><button className="admin-action primary" disabled={saving} onClick={approve}><CheckCircle2 size={16} />{saving ? 'Saving…' : 'Approve prescription'}</button><button className="admin-action danger-outline" disabled={saving} onClick={reject}><XCircle size={16} />Reject submission</button></div>
        </section> : <div className="review-complete-note"><CheckCircle2 size={17} /> Review status: <b>{selected.status}</b>{selected.notes && <span> · {selected.notes}</span>}</div>}
      </> : <EmptyState title="Select a prescription" description="Choose a patient submission from the queue to review its document and details." icon={FileCheck2} />}</section>
    </div>
  </div>;
};
