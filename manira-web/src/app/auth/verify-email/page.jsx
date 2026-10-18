'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown,  setCooldown]  = useState(0);
  const inputs = useRef([]);
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const email = params.get('email') || '';

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-email', { email, otp: code });
      login(res.data.user, res.data.token);
      toast.success('Email verified! Welcome to Manira.');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent! Check your inbox.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-black">MANIRA</h1>
          <p className="text-gray-700 font-medium mt-4">Verify your email</p>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 focus:outline-none focus:border-gold"
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">Didn't receive the code? </span>
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-sm text-gold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
