'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice, formatDate } from '@/lib/api';
import { Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS  = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_OPTIONS = ['all', 'pending', 'paid', 'failed', 'refunded'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-orange-100 text-orange-700',
};
const PAYMENT_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('all');
  const [payment, setPayment] = useState('all');
  const [page,    setPage]    = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search)            params.set('search', search);
      if (status !== 'all')  params.set('status', status);
      if (payment !== 'all') params.set('paymentStatus', payment);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data?.orders || []);
      setTotal(res.data?.total   || 0);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }, [search, status, payment, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update status'); }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Orders">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Order # or customer..."
            className="input pl-9 w-60 text-sm py-2" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="input w-40 text-sm py-2">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
        </select>
        <select value={payment} onChange={e => { setPayment(e.target.value); setPage(1); }}
          className="input w-40 text-sm py-2">
          {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Payment' : s}</option>)}
        </select>
        <p className="ml-auto text-xs text-gray-500">{total} orders total</p>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
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
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="text-gold hover:underline font-semibold text-xs">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PAYMENT_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="p-1.5 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-100 inline-flex">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{total} orders total</p>
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
