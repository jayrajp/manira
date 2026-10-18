'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';

const TYPES  = ['hero', 'promo', 'category', 'popup'];
const EMPTY  = { title: '', subtitle: '', buttonText: '', buttonLink: '', image: '', mobileImage: '', type: 'hero', isActive: true, displayOrder: 0 };

export default function BannersPage() {
  const [banners,   setBanners]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState('');

  const fetchBanners = () => {
    setLoading(true);
    api.get('/banners').then(r => setBanners(r.data || [])).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
  const openEdit = (b) => {
    setForm({ title: b.title || '', subtitle: b.subtitle || '', buttonText: b.buttonText || '', buttonLink: b.buttonLink || '', image: b.image || '', mobileImage: b.mobileImage || '', type: b.type || 'hero', isActive: b.isActive ?? true, displayOrder: b.displayOrder ?? 0 });
    setEditId(b.id);
    setModal('edit');
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, [field]: res.data.url }));
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) { toast.error('Banner image is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/banners', form);
        toast.success('Banner created');
      } else {
        await api.put(`/banners/${editId}`, form);
        toast.success('Banner updated');
      }
      setModal(null);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete banner "${title || 'this banner'}"?`)) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.patch(`/banners/${id}`, { isActive: !isActive });
      fetchBanners();
    } catch { toast.error('Failed to toggle'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ImageUpload = ({ field, label }) => (
    <div>
      <label className="label">{label}</label>
      {form[field] ? (
        <div className="relative h-24 rounded-lg overflow-hidden border border-gray-200">
          <Image src={form[field]} alt="" fill className="object-cover" unoptimized />
          <button type="button" onClick={() => set(field, '')}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            <X size={10} />
          </button>
        </div>
      ) : (
        <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gold transition-colors ${uploading === field ? 'opacity-50' : ''}`}>
          <Upload size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">{uploading === field ? 'Uploading...' : 'Upload'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, field)} disabled={!!uploading} />
        </label>
      )}
    </div>
  );

  return (
    <AdminLayout title="Banners">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-500">{banners.length} banners</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-sm">No banners yet</p>
          <button onClick={openAdd} className="btn-primary mt-4 text-xs px-4 py-2">Add first banner</button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Preview', 'Title', 'Type', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-24 h-14 bg-gray-100 rounded-lg relative overflow-hidden">
                      {b.image && <Image src={b.image} alt={b.title || ''} fill className="object-cover" unoptimized />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{b.title || '—'}</p>
                    {b.subtitle && <p className="text-xs text-gray-400 truncate max-w-[200px]">{b.subtitle}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize font-medium">{b.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{b.displayOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(b.id, b.isActive)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${b.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id, b.title)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Banner' : 'Edit Banner'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload field="image" label="Desktop Image *" />
                <ImageUpload field="mobileImage" label="Mobile Image" />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. Bridal Collection 2025" value={form.title}
                  onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label className="label">Subtitle</label>
                <input className="input" placeholder="e.g. Exquisite pieces for your special day" value={form.subtitle}
                  onChange={e => set('subtitle', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Button Text</label>
                  <input className="input" placeholder="e.g. Shop Now" value={form.buttonText}
                    onChange={e => set('buttonText', e.target.value)} />
                </div>
                <div>
                  <label className="label">Button Link</label>
                  <input className="input" placeholder="/products" value={form.buttonLink}
                    onChange={e => set('buttonLink', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Display Order</label>
                  <input type="number" className="input" min={0} value={form.displayOrder}
                    onChange={e => set('displayOrder', Number(e.target.value))} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                      className="w-4 h-4 accent-gold" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : modal === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
