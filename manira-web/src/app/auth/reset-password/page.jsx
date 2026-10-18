'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [form,    setForm]    = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please request a new link.');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-100 p-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-black mb-4">MANIRA</h1>
          <p className="text-red-600 text-sm mb-6">Invalid or missing reset link.</p>
          <Link href="/auth/forgot-password" className="btn-primary px-6 py-2.5">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-black">MANIRA</h1>
          <p className="text-gray-700 font-medium mt-4">Reset your password</p>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below.</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Password reset successfully. Redirecting to sign in...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-gold"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                placeholder="Repeat your password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-gold font-medium hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
