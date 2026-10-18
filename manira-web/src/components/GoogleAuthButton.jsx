'use client';
import { useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Loads Google Identity Services and renders the official Google Sign-In button
export default function GoogleAuthButton({ onSuccess, label = 'continue_with' }) {
  const btnRef   = useRef(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const init = () => {
      if (!window.google || !btnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const res = await api.post('/auth/google', { credential });
            onSuccess?.(res.data);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Google sign-in failed');
          }
        },
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme:          'outline',
        size:           'large',
        width:          btnRef.current.offsetWidth || 360,
        text:           label,           // 'continue_with' | 'signin_with' | 'signup_with'
        shape:          'rectangular',
        logo_alignment: 'center',
      });
    };

    // Script already loaded
    if (window.google) { init(); return; }

    const script      = document.createElement('script');
    script.src        = 'https://accounts.google.com/gsi/client';
    script.async      = true;
    script.defer      = true;
    script.onload     = init;
    document.head.appendChild(script);
  }, [clientId]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-gray-400 py-2 italic">
        Google Sign-In not configured
      </p>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={btnRef} className="w-full" style={{ minHeight: 44 }} />
    </div>
  );
}
