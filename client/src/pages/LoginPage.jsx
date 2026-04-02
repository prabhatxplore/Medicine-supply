import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin';
    return '/';
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://medicine-supply.onrender.com/api/auth/me', { credentials: 'include' });
        if (!res.ok) return;
        const user = await res.json();
        if (user.role) {
          navigate(getDashboardPath(user.role));
        }
      } catch {
        // ignore; not logged in
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://medicine-supply.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Welcome back!');
        navigate(getDashboardPath(result.role));
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Left: Decorative Panel (desktop only) ─── */}
      <div className="hidden lg:flex" style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #064e3b 0%, #065f46 30%, #0d9488 70%, #0284c7 100%)',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-blob" style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, background: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
          <div className="animate-blob animation-delay-2000" style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 350, height: 350, background: 'rgba(255,255,255,.04)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="animate-fadeInUp" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 24px' }}>💊</div>

          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2.25rem', letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>PharmaCare</h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1.0625rem', marginBottom: 48, lineHeight: 1.6 }}>
            Your trusted partner for<br />fast, genuine medicine delivery.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '⚡', text: '24-hour delivery guarantee' },
              { icon: '✅', text: '100% genuine certified products' },
              { icon: '🔒', text: 'Secure & encrypted payments' },
              { icon: '💬', text: '24/7 dedicated support' },
            ].map((f, i) => (
              <div key={i} className="animate-slideInLeft" style={{ animationDelay: `${i * 80}ms`, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '0.9375rem', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: Form Panel ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#f8fafc', minHeight: 0 }}>
        <div className="animate-scaleIn" style={{ width: '100%', maxWidth: 420 }}>

          {/* Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: 20 }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>Sign in to your PharmaCare account</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 8, borderRadius: 12 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg className="animate-spin-smooth" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0 }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
                  Create one →
                </Link>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link to="/" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;