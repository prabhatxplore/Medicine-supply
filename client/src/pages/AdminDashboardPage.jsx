import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const KPICard = ({ icon, label, value, color, bg, trend }) => (
  <div className="card card-lift" style={{ padding: '1.5rem', borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 46, height: 46, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
      {trend && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: 9999 }}>{trend}</span>}
    </div>
    <p style={{ fontWeight: 900, fontSize: '2rem', color: '#0f172a', margin: '0 0 3px', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, fontWeight: 500 }}>{label}</p>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalMedicines: 0, totalOrders: 0, pendingOrders: 0, pendingRx: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [medRes, ordRes, rxRes] = await Promise.all([
          fetch('http://localhost:3000/api/medicines'),
          fetch('http://localhost:3000/api/orders/admin/all', { credentials: 'include' }),
          fetch('http://localhost:3000/api/prescriptions/admin/stats', { credentials: 'include' }),
        ]);
        const [meds, orders, rx] = await Promise.all([medRes.json(), ordRes.json(), rxRes.json().catch(() => ({}))]);
        setStats({
          totalMedicines: meds.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'Pending').length,
          pendingRx: rx.pending ?? 0,
        });
      } catch { toast.error('Failed to load stats'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <AdminLayout active="Dashboard" pageTitle="Dashboard" pageSubtitle="Welcome back, Admin" pendingOrders={stats.pendingOrders}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin-smooth .8s linear infinite' }} />
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading…</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <KPICard icon="💊" label="Total Medicines" value={stats.totalMedicines} color="#3b82f6" bg="#eff6ff" trend="+2 this week" />
            <KPICard icon="📦" label="Total Orders"    value={stats.totalOrders}    color="#10b981" bg="#f0fdf4" trend="+5 today" />
            <KPICard icon="⏳" label="Pending Orders"  value={stats.pendingOrders}  color="#f59e0b" bg="#fffbeb" />
          </div>

          {/* Quick actions */}
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {[
              { to: '/admin/medicines', icon: '💊', title: 'Manage Medicines', desc: 'Add, edit or remove inventory', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
              { to: '/admin/orders',    icon: '📦', title: 'Manage Orders',    desc: 'Update statuses & check prescriptions', color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : null },
              { to: '/admin/prescriptions', icon: '📋', title: 'Prescription uploads', desc: 'Verify Rx & mark medicine sent', color: '#d97706', bg: '#fffbeb', border: '#fde68a', badge: stats.pendingRx > 0 ? `${stats.pendingRx} pending` : null },
            ].map(a => (
              <Link key={a.to} to={a.to} className="card card-lift" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block', background: a.bg, border: `1px solid ${a.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>{a.icon}</div>
                  {a.badge && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, borderRadius: 9999, padding: '4px 10px' }}>{a.badge}</span>}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a', margin: '0 0 4px' }}>{a.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 14px', lineHeight: 1.5 }}>{a.desc}</p>
                <span style={{ color: a.color, fontWeight: 700, fontSize: '0.875rem' }}>Open →</span>
              </Link>
            ))}
          </div>

          {/* Volunteer portal */}
          
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;