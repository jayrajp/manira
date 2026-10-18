'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';

const EMPTY = { name: '', slug: '', description: '', icon: '', image: '', isActive: true, displayOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
  const openEdit = (c) => {
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', icon: c.icon || '', image: c.image || '', isActive: c.isActive ?? true, displayOrder: c.displayOrder ?? 0 });
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
    if (!form.name) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/categories', form);
        toast.success('Category created');
      } else {
        await api.put(`/categories/${editId}`, form);
        toast.success('Category updated');
      }
      setModal(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Cannot delete — category may have products'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminLayout title="Categories">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-500">{categories.length} categories</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
          <Plus size={14} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-sm">No categories yet</p>
          <button onClick={openAdd} className="btn-primary mt-4 text-xs px-4 py-2">Add your first category</button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Icon', 'Name', 'Slug', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.image ? (
                        <Image src={c.image} alt={c.name} width={40} height={40} className="object-cover" unoptimized />
                      ) : (
                        <span className="text-lg">{c.icon || '📦'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-sm">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">/{c.slug}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.displayOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Category Name *</label>
                <input className="input" placeholder="e.g. Necklaces" required value={form.name}
                  onChange={e => { set('name', e.target.value); if (modal === 'add') set('slug', autoSlug(e.target.value)); }} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" placeholder="necklaces" value={form.slug}
                  onChange={e => set('slug', e.target.value)} />
              </div>
              <div>
                <label className="label">Emoji Icon</label>
                <input className="input" placeholder="e.g. 📿" value={form.icon}
                  onChange={e => set('icon', e.target.value)} />
                <p className="text-[10px] text-gray-400 mt-1">Used in navigation category circles</p>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">Category Image</label>
                {form.image ? (
                  <div className="relative h-28 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={form.image} alt="Category" fill className="object-cover" unoptimized />
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
                    <span className="text-sm font-medium text-gray-700">Active</span>
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
