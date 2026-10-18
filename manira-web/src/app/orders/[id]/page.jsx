'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, MapPin, CreditCard, ChevronLeft, Truck } from 'lucide-react';
import api, { formatPrice } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_COLOR = {
  processing: 'bg-blue-100 text-blue-700', confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', in_transit: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => router.push('/orders')).finally(() => setLoading(false));
  }, [id, isLoggedIn, authLoading]);

  if (loading || authLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );
  if (!order) return null;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gold mb-6">
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-black">Order #{order.orderNumber}</h1>
            <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        {order.status !== 'cancelled' && (
          <div className="bg-white p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div className="absolute top-3 left-0 h-0.5 bg-gold z-0 transition-all"
                style={{ width: `${stepIdx >= 0 ? (stepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-1 z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIdx ? 'bg-gold text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span className="text-[10px] text-gray-500 capitalize hidden sm:block">{s.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><Package size={16} /> Items Ordered</h2>
              <div className="divide-y">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 py-3">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                      {item.productImage
                        ? <Image src={item.productImage} alt={item.productName} fill className="object-cover" unoptimized />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">💍</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                      {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      <p className="text-sm font-bold text-black mt-1">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-gold">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.awbNumber && (
              <div className="bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2"><Truck size={16} /> Tracking</h2>
                <p className="text-xs text-gray-600">AWB: <span className="font-mono font-semibold">{order.awbNumber}</span></p>
                {order.courierPartner && <p className="text-xs text-gray-600">Courier: {order.courierPartner}</p>}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><CreditCard size={16} /> Payment</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span></div>
                {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total</span><span className="text-gold">{formatPrice(order.total)}</span></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 capitalize">Payment: {order.paymentStatus} · {order.paymentMethod}</p>
            </div>

            <div className="bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} /> Delivery Address</h2>
              <p className="text-sm text-gray-700 font-medium">{order.customerName}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{order.addressLine}, {order.city} - {order.pincode}, {order.state}</p>
              <p className="text-xs text-gray-500 mt-1">{order.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
