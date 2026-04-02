import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unverified, verified, rejected

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://medicine-supply.onrender.com/api/auth/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const nonAdmins = data.filter(u => u.role === 'user');
        setUsers(nonAdmins);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (err) {
      toast.error('Network error. Could not fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`https://medicine-supply.onrender.com/api/auth/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(`User marked as ${newStatus}`);
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filter === 'all') return true;
    return u.status === filter;
  });

  return (
    <AdminLayout active="Users" pageTitle="Users" pageSubtitle="Manage user verification and ID cards">
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
          {['all', 'unverified', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize',
                background: filter === f ? '#0f172a' : '#f1f5f9',
                color: filter === f ? '#fff' : '#475569',
                transition: 'all .2s'
              }}
            >
              {f}
              {f === 'unverified' && (
                <span style={{ marginLeft: 8, background: filter === f ? '#ef4444' : '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 9999, fontSize: '0.7rem' }}>
                  {users.filter(u => u.status === 'unverified').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b', fontSize: '1.125rem' }}>
            No users found in this category.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>Details</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>Documents</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{u.name}</p>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>{u.email}</p>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>{u.phoneNumber || 'No phone'}</p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {u.nationalIdCard || u.citizenshipCard ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {u.nationalIdCard && (
                              <a href={u.nationalIdCard.startsWith('http') ? u.nationalIdCard : `https://medicine-supply.onrender.com/${u.nationalIdCard}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                                📄 View National ID
                              </a>
                            )}
                            {u.citizenshipCard && (
                              <a href={u.citizenshipCard.startsWith('http') ? u.citizenshipCard : `https://medicine-supply.onrender.com/${u.citizenshipCard}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
                                📄 View Citizenship
                              </a>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No documents uploaded</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
                          background: u.status === 'verified' ? '#dcfce7' : u.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: u.status === 'verified' ? '#16a34a' : u.status === 'rejected' ? '#dc2626' : '#d97706'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {u.status === 'unverified' ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'verified')}
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10b981', borderColor: '#10b981', color: '#fff', borderRadius: 6, padding: '6px 12px' }}
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'rejected')}
                                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>Status locked</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
