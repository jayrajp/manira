'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, ChevronDown, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'active', 'draft', 'out_of_stock'];
const BADGE_OPTIONS  = ['all', 'new', 'bestseller', 'sale', 'trending', 'limited'];

export default function ProductsPage() {
  const [products, setProducts]   = useState([]);
  const [total,    setTotal]      = useState(0);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [status,   setStatus]     = useState('all');
  const [page,     setPage]       = useState(1);
  const [selected, setSelected]   = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search)            params.set('search', search);
      if (status !== 'all')  params.set('status', status);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data?.products || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length} products?`)) return;
    try {
      await api.delete('/products/bulk', { data: { ids: selected } });
      toast.success(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch { toast.error('Bulk delete failed'); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  const selectAll    = () => setSelected(selected.length === products.length ? [] : products.map(p => p.id));

  const getStatusBadge = (s) => ({
    active:       'bg-green-100 text-green-700',
    draft:        'bg-gray-100 text-gray-600',
    out_of_stock: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-600');

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="input pl-9 w-64 text-sm py-2" />
          </div>
          {/* Status filter */}
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input w-40 text-sm py-2">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="btn-danger text-xs px-3 py-2">
              Delete ({selected.length})
            </button>
          )}
          <Link href="/products/add" className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === products.length && products.length > 0}
                    onChange={selectAll} className="rounded" />
                </th>
                {['Product', 'SKU', 'Metal / Stone', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No products found</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-lg">
                        {product.mainImage && <Image src={product.mainImage} alt={product.name} fill className="object-cover" unoptimized />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.badge && <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-medium capitalize">{product.badge}</span>}
                          {product.gender && <span className="text-[10px] text-gray-400 capitalize">{product.gender}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{product.sku}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600">{product.metal || '—'}</p>
                    {product.stone && <p className="text-[10px] text-gray-400">{product.stone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.mrp > product.price && <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.mrp)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(product.status)}`}>
                      {product.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/products/edit/${product.id}`} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{total} products total</p>
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
