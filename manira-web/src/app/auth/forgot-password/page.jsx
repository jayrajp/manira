'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-black">MANIRA</h1>
          <p className="text-gray-700 font-medium mt-4">Forgot your password?</p>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox (and spam folder).
            </div>
            <Link href="/auth/login" className="btn-primary w-full py-3 block text-center">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered it? <Link href="/auth/login" className="text-gold font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
