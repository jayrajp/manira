'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import api, { formatDate } from '@/lib/api';
import { Search, Star, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews,  setReviews]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [approved, setApproved] = useState('all'); // 'all' | 'true' | 'false'
  const [page,     setPage]     = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search)              params.set('search', search);
      if (approved !== 'all')  params.set('isApproved', approved);
      const res = await api.get(`/reviews?${params}`);
      setReviews(res.data?.reviews || []);
      setTotal(res.data?.total     || 0);
    } catch { toast.error('Failed to load reviews'); }
    setLoading(false);
  }, [search, approved, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id, isApproved) => {
    try {
      await api.patch(`/reviews/${id}`, { isApproved: !isApproved });
      toast.success(isApproved ? 'Review hidden' : 'Review approved');
      fetchReviews();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete'); }
  };

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'fill-gold text-gold' : 'text-gray-200'} />
      ))}
    </div>
  );

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Reviews">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reviews..."
            className="input pl-9 w-64 text-sm py-2" />
        </div>
        <select value={approved} onChange={e => { setApproved(e.target.value); setPage(1); }}
          className="input w-40 text-sm py-2">
          <option value="all">All Reviews</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
        <p className="ml-auto text-xs text-gray-500">{total} reviews total</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Customer', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
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
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No reviews found</td></tr>
              ) : reviews.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                        {r.productImage && <Image src={r.productImage} alt="" fill className="object-cover" unoptimized />}
                      </div>
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{r.productName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-800">{r.customerName || 'Anonymous'}</p>
                    {r.isVerified && <span className="text-[10px] text-green-600 font-medium">Verified Purchase</span>}
                  </td>
                  <td className="px-4 py-3"><Stars rating={r.rating} /></td>
                  <td className="px-4 py-3">
                    {r.title && <p className="text-xs font-semibold text-gray-800">{r.title}</p>}
                    <p className="text-xs text-gray-500 max-w-[200px] truncate">{r.body}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleApprove(r.id, r.isApproved)}
                        className={`p-1.5 transition-colors rounded-lg hover:bg-gray-100 ${r.isApproved ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                        title={r.isApproved ? 'Hide review' : 'Approve review'}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                        <Trash2 size={14} />
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
            <p className="text-xs text-gray-500">{total} reviews</p>
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
