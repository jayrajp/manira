'use client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </AuthProvider>
  );
}
