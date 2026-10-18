'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const EMPTY = { text: '', link: '', linkText: '', bgColor: '#B8860B', textColor: '#FFFFFF', isActive: true, displayOrder: 0 };

export default function AnnouncementsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetchItems = () => {
    setLoading(true);
    api.get('/announcements').then(r => setItems(r.data || [])).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
  const openEdit = (a) => {
    setForm({ text: a.text || '', link: a.link || '', linkText: a.linkText || '', bgColor: a.bgColor || '#B8860B', textColor: a.textColor || '#FFFFFF', isActive: a.isActive ?? true, displayOrder: a.displayOrder ?? 0 });
    setEditId(a.id);
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text) { toast.error('Announcement text is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/announcements', form);
        toast.success('Announcement created');
      } else {
        await api.put(`/announcements/${editId}`, form);
        toast.success('Announcement updated');
      }
      setModal(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminLayout title="Announcements">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-500">{items.length} announcements</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Shown in the marquee strip at the top of the website</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
          <Plus size={14} /> Add Announcement
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No announcements yet</p>
            <button onClick={openAdd} className="btn-primary mt-4 text-xs px-4 py-2">Add first announcement</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Preview', 'Text', 'Link', 'Order', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: a.bgColor, color: a.textColor }}>
                      {a.text.length > 40 ? a.text.slice(0, 40) + '...' : a.text}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{a.text}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.link || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{a.displayOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Announcement' : 'Edit Announcement'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Announcement Text *</label>
                <input className="input" placeholder="Extra 10% off on first order! Use code FIRST10" required
                  value={form.text} onChange={e => set('text', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Link URL</label>
                  <input className="input" placeholder="/products" value={form.link}
                    onChange={e => set('link', e.target.value)} />
                </div>
                <div>
                  <label className="label">Link Text</label>
                  <input className="input" placeholder="Shop Now" value={form.linkText}
                    onChange={e => set('linkText', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bgColor} onChange={e => set('bgColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" />
                    <input className="input" value={form.bgColor} onChange={e => set('bgColor', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.textColor} onChange={e => set('textColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" />
                    <input className="input" value={form.textColor} onChange={e => set('textColor', e.target.value)} />
                  </div>
                </div>
              </div>
              {(form.text || form.bgColor) && (
                <div className="rounded-lg overflow-hidden">
                  <p className="text-[10px] text-gray-400 mb-1">Preview</p>
                  <div className="px-4 py-2 text-center text-xs font-medium rounded" style={{ backgroundColor: form.bgColor, color: form.textColor }}>
                    {form.text || 'Announcement text here'}
                    {form.linkText && <span className="ml-2 underline">{form.linkText}</span>}
                  </div>
                </div>
              )}
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
