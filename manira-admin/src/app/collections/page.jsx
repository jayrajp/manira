'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, X, GripVertical } from 'lucide-react';

const EMPTY = { name: '', slug: '', description: '', image: '', isActive: true, displayOrder: 0 };

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null); // null | 'add' | 'edit'
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);

  const fetchCollections = () => {
    setLoading(true);
    api.get('/collections').then(r => setCollections(r.data || [])).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCollections(); }, []);

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (c) => {
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', image: c.image || '', isActive: c.isActive ?? true, displayOrder: c.displayOrder ?? 0 });
    setEditId(c.id);
    setModal('edit');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: res.data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Collection name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/collections', form);
        toast.success('Collection created');
      } else {
        await api.put(`/collections/${editId}`, form);
        toast.success('Collection updated');
      }
      setModal(null);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete collection "${name}"? Products will not be deleted.`)) return;
    try {
      await api.delete(`/collections/${id}`);
      toast.success('Collection deleted');
      fetchCollections();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminLayout title="Collections">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-500">{collections.length} collections</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
          <Plus size={14} /> Add Collection
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-sm">No collections yet</p>
          <button onClick={openAdd} className="btn-primary mt-4 text-xs px-4 py-2">Add your first collection</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections.map(c => (
            <div key={c.id} className="card p-0 overflow-hidden group">
              <div className="relative h-40 bg-gray-100">
                {c.image ? (
                  <Image src={c.image} alt={c.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">💎</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openEdit(c)} className="p-2 bg-white rounded-lg text-gray-600 hover:text-gold transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="p-2 bg-white rounded-lg text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                {!c.isActive && (
                  <span className="absolute top-2 right-2 bg-gray-800/80 text-white text-[10px] px-2 py-0.5 rounded-full">Hidden</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">/{c.slug}</p>
                {c.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Collection' : 'Edit Collection'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Collection Name *</label>
                <input className="input" placeholder="e.g. Bridal Edit" required value={form.name}
                  onChange={e => { set('name', e.target.value); if (modal === 'add') set('slug', autoSlug(e.target.value)); }} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" placeholder="bridal-edit" value={form.slug}
                  onChange={e => set('slug', e.target.value)} />
                <p className="text-[10px] text-gray-400 mt-1">URL: /collections/{form.slug || 'slug'}</p>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} placeholder="Short description..."
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Cover Image</label>
                {form.image ? (
                  <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={form.image} alt="Collection" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => set('image', '')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gold transition-colors ${uploading ? 'opacity-50' : ''}`}>
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
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
                    <span className="text-sm font-medium text-gray-700">Active / Visible</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : modal === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
