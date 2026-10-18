'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice, formatDate } from '@/lib/api';
import { ShoppingBag, Users, IndianRupee, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const [stats,    setStats]    = useState(null);
  const [revenue,  setRevenue]  = useState([]);
  const [topProds, setTopProds] = useState([]);
  const [recOrders,setRecOrders]= useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/revenue'),
      api.get('/dashboard/top-products'),
      api.get('/dashboard/recent-orders'),
    ]).then(([s, r, tp, ro]) => {
      setStats(s.data);
      setRevenue(r.data || []);
      setTopProds(tp.data || []);
      setRecOrders(ro.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Revenue',   value: formatPrice(stats.totalRevenue),   icon: IndianRupee, color: 'text-gold',   bg: 'bg-yellow-50' },
    { label: 'Total Orders',    value: stats.totalOrders,                  icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats.totalCustomers,               icon: Users,       color: 'text-green-600',bg: 'bg-green-50' },
    { label: 'Total Products',  value: stats.totalProducts,                icon: Package,     color: 'text-purple-600',bg:'bg-purple-50' },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="stat-card animate-pulse h-28" />)}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-800">Revenue (Last 6 Months)</h3>
                <TrendingUp size={18} className="text-gold" />
              </div>
              {revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => formatPrice(v)} />
                    <Bar dataKey="revenue" fill="#B8860B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
              )}
            </div>

            {/* Top Products */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Top Products</h3>
                <Link href="/products" className="text-xs text-gold hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {topProds.length > 0 ? topProds.slice(0, 5).map((p, i) => (
                  <div key={p.productId || i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.totalSold} sold</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{formatPrice(p.revenue)}</span>
                  </div>
                )) : <p className="text-xs text-gray-400 text-center py-4">No sales data yet</p>}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              <Link href="/orders" className="text-xs text-gold hover:underline flex items-center gap-1">View all <ArrowUpRight size={12} /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recOrders.length > 0 ? recOrders.map(o => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <Link href={`/orders/${o.id}`} className="text-gold hover:underline font-medium text-xs">{o.orderNumber}</Link>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700">{o.customerName}</td>
                      <td className="py-3 pr-4 text-xs font-semibold">{formatPrice(o.total)}</td>
                      <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                      <td className="py-3 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span></td>
                      <td className="py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="py-8 text-center text-xs text-gray-400">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
