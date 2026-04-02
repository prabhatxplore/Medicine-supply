import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notifyCartUpdated } from '../utils/cartNotify';

const MedicineDetailsPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/medicines/${id}`);
        const data = await res.json();
        setMedicine(data);
      } catch {
        toast.error('Failed to load medicine');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addToCart = () => {
    const stock = Number(medicine.quantity);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find(i => i._id === medicine._id);
    const currentInCart = ex ? ex.quantity : 0;
    if (currentInCart + quantity > stock) {
      toast.error(`Only ${stock} available (${currentInCart} already in cart)`);
      return;
    }
    if (ex) ex.quantity += quantity;
    else cart.push({ ...medicine, quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    notifyCartUpdated();
    toast.success(`Added ${quantity} × ${medicine.name} to cart!`);
    setQuantity(1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[40vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin-smooth .8s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading medicine details…</p>
      </div>
    </div>
  );

  if (!medicine) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
      <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Medicine not found</h2>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>← Back to Home</Link>
    </div>
  );

  const stockStatus = medicine.quantity === 0 ? 'out' : medicine.quantity <= 5 ? 'low' : 'ok';

  return (
    <div style={{ background: 'transparent', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link to="/" className="text-emerald-600 font-semibold no-underline inline-flex items-center gap-1 hover:text-emerald-700">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </Link>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-slate-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="line-clamp-1 text-slate-700 font-medium max-w-[20ch]">{medicine.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto" style={{ padding: '2rem 1rem', paddingTop: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ─ Image section ─ */}
          <div className="animate-fadeInUp">
            <div
              onClick={() => setImageZoomed(!imageZoomed)}
              style={{
                borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'zoom-in',
                background: 'linear-gradient(135deg,#ecfdf5,#f0fdfa)', aspectRatio: '1/1', maxHeight: 480,
                boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              }}
            >
              {medicine.image ? (
                <img
                  src={`http://localhost:3000/${medicine.image}`}
                  alt={medicine.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease', transform: imageZoomed ? 'scale(1.15)' : 'scale(1)' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96 }}>💊</div>
              )}
              {medicine.image && (
                <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,.45)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {imageZoomed ? '🔍 Click to zoom out' : '🔍 Click to zoom'}
                </div>
              )}
              {/* Low stock badge */}
              {stockStatus === 'low' && (
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span className="badge badge-orange">⚠ Low Stock</span>
                </div>
              )}
            </div>

            {/* Share / bookmark row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {['Share', 'Wishlist'].map(lbl => (
                <button key={lbl} className="btn btn-ghost btn-sm" style={{ border: '2px solid #e2e8f0', flex: 1, borderRadius: 12 }}>
                  {lbl === 'Share' ? '↗ Share' : '♡ Wishlist'}
                </button>
              ))}
            </div>
          </div>

          {/* ─ Details section ─ */}
          <div className="animate-slideInRight" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Category badge */}
            {medicine.category && (
              <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>{medicine.category}</span>
            )}

            <div>
              <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.625rem,4vw,2.25rem)', color: '#0f172a', margin: '0 0 8px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {medicine.name}
              </h1>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>{medicine.description}</p>
            </div>

            {/* Price card */}
            <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#f0fdfa)', borderRadius: 16, padding: '1.25rem', border: '1px solid #a7f3d0' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</p>
              <p style={{ fontWeight: 900, fontSize: '2.5rem', color: '#059669', margin: '0 0 10px', lineHeight: 1 }}>
                NPR {medicine.price.toFixed(2)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: stockStatus === 'out' ? '#ef4444' : stockStatus === 'low' ? '#f59e0b' : '#10b981',
                  animation: stockStatus === 'ok' ? 'pulse-ring 2.5s infinite' : 'none',
                }} />
                <span style={{
                  fontWeight: 600, fontSize: '0.9375rem',
                  color: stockStatus === 'out' ? '#b91c1c' : stockStatus === 'low' ? '#a16207' : '#15803d',
                }}>
                  {stockStatus === 'out' ? 'Out of Stock' : `${medicine.quantity} units available`}
                </span>
              </div>
            </div>

            {/* Prescription warning */}
            {medicine.requiresPrescription && (
              <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 700, color: '#b91c1c', margin: '0 0 4px' }}>Prescription Required</p>
                  <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0, lineHeight: 1.5 }}>
                    A valid prescription with doctor's signature is required during checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Quantity */}
            {medicine.quantity > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="qty-stepper">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease">−</button>
                    <input
                      type="number" min="1" max={medicine.quantity} value={quantity}
                      onChange={e => setQuantity(Math.max(1, Math.min(medicine.quantity, parseInt(e.target.value) || 1)))}
                      aria-label="Quantity"
                    />
                    <button onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))} aria-label="Increase">+</button>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Max: {medicine.quantity}</span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={addToCart}
                disabled={medicine.quantity === 0}
                className="btn btn-primary btn-block btn-lg"
                style={{
                  borderRadius: 14,
                  background: medicine.quantity === 0 ? '#e2e8f0' : addedToCart ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#10b981,#0d9488)',
                  color: medicine.quantity === 0 ? '#94a3b8' : '#fff',
                  cursor: medicine.quantity === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all .3s',
                }}
              >
                {medicine.quantity === 0 ? 'Out of Stock' : addedToCart ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
              <Link to="/cart" className="btn btn-secondary btn-block btn-lg" style={{ borderRadius: 14 }}>
                View Cart
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-3" style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              {[['✅', '100%\nGenuine'], ['🚚', 'Fast\nDelivery'], ['🔒', 'Secure\nPayment'], ['💬', '24/7\nSupport']].map(([icon, lbl]) => (
                <div key={lbl} style={{ textAlign: 'center', padding: '10px 4px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📖</span> About this Medicine
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
              {medicine.description || 'Premium quality medicine sourced from certified and verified suppliers. Stored under proper conditions to maintain efficacy.'}
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🚚</span> Delivery Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['⚡', 'Express delivery in ~24 hours'],
                ['💸', 'Free delivery on orders above NPR 100'],
                ['📍', 'Real-time order tracking available'],
                ['↩️', 'Easy returns within 7 days if sealed'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailsPage;
