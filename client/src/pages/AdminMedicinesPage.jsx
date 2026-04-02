import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const CATEGORY_OPTIONS = ['Pain Relief', 'Cold & Cough', 'Vitamins', 'Antibiotics'];

const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  quantity: '',
  requiresPrescription: false,
  tags: '',
  categories: [],
});

const AdminMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try { setMedicines(await (await fetch('http://localhost:3000/api/medicines')).json()); }
    catch { toast.error('Failed to load medicines'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'categories') {
      setFormData({ ...formData, categories: checked ? [...formData.categories, value] : formData.categories.filter(c => c !== value) });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setImage(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const buildMedicineFormData = () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description ?? '');
    data.append('price', String(formData.price));
    data.append('quantity', String(formData.quantity));
    data.append('requiresPrescription', formData.requiresPrescription ? 'true' : 'false');
    data.append('tags', typeof formData.tags === 'string' ? formData.tags : '');
    formData.categories.forEach((c) => data.append('categories', c));
    if (image) data.append('image', image);
    return data;
  };

  const startEdit = (med) => {
    setEditingId(med._id);
    setFormData({
      name: med.name || '',
      description: med.description || '',
      price: med.price != null ? String(med.price) : '',
      quantity: med.quantity != null ? String(med.quantity) : '',
      requiresPrescription: !!med.requiresPrescription,
      tags: Array.isArray(med.tags) ? med.tags.join(', ') : (med.tags || ''),
      categories: Array.isArray(med.categories) ? [...med.categories] : [],
    });
    setImage(null);
    setImagePreview(med.image ? (med.image.startsWith('http') ? med.image : `http://localhost:3000/${med.image}`) : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bumpStock = (delta) => {
    const n = Math.max(0, Math.floor(Number(formData.quantity) || 0) + delta);
    setFormData((prev) => ({ ...prev, quantity: String(n) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = buildMedicineFormData();
    const url = editingId
      ? `http://localhost:3000/api/medicines/${editingId}`
      : 'http://localhost:3000/api/medicines';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, body: data, credentials: 'include' });
      const errJson = !res.ok ? await res.json().catch(() => ({})) : {};
      if (res.ok) {
        toast.success(editingId ? 'Medicine updated' : 'Medicine added');
        resetForm();
        fetchMedicines();
      } else {
        toast.error(errJson.message || (editingId ? 'Update failed' : 'Failed to add medicine'));
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/medicines/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMedicines((prev) => prev.filter((m) => m._id !== id));
        if (String(editingId) === String(id)) resetForm();
        toast.success('Medicine deleted');
      } else toast.error('Delete failed');
    } catch {
      toast.error('Network error');
    }
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout active="Medicines" pageTitle="Medicines" pageSubtitle={loading ? '…' : `${medicines.length} items in inventory`}>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
          <input type="text" placeholder="Search medicines…" value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', background: '#fff' }} />
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else {
              setEditingId(null);
              setFormData(emptyForm());
              setImage(null);
              setImagePreview(null);
              setShowForm(true);
            }
          }}
          className="btn btn-primary"
          style={{ borderRadius: 10, flexShrink: 0 }}
        >
          {showForm ? '✕ Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {/* Add medicine form */}
      {showForm && (
        <div className="card animate-fadeInDown" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderTop: `3px solid ${editingId ? '#0ea5e9' : '#10b981'}` }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a', marginBottom: '1.125rem' }}>
            {editingId ? 'Edit medicine' : 'New medicine'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Name *</label>
                <input name="name" type="text" placeholder="e.g. Paracetamol 500mg" value={formData.name} onChange={handleChange} required className="input-field" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Description</label>
                <textarea  name="description" placeholder="Brief description…" value={formData.description} onChange={handleChange} rows={2} className="input-field h-50" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Price (NPR) *</label>
                <input name="price" type="number" step="0.01" min="0" placeholder="0.00" value={formData.price} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Stock *</label>
                <input name="quantity" type="number" min="0" placeholder="0" value={formData.quantity} onChange={handleChange} required className="input-field" />
                {editingId && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: 4 }}>Quick add:</span>
                    {[5, 10, 50].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => bumpStock(n)}
                        className="btn btn-ghost btn-xs"
                        style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Tags <span style={{ fontWeight: 400, color: '#94a3b8' }}>(comma-separated)</span></label>
                <input name="tags" type="text" placeholder="fever, headache, pain" value={formData.tags} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>Categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATEGORY_OPTIONS.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9999, border: `2px solid ${formData.categories.includes(cat) ? '#10b981' : '#e2e8f0'}`, background: formData.categories.includes(cat) ? '#f0fdf4' : '#fff', cursor: 'pointer', transition: 'all .15s', fontWeight: 600, fontSize: '0.8125rem', color: formData.categories.includes(cat) ? '#059669' : '#475569' }}>
                    <input type="checkbox" name="categories" value={cat} checked={formData.categories.includes(cat)} onChange={handleChange} style={{ display: 'none' }} />
                    {formData.categories.includes(cat) && <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Prescription toggle */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div onClick={() => setFormData({ ...formData, requiresPrescription: !formData.requiresPrescription })}
                  style={{ width: 42, height: 23, borderRadius: 12, background: formData.requiresPrescription ? '#10b981' : '#e2e8f0', position: 'relative', flexShrink: 0, transition: 'background .2s', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: 2, left: formData.requiresPrescription ? 21 : 2, width: 19, height: 19, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.15)', transition: 'left .2s' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Requires Prescription</span>
              </label>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>Image</label>
              {editingId ? (
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 8px' }}>Upload a new file only if you want to replace the current image.</p>
              ) : null}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label htmlFor="med-img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '1rem 1.25rem', border: '2px dashed #cbd5e1', borderRadius: 12, cursor: 'pointer', background: '#f8fafc', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}>
                  <svg width="24" height="24" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>{image ? image.name : 'Upload image'}</span>
                  <input id="med-img" type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; setImage(f); setImagePreview(URL.createObjectURL(f)); }} style={{ display: 'none' }} />
                </label>
                {imagePreview && (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #e2e8f0' }} />
                    <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                      style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={resetForm} className="btn btn-ghost" style={{ border: '1.5px solid #e2e8f0', borderRadius: 10 }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, borderRadius: 10 }}>
                {submitting ? (editingId ? 'Saving…' : 'Adding…') : (editingId ? '✓ Save changes' : '✓ Add medicine')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medicines grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 150 }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '65%' }} />
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>💊</div>
          <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{search ? 'No results' : 'No medicines yet'}</h3>
          <p style={{ color: '#64748b' }}>{search ? 'Try a different search term.' : 'Click "+ Add Medicine" to get started.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(med => {
            const stockStatus = med.quantity === 0 ? 'out' : med.quantity <= 5 ? 'low' : 'ok';
            return (
              <div key={med._id} className="card card-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 150, background: 'linear-gradient(135deg,#ecfdf5,#f0fdfa)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                  {med.image ? (
                    <img src={med.image.startsWith('http') ? med.image : `http://localhost:3000/${med.image}`} alt={med.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .35s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>💊</div>
                  )}
                  <span className={`badge ${med.requiresPrescription ? 'badge-danger' : 'badge-success'}`} style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.6875rem' }}>
                    {med.requiresPrescription ? 'Rx' : 'OTC'}
                  </span>
                </div>
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a', marginBottom: 3, lineHeight: 1.35 }}>{med.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: 8, lineHeight: 1.5, flex: 1 }}>{med.description || 'No description'}</p>
                  {med.categories?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {med.categories.map(c => <span key={c} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>{c}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981', margin: 0, lineHeight: 1 }}>NPR {med.price}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: stockStatus === 'out' ? '#ef4444' : stockStatus === 'low' ? '#f59e0b' : '#10b981', margin: '2px 0 0' }}>
                        {stockStatus === 'out' ? '● Out of stock' : stockStatus === 'low' ? `● Low: ${med.quantity}` : `● ${med.quantity} in stock`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => startEdit(med)}
                        style={{ width: 34, height: 34, border: '1.5px solid #bae6fd', borderRadius: 8, background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', transition: 'all .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(med._id, med.name)}
                        style={{ width: 34, height: 34, border: '1.5px solid #fee2e2', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMedicinesPage;