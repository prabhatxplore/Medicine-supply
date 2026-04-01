import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartPage = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const save = (updated) => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    save(cart.map(i => i._id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = (id) => {
    save(cart.filter(i => i._id !== id));
    toast.success('Item removed from cart');
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: "'Inter', sans-serif" }}>
      {/* Back nav */}
      <div style={{ background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Continue Shopping
        </Link>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>Shopping Cart</span>
      </div>

      <div className="max-w-6xl mx-auto" style={{ padding: '2rem 1rem' }}>
        {/* Heading */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(1.75rem,4vw,2.25rem)', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Shopping Cart
          </h1>
          {cart.length > 0 && (
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9375rem' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {cart.length === 0 ? (
          /* ─ Empty state ─ */
          <div className="card animate-scaleIn" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', marginBottom: 10 }}>Your cart is empty</h2>
            <p style={{ color: '#64748b', marginBottom: 28, fontSize: '1rem' }}>Looks like you haven't added any medicines yet.</p>
            <Link to="/" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
              Browse Medicines →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─ Items list ─ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="lg:col-span-2">
              {cart.map((item, idx) => (
                <div key={item._id} className="card animate-fadeInUp" style={{ padding: '1.25rem', animationDelay: `${idx * 60}ms` }}>
                  <div className="flex gap-4 items-start" style={{ flexWrap: 'wrap' }}>
                    {/* Image */}
                    <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(135deg,#ecfdf5,#f0fdfa)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={`http://localhost:3000/${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 36 }}>💊</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>{item.name}</h3>
                      <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 8px' }}>NPR {item.price}</p>
                      {item.requiresPrescription && (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>⚠️ Prescription Required</span>
                      )}
                    </div>

                    {/* Qty + Remove */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                      <div className="qty-stepper">
                        <button onClick={() => updateQty(item._id, item.quantity - 1)} aria-label="Decrease">−</button>
                        <input
                          type="number" min="1" value={item.quantity}
                          onChange={e => updateQty(item._id, parseInt(e.target.value) || 1)}
                          aria-label="Quantity"
                        />
                        <button onClick={() => updateQty(item._id, item.quantity + 1)} aria-label="Increase">+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>
                          NPR {(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', borderRadius: 8, transition: 'all .15s' }}
                          aria-label="Remove item"
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ─ Order Summary sidebar ─ */}
            <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
              <div className="card animate-slideInRight" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem' }}>Order Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: '#64748b' }}>
                    <span>Subtotal ({itemCount} items)</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>NPR {total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: '#64748b' }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>{total >= 100 ? 'FREE' : 'NPR 50'}</span>
                  </div>
                  {total < 100 && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: '0.8125rem', color: '#15803d' }}>
                      💡 Add NPR {(100 - total).toFixed(2)} more for free delivery
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#10b981' }}>
                      NPR {(total + (total >= 100 ? 0 : 50)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link to="/checkout" className="btn btn-primary btn-block btn-lg" style={{ borderRadius: 12, marginBottom: 10 }}>
                  Proceed to Checkout →
                </Link>
                <Link to="/" className="btn btn-ghost btn-block" style={{ borderRadius: 12, border: '2px solid #e2e8f0' }}>
                  Continue Shopping
                </Link>

                {/* Trust signals */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: 20 }}>
                  {[['🔒', 'Secure'], ['✅', 'Genuine'], ['🚚', 'Fast']].map(([icon, label]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
                      <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;