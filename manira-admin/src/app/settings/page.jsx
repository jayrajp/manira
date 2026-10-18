'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const TABS = ['General', 'Shipping', 'Payment', 'SEO', 'Admin'];

export default function SettingsPage() {
  const [tab,     setTab]     = useState('General');
  const [settings,setSettings]= useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data || {})).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  const Field = ({ label, k, type = 'text', placeholder = '' }) => (
    <div>
      <label className="label">{label}</label>
      {type === 'textarea' ? (
        <textarea className="input" rows={3} value={settings[k] || ''} placeholder={placeholder}
          onChange={e => set(k, e.target.value)} />
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input type="checkbox" checked={!!settings[k]} onChange={e => set(k, e.target.checked)}
            className="w-4 h-4 accent-gold" />
          <span className="text-sm text-gray-700">{placeholder}</span>
        </label>
      ) : (
        <input type={type} className="input" value={settings[k] || ''} placeholder={placeholder}
          onChange={e => set(k, e.target.value)} />
      )}
    </div>
  );

  return (
    <AdminLayout title="Settings">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="card space-y-5">
            {tab === 'General' && (
              <>
                <h3 className="font-semibold text-gray-800 pb-3 border-b">General Settings</h3>
                <Field label="Store Name"         k="storeName"      placeholder="Manira Jewellery" />
                <Field label="Store Tagline"      k="storeTagline"   placeholder="Timeless Beauty" />
                <Field label="Store Email"        k="storeEmail"     type="email" placeholder="hello@manira.in" />
                <Field label="Store Phone"        k="storePhone"     placeholder="+91 98765 43210" />
                <Field label="Store Address"      k="storeAddress"   type="textarea" placeholder="123, Jewellery Street..." />
                <Field label="Currency"           k="currency"       placeholder="INR" />
                <Field label="Logo URL"           k="logoUrl"        placeholder="https://..." />
              </>
            )}
            {tab === 'Shipping' && (
              <>
                <h3 className="font-semibold text-gray-800 pb-3 border-b">Shipping Settings</h3>
                <Field label="Free Shipping Threshold (₹)" k="freeShippingThreshold" type="number" placeholder="499" />
                <Field label="Standard Shipping Charge (₹)" k="shippingCharge"       type="number" placeholder="49" />
                <Field label="Express Shipping Charge (₹)" k="expressShippingCharge" type="number" placeholder="99" />
                <Field label="Estimated Delivery Days"      k="deliveryDays"          placeholder="3-5 business days" />
                <Field label="Shiprocket Email"             k="shiprocketEmail"       type="email" />
                <Field label="Shiprocket Password"         k="shiprocketPassword"    type="password" />
              </>
            )}
            {tab === 'Payment' && (
              <>
                <h3 className="font-semibold text-gray-800 pb-3 border-b">Payment Settings</h3>
                <Field label="Razorpay Key ID"    k="razorpayKeyId"    placeholder="rzp_live_..." />
                <Field label="Razorpay Key Secret" k="razorpayKeySecret" type="password" placeholder="•••••" />
                <Field label="COD Enabled"        k="codEnabled"       type="checkbox" placeholder="Enable Cash on Delivery" />
                <Field label="COD Extra Charge (₹)" k="codCharge"      type="number" placeholder="0" />
              </>
            )}
            {tab === 'SEO' && (
              <>
                <h3 className="font-semibold text-gray-800 pb-3 border-b">SEO Settings</h3>
                <Field label="Meta Title"       k="metaTitle"       placeholder="Manira — Jewellery for Every Moment" />
                <Field label="Meta Description" k="metaDescription" type="textarea" placeholder="Discover timeless jewellery..." />
                <Field label="Meta Keywords"    k="metaKeywords"    placeholder="jewellery, gold, silver, rings, necklaces" />
                <Field label="Google Analytics ID" k="gaId"         placeholder="G-XXXXXXXXXX" />
                <Field label="Facebook Pixel ID"   k="fbPixelId"    placeholder="123456789" />
              </>
            )}
            {tab === 'Admin' && (
              <>
                <h3 className="font-semibold text-gray-800 pb-3 border-b">Admin Account</h3>
                <p className="text-xs text-gray-500 mb-2">Update your admin password below. Leave blank to keep current password.</p>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Enter new password"
                    onChange={e => set('newPassword', e.target.value)} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" className="input" placeholder="Confirm new password"
                    onChange={e => set('confirmPassword', e.target.value)} />
                </div>
              </>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
