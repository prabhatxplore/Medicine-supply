import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS = {
  pending: { label: 'Under review', color: '#b45309', bg: '#fffbeb', icon: '⏳' },
  verified: { label: 'Verified — preparing', color: '#15803d', bg: '#dcfce7', icon: '✓' },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fee2e2', icon: '✕' },
  dispatched: { label: 'Medicine sent', color: '#0369a1', bg: '#e0f2fe', icon: '🚚' },
};

const MyPrescriptionsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [file, setFile] = useState(null);
  const [patientNote, setPatientNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/prescriptions/my', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        setList([]);
        return;
      }
      setUnauthorized(false);
      if (!res.ok) throw new Error();
      setList(await res.json());
    } catch {
      toast.error('Could not load prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const handlePick = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      toast.error('Use JPG, PNG, WebP or PDF');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a prescription file');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('prescription', file);
      fd.append('patientNote', patientNote);
      const res = await fetch('http://localhost:3000/api/prescriptions', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Upload failed');
        return;
      }
      toast.success('Prescription uploaded');
      setFile(null);
      setPatientNote('');
      fetchMine();
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:underline mb-2 inline-block">
          ← Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My prescriptions</h1>
        <p className="text-slate-500 mt-1">Track uploads and pharmacy verification status.</p>
      </div>

      {unauthorized ? (
        <div className="card p-10 text-center">
          <p className="text-slate-600 mb-4">Sign in with a customer account to view prescription uploads.</p>
          <Link to="/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleUpload} className="card p-5 mb-6 border border-slate-200/90">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Upload new prescription</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">File *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => handlePick(e.target.files[0])}
                  className="input-field"
                />
                {file ? <p className="text-xs text-slate-500 mt-2">{file.name}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Note (optional)</label>
                <textarea
                  rows={2}
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  placeholder="Any medicine note for pharmacist..."
                  className="input-field"
                />
              </div>
              <div>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Uploading…' : 'Upload Prescription'}
                </button>
              </div>
            </div>
          </form>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-600 mb-4">No prescription uploads yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => {
            const st = STATUS[r.status] || STATUS.pending;
            return (
              <li key={r._id} className="card p-5 border border-slate-200/90">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.icon} {st.label}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">
                      Submitted {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">#{String(r._id).slice(-8).toUpperCase()}</span>
                </div>
                {r.patientNote ? (
                  <p className="text-sm text-slate-600 mb-4 border-l-2 border-emerald-200 pl-3">{r.patientNote}</p>
                ) : null}
                {r.status === 'rejected' && r.rejectionReason ? (
                  <p className="text-sm text-red-800 bg-red-50 rounded-lg px-3 py-2 mb-2">
                    <strong>Reason:</strong> {r.rejectionReason}
                  </p>
                ) : null}
                {r.status === 'dispatched' && r.dispatchNotes ? (
                  <p className="text-sm text-sky-900 bg-sky-50 rounded-lg px-3 py-2">
                    <strong>Note:</strong> {r.dispatchNotes}
                  </p>
                ) : null}
                {r.prescriptionFile ? (
                  <a
                    href={`http://localhost:3000/${r.prescriptionFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    View uploaded file →
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
        </>
      )}
    </div>
  );
};

export default MyPrescriptionsPage;
