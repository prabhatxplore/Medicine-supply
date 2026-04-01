import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const STATUS_CONFIG = {
  Pending:   { color: '#a16207', bg: '#fef9c3', dot: '#eab308' },
  Processed: { color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
  Delivered: { color: '#15803d', bg: '#dcfce7', dot: '#10b981' },
  Cancelled: { color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
};

const FILTERS = ['All', 'Pending', 'Processed', 'Delivered'];

const AdminOrdersPage = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [expandedId, setExpanded] = useState(null);
  const [updatingId, setUpdating] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try { setOrders(await (await fetch('http://localhost:3000/api/orders/admin/all', { credentials: 'include' })).json()); }
    catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        toast.success(`Updated to ${newStatus}`);
      } else toast.error('Failed to update status');
    } catch { toast.error('Network error'); }
    finally { setUpdating(null); }
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);
  const count = (s) => s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
  const hasRx = (order) => order.items.some(i => i.medicine?.requiresPrescription);

  return (
    <AdminLayout active="Orders" pageTitle="Orders" pageSubtitle={`${orders.length} total · ${pendingCount} pending`} pendingOrders={pendingCount}>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 7, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(s => {
          const cfg = STATUS_CONFIG[s];
          const active = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999,
              border: `1.5px solid ${active ? (cfg?.dot || '#0f172a') : '#e2e8f0'}`,
              background: active ? (cfg?.bg || '#f1f5f9') : '#fff',
              color: active ? (cfg?.color || '#0f172a') : '#64748b',
              fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}>
              {s !== 'All' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg?.dot, display: 'inline-block', flexShrink: 0 }} />}
              {s}
              <span style={{ background: active ? 'rgba(0,0,0,.1)' : '#f1f5f9', color: active ? 'inherit' : '#94a3b8', borderRadius: 9999, padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 700 }}>
                {count(s)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin-smooth .8s linear infinite' }} />
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📭</div>
          <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No orders found</h3>
          <p style={{ color: '#64748b' }}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}orders to display.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((order, idx) => {
            const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const isExpanded = expandedId === order._id;
            const isUpdating = updatingId === order._id;
            const rx         = hasRx(order);

            return (
              <div key={order._id} className="card" style={{ overflow: 'hidden', animationDelay: `${idx * 35}ms` }}>

                {/* ── Header row ── */}
                <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem', alignItems: 'center' }}>

                  {/* Order ID + date */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Order</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', margin: 0, fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Customer</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                        {(order.user?.name || order.user?.email || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{order.user?.name || 'N/A'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{order.user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Total</p>
                    <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981', margin: 0 }}>NPR {order.totalAmount.toFixed(2)}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Prescription */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px' }}>Rx</p>
                    {rx ? (
                      order.prescription ? (
                        <button onClick={() => window.open(`http://localhost:3000/${order.prescription}`, '_blank')}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 7, padding: '4px 9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700 }}>
                          👁 View
                        </button>
                      ) : <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Missing</span>
                    ) : <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>}
                  </div>

                  {/* Status dropdown */}
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px' }}>Status</p>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select value={order.status} disabled={isUpdating}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        style={{ appearance: 'none', WebkitAppearance: 'none', padding: '5px 26px 5px 9px', borderRadius: 8, border: `1.5px solid ${cfg.dot}`, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', opacity: isUpdating ? 0.5 : 1, transition: 'all .15s' }}>
                        {['Pending', 'Processed', 'Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <svg style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: cfg.color }} width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Items pill row */}
                {!isExpanded && (
                  <div style={{ padding: '0.5rem 1.25rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {order.items.map((item, i) => (
                      <span key={i} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {item.medicine?.name || 'Unknown'} × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expand toggle */}
                <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                  style={{ width: '100%', padding: '0.5rem', border: 'none', borderTop: '1px solid #f1f5f9', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: '#64748b', fontFamily: 'inherit', fontSize: '0.8125rem', fontWeight: 600, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  {isExpanded
                    ? <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>Collapse</>
                    : <><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>View details</>}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="animate-fadeInDown" style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                    {/* Items */}
                    <div style={{ padding: '1rem 1.25rem' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                            <div>
                              <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.875rem' }}>{item.medicine?.name || 'Unknown'}</p>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '1px 0 0' }}>{item.quantity} × NPR {item.price.toFixed(2)}{item.medicine?.requiresPrescription && <span style={{ color: '#ef4444', fontWeight: 600 }}> · Rx</span>}</p>
                            </div>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>NPR {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer info */}
                    <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Customer</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { l: 'Name',    v: order.user?.name        || 'N/A' },
                          { l: 'Email',   v: order.user?.email       || 'N/A' },
                          { l: 'Phone',   v: order.user?.phoneNumber || 'N/A' },
                          { l: 'Address', v: order.user?.address     || 'N/A' },
                        ].map(({ l, v }) => (
                          <div key={l}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
                            <p style={{ fontWeight: 600, color: '#374151', margin: 0, fontSize: '0.8125rem', wordBreak: 'break-word' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 1px' }}>Placed</p>
                        <p style={{ fontWeight: 500, color: '#374151', margin: 0, fontSize: '0.8125rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 1px' }}>Updated</p>
                        <p style={{ fontWeight: 500, color: '#374151', margin: 0, fontSize: '0.8125rem' }}>{new Date(order.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;