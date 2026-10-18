'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Lock, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',   label: 'My Profile',   icon: User    },
  { id: 'orders',    label: 'My Orders',    icon: Package },
  { id: 'wishlist',  label: 'Wishlist',     icon: Heart   },
  { id: 'addresses', label: 'Addresses',    icon: MapPin  },
  { id: 'security',  label: 'Security',     icon: Lock    },
];

export default function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab]       = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [orders, setOrders]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', password: '', confirm: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    setForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [isLoggedIn, authLoading, user]);

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      api.get('/orders').then(r => setOrders(r.data || [])).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.password });
      toast.success('Password changed!');
      setPwForm({ current: '', password: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  if (authLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );

  if (!isLoggedIn) return null;

  const STATUS_COLOR = {
    pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-serif text-2xl font-bold text-black mb-6">My Account</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            {/* Avatar card */}
            <div className="bg-white p-5 shadow-sm text-center mb-3">
              <div className="w-16 h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-gold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            </div>

            {/* Nav tabs */}
            <nav className="bg-white shadow-sm">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left border-b border-gray-50 transition-colors
                    ${tab === id ? 'bg-gold/5 text-gold font-semibold border-l-2 border-l-gold' : 'text-gray-600 hover:bg-cream'}`}>
                  <Icon size={15} />
                  {label}
                </button>
              ))}
              <button onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left">
                Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-800">Personal Information</h2>
                  {!editing
                    ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-gold hover:underline"><Edit2 size={13} /> Edit</button>
                    : <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"><X size={13} /> Cancel</button>
                        <button onClick={handleProfileSave} disabled={saving}
                          className="flex items-center gap-1 text-xs bg-gold text-white px-3 py-1.5 disabled:opacity-60">
                          <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                  }
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Phone',     key: 'phone', type: 'tel'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{f.label}</label>
                      {editing
                        ? <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
                        : <p className="text-sm text-gray-800">{form[f.key] || '—'}</p>
                      }
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
                    <p className="text-sm text-gray-800">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Member Since</label>
                    <p className="text-sm text-gray-800">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">My Orders</h2>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-6 h-6 border-4 border-gold border-t-transparent rounded-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No orders yet</p>
                    <Link href="/products" className="btn-primary px-6 py-2 text-sm">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <Link key={order.id} href={`/orders/${order.id}`}
                        className="flex items-center justify-between p-4 border border-gray-100 hover:border-gold hover:shadow-sm transition-all">
                        <div>
                          <p className="text-sm font-semibold">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.items?.length || 0} item(s)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </Link>
                    ))}
                    {orders.length > 5 && (
                      <Link href="/orders" className="block text-center text-sm text-gold hover:underline mt-3">
                        View all {orders.length} orders →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {tab === 'wishlist' && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">My Wishlist</h2>
                <div className="text-center py-10">
                  <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">View and manage your saved pieces</p>
                  <Link href="/wishlist" className="btn-primary px-6 py-2 text-sm">Go to Wishlist</Link>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {tab === 'addresses' && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Saved Addresses</h2>
                <div className="text-center py-10">
                  <MapPin size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-4">Your saved delivery addresses will appear here</p>
                  <p className="text-xs text-gray-400">Addresses are saved automatically when you place an order</p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-5">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  {[
                    { label: 'Current Password', key: 'current'  },
                    { label: 'New Password',     key: 'password' },
                    { label: 'Confirm Password', key: 'confirm'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{f.label}</label>
                      <input type="password" required value={pwForm[f.key]}
                        onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
                    </div>
                  ))}
                  <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 disabled:opacity-60">
                    {saving ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
