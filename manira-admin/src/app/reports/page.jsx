'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api, { formatPrice } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#B8860B', '#D4A017', '#1a1a2e', '#4B5563', '#9CA3AF'];

export default function ReportsPage() {
  const [revenue,    setRevenue]    = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [range,      setRange]      = useState('6m');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/reports/revenue?range=${range}`),
      api.get('/reports/top-products'),
      api.get('/reports/categories'),
      api.get('/reports/order-stats'),
    ]).then(([r, tp, cs, os]) => {
      setRevenue(r.data || []);
      setTopProds(tp.data || []);
      setCategoryStats(cs.data || []);
      setOrderStats(os.data);
    }).catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <AdminLayout title="Reports">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {orderStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue',    value: formatPrice(orderStats.totalRevenue),    icon: TrendingUp, color: 'text-gold',      bg: 'bg-yellow-50' },
                { label: 'Total Orders',     value: orderStats.totalOrders,                   icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Avg Order Value',  value: formatPrice(orderStats.avgOrderValue),   icon: Package,    color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Unique Customers', value: orderStats.uniqueCustomers,               icon: Users,      color: 'text-green-600',  bg: 'bg-green-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revenue Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Revenue Over Time</h3>
              <div className="flex gap-1">
                {['1m', '3m', '6m', '1y'].map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${range === r ? 'bg-gold text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [formatPrice(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#B8860B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Top Selling Products</h3>
              {topProds.length > 0 ? (
                <div className="space-y-3">
                  {topProds.slice(0, 8).map((p, i) => (
                    <div key={p.productId || i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                        <div className="mt-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gold h-full rounded-full" style={{ width: `${Math.min(100, (p.totalSold / (topProds[0]?.totalSold || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700">{p.totalSold} sold</p>
                        <p className="text-[10px] text-gray-400">{formatPrice(p.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">No sales data yet</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Sales by Category</h3>
              {categoryStats.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryStats} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {categoryStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => formatPrice(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {categoryStats.map((c, i) => (
                      <div key={c.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs text-gray-700">{c.category}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{formatPrice(c.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">No category data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
