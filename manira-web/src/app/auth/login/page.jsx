'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      router.push('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error('Please verify your email first.');
        router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = (data) => {
    login(data.user, data.token);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left — decorative jewellery panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop"
          alt="Manira Jewellery"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 flex flex-col items-center justify-center text-white p-12">
          <div className="text-center">
            <h2 className="font-serif text-4xl font-bold tracking-widest mb-4">MANIRA</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <p className="font-serif text-xl italic text-gray-200 leading-relaxed">
              &ldquo;Style that speaks<br />without a word.&rdquo;
            </p>
            <p className="text-gray-300 mt-6 text-sm leading-relaxed max-w-xs">
              Trendy imitation jewellery for women & men — stylish, affordable & crafted with love.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {['Free shipping above ₹999', '15-day easy returns', 'Secure payments via Razorpay'].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-xs">✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="font-serif text-3xl font-bold text-black tracking-widest">
              MANIRA
            </Link>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="mb-8">
              <h1 className="font-serif text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to your Manira account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required placeholder="your@email.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign-In */}
            <GoogleAuthButton onSuccess={handleGoogleSuccess} label="signin_with" />

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-gold font-semibold hover:underline">
                Create one free →
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="hover:text-gold underline">Terms</Link>
            {' & '}
            <Link href="/privacy-policy" className="hover:text-gold underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
