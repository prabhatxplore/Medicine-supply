import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const SiteNavbar = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const refreshCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (location.pathname === '/products') {
      setSearchInput(q);
    } else {
      setSearchInput('');
    }
  }, [searchParams, location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
        if (res.ok) setUser(await res.json());
        else setUser(null);
      } catch {
        setUser(null);
      }
    })();
  }, [location.pathname]);

  useEffect(() => {
    refreshCartCount();
    const onStorage = (e) => {
      if (e.key === 'cart' || e.key === null) refreshCartCount();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('pharmacare-cart', refreshCartCount);
    window.addEventListener('focus', refreshCartCount);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pharmacare-cart', refreshCartCount);
      window.removeEventListener('focus', refreshCartCount);
    };
  }, [refreshCartCount, location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Logged out');
      setUser(null);
      setMobileMenuOpen(false);
      window.location.href = '/';
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const t = searchInput.trim();
    setMobileMenuOpen(false);
    if (t) {
      navigate(`/products?search=${encodeURIComponent(t)}`, { replace: location.pathname === '/products' });
    } else {
      navigate('/products', { replace: location.pathname === '/products' });
    }
  };

  return (
    <header
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(226,232,240,0.7)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 12px rgba(0,0,0,.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,.35)', flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>💊</span>
            </div>
            <div className="hidden sm:block">
              <span className="gradient-text-brand" style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>PharmaCare</span>
              <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0, lineHeight: 1 }}>Your Health, Our Priority</p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <div style={{ position: 'relative', width: '100%' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search medicines, symptoms…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.75rem', paddingRight: '5rem', borderRadius: 9999, background: '#f1f5f9', border: '2px solid transparent' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', borderRadius: 9999 }}
              >
                Search
              </button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-4">
            <Link
              to="/products"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginRight: 12, textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
            >
              Products
            </Link>
            <Link
              to="/prescriptions"
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 9999, padding: '0.45rem 0.9rem' }}
            >
              Upload Prescription
            </Link>
            <Link
              to="/cart"
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, color: '#475569', transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#10b981'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#475569'; }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="animate-scaleIn" style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: 9999, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', lineHeight: 1 }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid #e2e8f0' }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#10b981,#0d9488)', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <Link
                  to="/orders"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                >
                  My Orders
                </Link>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ef4444', background: '#fef2f2', border: 'none', padding: '6px 14px', borderRadius: 9999, cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid #e2e8f0' }}>
                <Link
                  to="/login"
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                >
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, color: '#475569' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8l-1 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: 9999, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mobileMenuOpen ? '#f1f5f9' : 'transparent', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#475569' }}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 40,
                backdropFilter: 'blur(2px)',
              }}
            />
            <div className="lg:hidden animate-fadeInDown" style={{
              borderTop: '1px solid #e2e8f0',
              paddingBottom: '1rem',
              paddingTop: '1rem',
              background: '#fff',
              position: 'relative',
              zIndex: 50,
            }}
            >
              <form onSubmit={handleSearch} className="relative mb-4">
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search medicines…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', borderRadius: 9999, background: '#f1f5f9', border: '2px solid transparent', fontSize: '0.9375rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', borderRadius: 9999 }}
                >
                  Search
                </button>
              </form>

              <div className="space-y-3 mb-4">
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none', padding: '8px 0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                >
                  Products
                </Link>
                <Link
                  to="/prescriptions"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none', padding: '8px 0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#10b981'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
                >
                  Upload Prescription
                </Link>
              </div>

              <div className="flex items-center justify-between">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#10b981,#0d9488)', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{user.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none' }}>Login</Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">Sign Up</Link>
                  </div>
                )}
                {user && (
                  <div className="flex flex-wrap gap-3">
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textDecoration: 'none' }}>My Orders</Link>
                    {user.role === 'user' && (
                      <Link to="/prescriptions" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', textDecoration: 'none' }}>My Rx</Link>
                    )}
                    <button type="button" onClick={handleLogout} style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default SiteNavbar;
