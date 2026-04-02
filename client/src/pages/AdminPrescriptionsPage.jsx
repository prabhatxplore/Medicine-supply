import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'dispatched', label: 'Dispatched' },
];

const statusStyle = (s) => {
  const m = {
    pending: { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
    verified: { bg: '#dcfce7', color: '#15803d', label: 'Verified' },
    rejected: { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected' },
    dispatched: { bg: '#e0f2fe', color: '#0369a1', label: 'Dispatched' },
  };
  return m[s] || m.pending;
};

const AdminPrescriptionsPage = () => {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pendingOrders, setPendingOrders] = useState(0);

  const [verifyNotes, setVerifyNotes] = useState('');
  const [chk, setChk] = useState({ doctorNameVisible: false, dateReadable: false, signatureOrStampPresent: false });
  const [rejectReason, setRejectReason] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const loadOrdersCount = useCallback(async () => {
    try {
      const res = await fetch('https://medicine-supply.onrender.com/api/orders/admin/all', { credentials: 'include' });
      if (res.ok) {
        const orders = await res.json();
        setPendingOrders(orders.filter((o) => o.status === 'Pending').length);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const res = await fetch(`https://medicine-supply.onrender.com/api/prescriptions/admin/list${q}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setList(data);
      setSelected((prev) => {
        if (!prev) return null;
        const next = data.find((x) => x._id === prev._id);
        return next || null;
      });
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadOrdersCount();
  }, [loadOrdersCount]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = (row) => {
    setSelected(row);
    setVerifyNotes(row.verificationNotes || '');
    setChk({
      doctorNameVisible: !!row.verificationChecklist?.doctorNameVisible,
      dateReadable: !!row.verificationChecklist?.dateReadable,
      signatureOrStampPresent: !!row.verificationChecklist?.signatureOrStampPresent,
    });
    setRejectReason('');
    setDispatchNotes(row.dispatchNotes || '');
  };

  const patch = async (path, body) => {
    setBusy(true);
    try {
      const res = await fetch(`https://medicine-supply.onrender.com/api/prescriptions/${selected._id}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Action failed');
        return;
      }
      toast.success(path === '/verify' ? 'Marked as verified' : path === '/reject' ? 'Rejected' : 'Marked as dispatched');
      fetchList();
      setSelected(data);
    } catch {
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  };

  const fileUrl = selected?.prescriptionFile 
    ? (selected.prescriptionFile.startsWith('http') ? selected.prescriptionFile : `https://medicine-supply.onrender.com/${selected.prescriptionFile}`)
    : null;
  const isPdf = fileUrl && selected.prescriptionFile.toLowerCase().endsWith('.pdf');

  return (
    <AdminLayout active="Prescriptions" pageTitle="Prescriptions" pageSubtitle="Review uploads & dispatch medicine" pendingOrders={pendingOrders}>
      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
        {TABS.map((t) => (
          <button
            key={t.key || 'all'}
            type="button"
            onClick={() => setFilter(t.key)}
            style={{
              padding: '8px 14px',
              borderRadius: 9999,
              border: filter === t.key ? '2px solid #10b981' : '2px solid #e2e8f0',
              background: filter === t.key ? '#f0fdf4' : '#fff',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: filter === t.key ? '#059669' : '#64748b',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6" style={{ alignItems: 'start' }}>
        <div className="xl:col-span-2 card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '2rem', color: '#64748b' }}>Loading…</p>
          ) : list.length === 0 ? (
            <p style={{ padding: '2rem', color: '#64748b', textAlign: 'center' }}>No requests in this filter.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {list.map((row) => {
                const st = statusStyle(row.status);
                const active = selected?._id === row._id;
                return (
                  <li key={row._id}>
                    <button
                      type="button"
                      onClick={() => openDetail(row)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 14px',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        background: active ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.user?.name || 'User'} · {row.user?.email}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                            {new Date(row.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '4px 8px', borderRadius: 9999, background: st.bg, color: st.color, flexShrink: 0 }}>
                          {st.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="xl:col-span-3 card" style={{ padding: '1.25rem' }}>
          {!selected ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>Select a request to review the file and take action.</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Request #{String(selected._id).slice(-8).toUpperCase()}</h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selected.user?.email}</span>
              </div>

              {fileUrl && (
                <div style={{ marginBottom: '1rem', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {isPdf ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <p style={{ marginBottom: 12, color: '#475569' }}>PDF prescription</p>
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Open PDF in new tab
                      </a>
                    </div>
                  ) : (
                    <img src={fileUrl} alt="Prescription" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
                  )}
                </div>
              )}

              {selected.patientNote ? (
                <div style={{ marginBottom: '1rem', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: '0.875rem', color: '#334155' }}>
                  <strong>Patient note:</strong> {selected.patientNote}
                </div>
              ) : null}

              {selected.status === 'pending' && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: 10 }}>Verification checklist (all required to approve)</p>
                  {[
                    ['doctorNameVisible', 'Doctor / clinic name clearly visible'],
                    ['dateReadable', 'Date is readable and prescription is not expired'],
                    ['signatureOrStampPresent', 'Signature or official stamp present'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={chk[key]}
                        onChange={(e) => setChk((c) => ({ ...c, [key]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: 12, marginBottom: 4 }}>Internal notes (optional)</label>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    className="input-field"
                    rows={2}
                    placeholder="e.g. verified against registry…"
                    style={{ marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      disabled={busy || !chk.doctorNameVisible || !chk.dateReadable || !chk.signatureOrStampPresent}
                      className="btn btn-primary"
                      style={{ borderRadius: 10 }}
                      onClick={() => patch('/verify', { verificationNotes: verifyNotes, doctorNameVisible: true, dateReadable: true, signatureOrStampPresent: true })}
                    >
                      Approve (verify)
                    </button>
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rejection reason for patient…"
                        className="input-field"
                        style={{ marginBottom: 8 }}
                      />
                      <button
                        type="button"
                        disabled={busy || !rejectReason.trim()}
                        className="btn btn-danger"
                        style={{ borderRadius: 10, width: '100%' }}
                        onClick={() => patch('/reject', { rejectionReason: rejectReason.trim() })}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selected.status === 'verified' && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#15803d', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>✓ Verified — ready to pack and send medicine</p>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Dispatch note (optional, shown to patient)</label>
                  <textarea value={dispatchNotes} onChange={(e) => setDispatchNotes(e.target.value)} className="input-field" rows={2} style={{ marginBottom: 10 }} />
                  <button type="button" disabled={busy} className="btn btn-primary" style={{ borderRadius: 10 }} onClick={() => patch('/dispatch', { dispatchNotes: dispatchNotes.trim() })}>
                    Mark medicine as sent
                  </button>
                </div>
              )}

              {selected.status === 'rejected' && selected.rejectionReason && (
                <p style={{ color: '#b91c1c', fontSize: '0.875rem', padding: '10px 12px', background: '#fef2f2', borderRadius: 10 }}>
                  <strong>Rejected:</strong> {selected.rejectionReason}
                </p>
              )}

              {selected.status === 'dispatched' && (
                <p style={{ color: '#0369a1', fontSize: '0.875rem', padding: '10px 12px', background: '#e0f2fe', borderRadius: 10 }}>
                  Dispatched {selected.dispatchedAt ? new Date(selected.dispatchedAt).toLocaleString() : ''}
                  {selected.dispatchNotes ? ` — ${selected.dispatchNotes}` : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPrescriptionsPage;
