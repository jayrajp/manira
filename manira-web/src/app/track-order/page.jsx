'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Truck, Package, Search, CheckCircle, MapPin, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const STEP_LABELS  = ['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
const STEP_ICONS   = ['📦', '✅', '🚚', '🏍️', '🎉'];

export default function TrackOrderPage() {
  const { isLoggedIn } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [email,       setEmail]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [order,       setOrder]       = useState(null);
  const [error,       setError]       = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/track?orderNumber=${orderNumber}&email=${email}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your order number and email.');
    }
    setLoading(false);
  };

  const stepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Truck size={28} className="text-gold" />
            <h1 className="font-serif text-3xl font-bold">Track Your Order</h1>
          </div>
          <p className="text-gray-400 text-sm">Enter your order details to get real-time updates</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Track form */}
        <div className="bg-white p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-5">Enter Order Details</h2>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Order Number</label>
              <input type="text" required value={orderNumber} placeholder="e.g. MNR-2024-001234"
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
              <p className="text-xs text-gray-400 mt-1">Found in your order confirmation email</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Email Address</label>
              <input type="email" required value={email} placeholder="Email used for this order"
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              <Search size={15} />
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          {isLoggedIn && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Or <Link href="/orders" className="text-gold hover:underline">view all your orders →</Link>
            </p>
          )}
        </div>

        {/* Order tracking result */}
        {order && (
          <div className="bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gold/5 border-b border-gold/20 p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-gray-500">Order Number</p>
                  <p className="font-bold text-lg text-gray-900">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Placed on</p>
                  <p className="font-semibold text-sm text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress stepper */}
            {order.status !== 'cancelled' ? (
              <div className="p-6 border-b">
                <div className="flex items-start justify-between relative">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
                  <div className="absolute top-4 left-4 h-0.5 bg-gold transition-all"
                    style={{ width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2 z-10 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                        ${i < stepIdx ? 'bg-gold border-gold text-white' :
                          i === stepIdx ? 'bg-gold border-gold text-white ring-4 ring-gold/20' :
                          'bg-white border-gray-300 text-gray-400'}`}>
                        {i < stepIdx ? '✓' : STEP_ICONS[i]}
                      </div>
                      <span className={`text-[10px] text-center hidden sm:block ${i <= stepIdx ? 'text-gold font-semibold' : 'text-gray-400'}`}>
                        {STEP_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-gray-800 capitalize">{order.status?.replace(/_/g, ' ')}</p>
                  {order.status === 'shipped' && order.awbNumber && (
                    <p className="text-xs text-gray-500 mt-1">AWB: <span className="font-mono font-semibold">{order.awbNumber}</span>
                      {order.courierPartner && ` (${order.courierPartner})`}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 border-b text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="font-semibold text-red-600">Order Cancelled</p>
                <p className="text-xs text-gray-500 mt-1">This order has been cancelled. Refund will be processed within 5–7 business days.</p>
              </div>
            )}

            {/* Order items */}
            <div className="p-5">
              <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Package size={15} /> Items in this order
              </h3>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.productName} {item.variant && `(${item.variant})`}</span>
                    <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                <MapPin size={12} />
                <span>{order.city}, {order.state} - {order.pincode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info boxes */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Clock,        title: 'Delivery Time',    desc: '4–7 business days for most locations' },
            { icon: Truck,        title: 'Free Shipping',    desc: 'On orders above ₹999' },
            { icon: CheckCircle,  title: '15-Day Returns',   desc: 'Easy returns within 15 days of delivery' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white p-4 shadow-sm text-center">
              <Icon size={22} className="text-gold mx-auto mb-2" />
              <p className="font-semibold text-sm text-gray-800">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Having trouble? <Link href="/contact" className="text-gold hover:underline">Contact our support team</Link>
        </p>
      </div>
    </div>
  );
}
