import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PrescriptionUploadSection = ({ isAuthenticated, userRole }) => {
  const [file, setFile] = useState(null);
  const [patientNote, setPatientNote] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCustomer = isAuthenticated && userRole === 'user';

  const onFile = useCallback((f) => {
    if (!f) return;
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type);
    if (!ok) {
      toast.error('Use JPG, PNG, WebP or PDF (max 5MB)');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    onFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCustomer) {
      toast.error('Please sign in as a customer to upload');
      return;
    }
    if (!file) {
      toast.error('Choose a prescription file');
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('prescription', file);
    fd.append('patientNote', patientNote);
    try {
      const res = await fetch('https://medicine-supply.onrender.com/api/prescriptions', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Prescription submitted. Our pharmacist will review it shortly.');
        setFile(null);
        setPatientNote('');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
      <div className="card overflow-hidden border border-slate-200/90 shadow-md" style={{ borderRadius: '1.25rem' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          <div
            className="lg:col-span-2 p-6 sm:p-8 text-white flex flex-col justify-center"
            style={{
              background: 'linear-gradient(145deg, #0f766e 0%, #0d9488 45%, #0369a1 100%)',
            }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100/80 mb-3">
              <span className="text-lg">📋</span> Direct upload
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Have a prescription?
            </h2>
            <p className="text-emerald-50/80 text-sm leading-relaxed mb-6">
              Upload a clear photo or PDF. Our licensed team verifies doctor details, date, and signature before
              preparing your medicine. You&apos;ll see status updates under My prescriptions.
            </p>
            <ul className="space-y-2 text-sm text-emerald-100/90">
              {['Doctor name & clinic visible', 'Date readable (not expired)', 'Signature or stamp present'].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="text-emerald-300 mt-0.5">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 p-6 sm:p-8 bg-white">
            {!isCustomer ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Sign in with your customer account to upload a prescription.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/login" className="btn btn-primary">
                    Sign in
                  </Link>
                  <Link to="/signup" className="btn btn-secondary">
                    Create account
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prescription file *</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={[
                      'rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer',
                      dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300',
                    ].join(' ')}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      id="prescription-home-file"
                      onChange={(e) => onFile(e.target.files[0])}
                    />
                    <label htmlFor="prescription-home-file" className="cursor-pointer block">
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-slate-700 font-medium text-sm">
                        {file ? file.name : 'Drop file here or click to browse'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP or PDF · max 5MB</p>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="patient-note" className="block text-sm font-semibold text-slate-700 mb-2">
                    Note for pharmacist <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="patient-note"
                    rows={3}
                    value={patientNote}
                    onChange={(e) => setPatientNote(e.target.value)}
                    placeholder="e.g. medicines needed, allergies, delivery address reminder…"
                    className="input-field w-full resize-y min-h-[90px]"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
                    {submitting ? 'Uploading…' : 'Submit prescription'}
                  </button>
                  <Link to="/prescriptions" className="text-sm font-semibold text-emerald-700 hover:underline">
                    View my uploads →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionUploadSection;
