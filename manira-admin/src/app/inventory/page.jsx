'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice } from '@/lib/api';
import { Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [edits,    setEdits]    = useState({}); // { productId: newStock }
  const [saving,   setSaving]   = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (search) params.set('search', search);
      const res = await api.get(`/inventory?${params}`);
      setProducts(res.data?.products || []);
      setTotal(res.data?.total || 0);
      setEdits({});
    } catch { toast.error('Failed to load inventory'); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setEdit = (id, val) => setEdits(e => ({ ...e, [id]: val }));

  const handleSaveAll = async () => {
    const updates = Object.entries(edits).filter(([, v]) => v !== '' && v !== undefined);
    if (!updates.length) { toast('No changes to save'); return; }
    setSaving(true);
    try {
      await Promise.all(updates.map(([id, stock]) => api.patch(`/inventory/${id}`, { stock: Number(stock) })));
      toast.success(`${updates.length} item(s) updated`);
      fetchProducts();
    } catch { toast.error('Failed to save some updates'); }
    setSaving(false);
  };

  const totalPages = Math.ceil(total / 30);
  const hasEdits = Object.keys(edits).length > 0;

  return (
    <AdminLayout title="Inventory">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input pl-9 w-64 text-sm py-2" />
        </div>
        {hasEdits && (
          <button onClick={handleSaveAll} disabled={saving}
            className="ml-auto btn-primary flex items-center gap-1.5 text-xs px-4 py-2 disabled:opacity-60">
            <Save size={13} /> {saving ? 'Saving...' : `Save Changes (${Object.keys(edits).length})`}
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'SKU', 'Price', 'Current Stock', 'New Stock', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${edits[p.id] !== undefined ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-lg">
                        {p.mainImage && <Image src={p.mainImage} alt={p.name} fill className="object-cover" unoptimized />}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{p.sku}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.stock <= 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                    {p.stock <= 5 && p.stock > 0 && <span className="ml-2 text-[10px] text-orange-500 font-medium">Low</span>}
                    {p.stock <= 0 && <span className="ml-2 text-[10px] text-red-500 font-medium">Out</span>}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      placeholder={String(p.stock)}
                      value={edits[p.id] ?? ''}
                      onChange={e => setEdit(p.id, e.target.value)}
                      className="input w-24 text-sm py-1.5 text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' :
                      p.status === 'draft'  ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{total} products</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <span className="px-3 py-1.5 text-xs bg-gold text-white rounded-lg">Page {page}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
