import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Pending:   { label: 'Pending',   color: '#a16207', bg: '#fef9c3', icon: '⏳', step: 0 },
  Processed: { label: 'Processed', color: '#1d4ed8', bg: '#dbeafe', icon: '📦', step: 1 },
  Delivered: { label: 'Delivered', color: '#15803d', bg: '#dcfce7', icon: '✅', step: 2 },
  Cancelled: { label: 'Cancelled', color: '#b91c1c', bg: '#fee2e2', icon: '❌', step: -1 },
};

const OrderTimeline = ({ status }) => {
  const steps = ['Pending', 'Processed', 'Delivered'];
  const current = STATUS_CONFIG[status]?.step ?? 0;
  if (current < 0) return null; // cancelled - no timeline
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0.75rem 0' }}>
      {steps.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'linear-gradient(135deg,#10b981,#0d9488)' : '#f1f5f9',
                border: active ? '3px solid #10b981' : done ? 'none' : '2px solid #e2e8f0',
                transition: 'all .3s', fontSize: '0.875rem', boxShadow: active ? '0 0 0 4px rgba(16,185,129,.15)' : 'none',
              }}>
                {done ? (
                  i < current
                    ? <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    : <span style={{ fontSize: 14 }}>{STATUS_CONFIG[s]?.icon}</span>
                ) : (
                  <span style={{ width: 8, height: 8, background: '#cbd5e1', borderRadius: '50%', display: 'block' }} />
                )}
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: done ? '#10b981' : '#94a3b8', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, background: i < current ? '#10b981' : '#e2e8f0', margin: '0 4px', marginBottom: 18, borderRadius: 2, transition: 'background .4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/orders', { credentials: 'include' });
        const data = await res.json();
        setOrders(data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    const at = new Date(a?.createdAt ?? 0).getTime();
    const bt = new Date(b?.createdAt ?? 0).getTime();
    if (!Number.isFinite(at) && !Number.isFinite(bt)) return 0;
    if (!Number.isFinite(at)) return 1;
    if (!Number.isFinite(bt)) return -1;
    return bt - at;
  });

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin-smooth .8s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading your orders…</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'transparent', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.75rem,4vw,2.25rem)', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Order History</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9375rem' }}>
            {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
          </p>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="card animate-scaleIn" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>📦</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', marginBottom: 10 }}>No orders yet</h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: '1rem' }}>You haven't placed any orders. Start shopping now!</p>
            <Link to="/" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>Browse Medicines →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sortedOrders.map((order, idx) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
              const isExpanded = expandedId === order._id;
              return (
                <div key={order._id} className="card animate-fadeInUp" style={{ overflow: 'hidden', animationDelay: `${idx * 60}ms` }}>
                  {/* Header */}
                  <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg,#f8fafc,#fff)', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</p>
                        <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', margin: 0, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </h2>
                        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '4px 0 0' }}>
                          🗓 {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {' · '}
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span
                        className="badge"
                        style={{ background: statusCfg.bg, color: statusCfg.color, padding: '6px 14px', fontSize: '0.8125rem', borderRadius: 9999 }}
                      >
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </div>

                    {/* Timeline */}
                    {order.status !== 'Cancelled' && <OrderTimeline status={order.status} />}
                  </div>

                  {order.deliveryAddress?.formattedAddress && (
                    <div style={{ padding: '0.75rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #dcfce7', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#15803d', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivery address</p>
                        <p style={{ fontSize: '0.875rem', color: '#14532d', margin: 0, lineHeight: 1.45 }}>{order.deliveryAddress.formattedAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div>
                            <p style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '0.9375rem' }}>{item.medicine?.name || 'Unknown Medicine'}</p>
                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '2px 0 0' }}>
                              {item.quantity} × NPR {item.price.toFixed(2)}
                            </p>
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem', flexShrink: 0 }}>
                            NPR {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prescription */}
                  {order.items.some(i => i.medicine?.requiresPrescription) && (
                    <div style={{ padding: '0.875rem 1.5rem', background: '#eff6ff', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>📋</span>
                        <div>
                          <p style={{ fontWeight: 700, color: '#1e40af', margin: 0, fontSize: '0.875rem' }}>Prescription</p>
                          <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>
                            {order.prescription ? '✓ Uploaded' : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      {order.prescription && (
                        <button
                          onClick={() => window.open(`http://localhost:3000/${order.prescription}`, '_blank')}
                          className="btn btn-sm"
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8 }}
                        >
                          View Prescription
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer: total + expand */}
                  <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 600 }}>ORDER TOTAL</p>
                      <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#10b981' }}>NPR {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order._id)}
                      style={{ background: 'none', border: '2px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem', color: '#475569', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                    >
                      {isExpanded ? '▲ Less info' : '▼ More info'}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="animate-fadeInDown" style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: 'Placed on', value: new Date(order.createdAt).toLocaleString() },
                          { label: 'Last updated', value: new Date(order.updatedAt).toLocaleString() },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                            <p style={{ fontWeight: 600, color: '#374151', margin: 0, fontSize: '0.9375rem' }}>{value}</p>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Order ID</p>
                          <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#374151', margin: 0, wordBreak: 'break-all', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>{order._id}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;