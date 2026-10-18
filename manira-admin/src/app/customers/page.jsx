'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice, formatDate } from '@/lib/api';
import { Search, Eye, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await api.get(`/customers?${params}`);
      setCustomers(res.data?.customers || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Failed to load customers'); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const toggleBlock = async (id, isBlocked) => {
    try {
      await api.patch(`/customers/${id}`, { isBlocked: !isBlocked });
      toast.success(isBlocked ? 'Customer unblocked' : 'Customer blocked');
      fetchCustomers();
    } catch { toast.error('Failed to update customer'); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Customers">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="input pl-9 w-72 text-sm py-2" />
        </div>
        <p className="text-xs text-gray-500">{total} customers total</p>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Email / Phone', 'Orders', 'Total Spent', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No customers found</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 text-gold text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {(c.name || c.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600">{c.email}</p>
                    {c.phone && <p className="text-[10px] text-gray-400">{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.orderCount ?? 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatPrice(c.totalSpent || 0)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/${c.id}`} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => toggleBlock(c.id, c.isBlocked)}
                        className={`p-1.5 transition-colors rounded-lg hover:bg-gray-100 ${c.isBlocked ? 'text-gray-400 hover:text-green-500' : 'text-gray-400 hover:text-red-500'}`}>
                        {c.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{total} customers total</p>
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
