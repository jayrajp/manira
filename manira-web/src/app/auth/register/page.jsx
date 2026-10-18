'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please verify your email.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = (data) => {
    login(data.user, data.token);
    toast.success(`Welcome to Manira, ${data.user.name}! 🎉`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&h=1000&fit=crop"
          alt="Manira Jewellery"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 to-black/55 flex flex-col items-center justify-center text-white p-12">
          <div className="text-center">
            <h2 className="font-serif text-4xl font-bold tracking-widest mb-4">MANIRA</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-sm text-gray-300 mb-6">Join thousands of jewellery lovers</p>
            <div className="space-y-4 text-left max-w-xs">
              {[
                'Exclusive member offers & early access',
                'Track all your orders in one place',
                'Save your wishlist & revisit anytime',
                'Personalised jewellery recommendations',
              ].map(benefit => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-gray-200">
                  <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  {benefit}
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
            <div className="mb-7">
              <h1 className="font-serif text-2xl font-bold text-gray-900">Create account</h1>
              <p className="text-gray-500 text-sm mt-1">Join Manira for exclusive benefits</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required placeholder="Your full name" value={form.name} onChange={update('name')}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required placeholder="your@email.com" value={form.email} onChange={update('email')}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" placeholder="9876543210" minLength={10} value={form.phone} onChange={update('phone')}
                    className="w-full border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Min. 8 characters"
                    minLength={8} value={form.password} onChange={update('password')}
                    className="w-full border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 accent-gold mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-gold hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-60 mt-1">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign-Up */}
            <GoogleAuthButton onSuccess={handleGoogleSuccess} label="signup_with" />

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold font-semibold hover:underline">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
