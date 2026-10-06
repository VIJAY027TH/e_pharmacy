import React, { useState, useEffect, useRef } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { Upload, FileText, CheckCircle2, Clock, XCircle, AlertCircle, X } from 'lucide-react';
import { parseServerDate } from '../utils/dateUtils';

export const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionService.getUserPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a prescription file (Image / PDF)');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await prescriptionService.upload(formData);
      setMessage('Prescription uploaded successfully! Sent for pharmacist verification.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (p) => {
    const isExpired = p.status === 'EXPIRED';
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 bg-warm-200 text-warm-700 text-xs font-bold px-3 py-1 rounded-full">
          <AlertCircle className="h-3.5 w-3.5 text-warm-600" /> EXPIRED
        </span>
      );
    }
    switch (p.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 bg-sage-100 text-sage-800 text-xs font-bold px-3 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-sage-600" /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
            <XCircle className="h-3.5 w-3.5 text-rose-600" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gold-100 text-gold-800 text-xs font-bold px-3 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5 text-gold-600" /> PENDING REVIEW
          </span>
        );
    }
  };

  return (
    <div className="customer-page prescription-center-page max-w-4xl mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-warm-900">Prescription Center</h1>
        <p className="text-sm text-warm-600 mt-1">
          Upload doctor prescriptions for pharmacist approval before purchasing restricted medicines.
        </p>
      </div>

      {message && (
        <div className="bg-sage-50 border border-sage-200 text-sage-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-sage-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="prescription-upload-panel bg-white p-8 rounded-3xl border border-warm-200/60 shadow-sm space-y-6">
        <h3 className="font-bold text-warm-900 text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-sage-600" /> Upload New Prescription
        </h3>

        <div className="border-2 border-dashed border-warm-300 rounded-2xl p-8 text-center bg-warm-50/50 hover:bg-warm-50 transition">
          <FileText className="h-10 w-10 text-sage-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-warm-900">Select file from computer or device</p>
          <p className="text-xs text-warm-500 mt-1">Supports JPG, PNG, PDF formats (Max 10MB)</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              e.target.value = '';
            }}
            className="hidden"
            id="prescription-file"
          />

          <label
            htmlFor="prescription-file"
            className="inline-block mt-4 bg-sage-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer hover:bg-sage-700 transition"
          >
            Choose File
          </label>

          {file && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <p className="text-xs font-bold text-sage-700 bg-sage-50 py-1.5 px-3 rounded-lg border border-sage-200">
                Selected: {file.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-warm-600 hover:bg-warm-200 transition"
                aria-label="Remove selected prescription file"
                title="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full font-bold py-3.5 rounded-xl text-white transition ${
            !file || loading ? 'bg-warm-300 cursor-not-allowed' : 'bg-sage-600 hover:bg-sage-700'
          }`}
        >
          {loading ? 'Uploading File...' : 'Submit Prescription'}
        </button>
      </form>

      {/* Prescription History */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200/60 shadow-sm space-y-6">
        <h3 className="font-bold text-warm-900 text-lg">Your Uploaded Prescriptions</h3>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-warm-500">No prescriptions uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="customer-prescription-card p-4 rounded-2xl border border-warm-200/60 bg-warm-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-warm-900 text-sm">Prescription #{p.id}</h4>
                    <p className="text-xs text-warm-500 mt-0.5">Uploaded on {parseServerDate(p.uploadedAt)?.toLocaleString() || '—'}</p>
                    {p.notes && <p className="text-xs text-warm-700 mt-1 font-medium">Notes: {p.notes}</p>}
                  </div>
                  <div>{getStatusBadge(p)}</div>
                </div>

                {p.medicines && p.medicines.length > 0 && (
                  <div className="pt-2 border-t border-warm-200/50 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-sage-800">Approved Medicines:</span>
                    {p.medicines.map((m) => (
                      <span key={m.id} className="text-[11px] font-semibold bg-white text-sage-800 px-2 py-0.5 rounded border border-sage-200">
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
