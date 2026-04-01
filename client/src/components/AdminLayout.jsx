import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { to: '/admin',           label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={2}/><rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={2}/></svg>
  )},
  { to: '/admin/medicines', label: 'Medicines',  icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
  )},
  { to: '/admin/orders',    label: 'Orders',     icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
  )},
];

/**
 * AdminLayout — shared layout for all admin pages.
 *
 * Props:
 *  active        {string}  — label of the current nav item ('Dashboard' | 'Medicines' | 'Orders')
 *  pageTitle     {string}  — h1 shown in the top bar
 *  pageSubtitle? {string}  — small subtitle below the h1
 *  pendingOrders?{number}  — shows a red badge on the Orders link
 *  children      {node}    — page body
 */
const AdminLayout = ({ active, pageTitle, pageSubtitle, pendingOrders = 0, children }) => {
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Logged out');
      navigate('/');
    } catch { toast.error('Logout failed'); }
  };

  /* ── sidebar contents (shared between desktop & mobile) ── */
  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* Logo */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#10b981,#0d9488)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
        <div>
          <p style={{ fontWeight: 800, color: '#0f172a', margin: 0, fontSize: '1rem', letterSpacing: '-0.01em' }}>PharmaCare</p>
          <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Admin Portal</p>
        </div>
      </div>

      {/* Section label */}
      <p style={{ padding: '1.25rem 1.25rem 0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
        Navigation
      </p>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_LINKS.map(link => {
          const isActive = link.label === active;
          return (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                color: isActive ? '#059669' : '#475569',
                background: isActive ? '#f0fdf4' : 'transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}}
            >
              <span style={{ opacity: isActive ? 1 : 0.6, color: isActive ? '#059669' : 'currentColor', display: 'flex' }}>{link.icon}</span>
              {link.label}
              {link.label === 'Orders' && pendingOrders > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, borderRadius: 9999, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {pendingOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ margin: '0 1.25rem', borderTop: '1px solid #f1f5f9' }} />

      {/* View store link */}
      <div style={{ padding: '0.75rem' }}>
        <Link to="/" onClick={() => setOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#475569', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.55 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          View Store
        </Link>
      </div>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <button onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", background: '#f8fafc' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block" style={{
        width: 220, flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
        borderRight: '1px solid #e2e8f0', overflowY: 'auto',
      }}>
        <Sidebar />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.35)', backdropFilter: 'blur(3px)' }} />
          <aside className="animate-slideInLeft" style={{ position: 'relative', width: 240, zIndex: 10, height: '100%', overflowY: 'auto', borderRight: '1px solid #e2e8f0' }}>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger (mobile only) */}
            <button className="lg:hidden" onClick={() => setOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a', margin: 0 }}>{pageTitle}</h1>
              {pageSubtitle && <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{pageSubtitle}</p>}
            </div>
          </div>

          {/* Right: breadcrumb trail */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#94a3b8' }}>
            <span>Admin</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{active}</span>
          </div>
        </header>

        {/* Page body */}
        <main style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
