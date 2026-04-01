import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notifyCartUpdated } from '../utils/cartNotify';

const STEPS = ['Cart', 'Checkout', 'Confirmed'];

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [prescriptionFileName, setPrescriptionFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const handlePrescriptionChange = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG, WebP or PDF allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setPrescription(file);
    setPrescriptionFileName(file.name);
    toast.success('Prescription uploaded ✓');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handlePrescriptionChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const items = cart.map(i => ({ medicineId: i._id, quantity: i.quantity }));
    const formData = new FormData();
    formData.append('items', JSON.stringify(items));
    if (prescription) formData.append('prescription', prescription);
    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'POST', credentials: 'include', body: formData,
      });
      if (res.ok) {
        localStorage.removeItem('cart');
        notifyCartUpdated();
        toast.success('Order placed successfully! 🎉');
        navigate('/orders');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to place order');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = total >= 100 ? 0 : 50;
  const grandTotal = total + delivery;
  const requiresPrescription = cart.some(i => i.requiresPrescription);
  const canSubmit = !loading && cart.length > 0 && (!requiresPrescription || prescription);

  return (
    <div style={{ background: 'transparent', fontFamily: "'Inter', sans-serif" }}>
      {/* Step indicator */}
      <div style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i === 0 ? '#e2e8f0' : i === 1 ? 'linear-gradient(135deg,#10b981,#0d9488)' : '#e2e8f0',
                  color: i === 1 ? '#fff' : i === 0 ? '#94a3b8' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: i === 1 ? 700 : 500, color: i === 1 ? '#0f172a' : '#94a3b8' }} className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i === 0 ? '#10b981' : '#e2e8f0', margin: '0 12px', borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.75rem,4vw,2.25rem)', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Checkout</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9375rem' }}>Review your order and confirm</p>
        </div>

        {cart.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: 20 }}>Your cart is empty</p>
            <Link to="/" className="btn btn-primary">Browse Medicines</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─ Left: Prescription + action ─ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="lg:col-span-2">

              {/* Prescription upload (only if needed) */}
              {requiresPrescription && (
                <div className="card animate-fadeInUp" style={{ padding: '1.5rem', border: '2px solid #fca5a5' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, background: '#fef2f2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚠️</div>
                    <div>
                      <h3 style={{ fontWeight: 700, color: '#b91c1c', margin: '0 0 4px' }}>Prescription Required</h3>
                      <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>
                        One or more items in your cart require a valid prescription with doctor's signature.
                      </p>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      position: 'relative', border: `2.5px dashed ${dragOver ? '#10b981' : prescription ? '#10b981' : '#fca5a5'}`,
                      borderRadius: 12, padding: '1.75rem', textAlign: 'center',
                      background: dragOver ? '#f0fdf4' : prescription ? '#f0fdf4' : '#fef2f2',
                      transition: 'all .2s', cursor: 'pointer',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => handlePrescriptionChange(e.target.files[0])}
                      required={requiresPrescription}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                    />
                    {prescription ? (
                      <div>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                        <p style={{ fontWeight: 700, color: '#15803d', margin: '0 0 4px', fontSize: '0.9375rem' }}>{prescriptionFileName}</p>
                        <p style={{ fontSize: '0.8125rem', color: '#16a34a', margin: 0 }}>Prescription uploaded · Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                        <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 4px', fontSize: '0.9375rem' }}>
                          {dragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>JPEG · PNG · WebP · PDF — Max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Place Order button */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn btn-primary btn-block"
                  style={{ borderRadius: 14, padding: '1rem', fontSize: '1.0625rem' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg className="animate-spin-smooth" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                      Placing Order…
                    </span>
                  ) : '🎉 Place Order'}
                </button>
                {requiresPrescription && !prescription && (
                  <p style={{ fontSize: '0.8125rem', color: '#ef4444', textAlign: 'center', margin: '8px 0 0' }}>
                    Please upload your prescription to continue
                  </p>
                )}
              </form>

              <Link to="/cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Cart
              </Link>
            </div>

            {/* ─ Order summary ─ */}
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div className="card animate-slideInRight" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '1rem' }}>Order Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', margin: '0 0 2px' }} className="line-clamp-1">{item.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Qty: {item.quantity}</p>
                        {item.requiresPrescription && (
                          <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 600 }}>⚠️ Rx required</span>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', flexShrink: 0 }}>
                        NPR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>NPR {total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                    <span>Delivery</span>
                    <span style={{ fontWeight: 600, color: delivery === 0 ? '#10b981' : undefined }}>{delivery === 0 ? 'FREE' : `NPR ${delivery}`}</span>
                  </div>
                  <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: '1.375rem', color: '#10b981' }}>NPR {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: 10, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
                  <p style={{ fontSize: '0.75rem', color: '#15803d', margin: 0, lineHeight: 1.5 }}>Your payment is protected with end-to-end encryption</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;