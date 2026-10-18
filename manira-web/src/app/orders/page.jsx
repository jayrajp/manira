'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import api, { formatPrice, formatDate } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_COLOR = {
  pending:          'bg-yellow-100 text-yellow-700',
  processing:       'bg-blue-100 text-blue-700',
  confirmed:        'bg-blue-100 text-blue-700',
  shipped:          'bg-purple-100 text-purple-700',
  in_transit:       'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    api.get('/orders').then(r => setOrders(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-serif text-2xl font-bold text-black mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Your ordered jewellery will appear here.</p>
            <Link href="/products" className="btn-primary px-8 py-3">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-sm text-black">#{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)} · {order.items?.length || 0} item(s)</p>
                  <p className="text-sm font-bold text-gold mt-1">{formatPrice(order.total)}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
