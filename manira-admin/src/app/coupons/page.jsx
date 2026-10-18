'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice, formatDate } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Copy } from 'lucide-react';

const EMPTY = { code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '', isActive: true, description: '' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons').then(r => setCoupons(r.data || [])).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      code: c.code || '', discountType: c.discountType || 'percentage', discountValue: String(c.discountValue || ''),
      minOrderAmount: String(c.minOrderAmount || ''), maxDiscount: String(c.maxDiscount || ''),
      usageLimit: String(c.usageLimit || ''), expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive: c.isActive ?? true, description: c.description || '',
    });
    setEditId(c.id);
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) { toast.error('Code and discount value are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        discountValue:  Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscount:    form.maxDiscount    ? Number(form.maxDiscount)    : null,
        usageLimit:     form.usageLimit     ? Number(form.usageLimit)     : null,
        expiresAt:      form.expiresAt      || null,
      };
      if (modal === 'add') {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      } else {
        await api.put(`/coupons/${editId}`, payload);
        toast.success('Coupon updated');
      }
      setModal(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Failed to delete'); }
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const genCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'MNR' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    set('code', code);
  };

  return (
    <AdminLayout title="Coupons">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-500">{coupons.length} coupons</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No coupons yet</p>
            <button onClick={openAdd} className="btn-primary mt-4 text-xs px-4 py-2">Create first coupon</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gold transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                    {c.description && <p className="text-[10px] text-gray-400 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-gold">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </span>
                    {c.maxDiscount && c.discountType === 'percentage' && (
                      <p className="text-[10px] text-gray-400">max {formatPrice(c.maxDiscount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.usedCount ?? 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.expiresAt ? formatDate(c.expiresAt) : 'No expiry'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.code)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">{modal === 'add' ? 'Add Coupon' : 'Edit Coupon'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Coupon Code *</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="e.g. SAVE20" value={form.code}
                    onChange={e => set('code', e.target.value.toUpperCase())} required />
                  <button type="button" onClick={genCode} className="btn-secondary text-xs px-3">Auto</button>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="e.g. 20% off on all orders" value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Discount Type</label>
                  <select className="input" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discount Value *</label>
                  <input type="number" className="input" min={0} placeholder={form.discountType === 'percentage' ? '20' : '100'}
                    value={form.discountValue} onChange={e => set('discountValue', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Order (₹)</label>
                  <input type="number" className="input" min={0} placeholder="499"
                    value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
                </div>
                {form.discountType === 'percentage' && (
                  <div>
                    <label className="label">Max Discount (₹)</label>
                    <input type="number" className="input" min={0} placeholder="500"
                      value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Usage Limit</label>
                  <input type="number" className="input" min={1} placeholder="100 (blank = unlimited)"
                    value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} />
                </div>
                <div>
                  <label className="label">Expiry Date</label>
                  <input type="date" className="input" value={form.expiresAt}
                    onChange={e => set('expiresAt', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)}
                    className="w-4 h-4 accent-gold" />
                  <span className="text-sm font-medium text-gray-700">Active (can be used by customers)</span>
                </label>
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
