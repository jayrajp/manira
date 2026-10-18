'use client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }     from '@/context/AuthContext';
import { CartProvider }     from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
