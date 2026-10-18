'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Heart size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-bold mb-2">Sign in to view your Wishlist</h2>
        <p className="text-gray-500 text-sm mb-6">Save pieces you love and come back to them anytime.</p>
        <Link href="/auth/login" className="btn-primary px-8 py-3">Sign In</Link>
      </div>
    </div>
  );

  if (!items.length) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Heart size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Tap the ♡ on any product to save it here.</p>
        <Link href="/products" className="btn-primary px-8 py-3">Explore Jewellery</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-black">My Wishlist <span className="text-gray-400 text-lg font-normal">({items.length})</span></h1>
          <Link href="/products" className="text-sm text-gold hover:underline">Continue Shopping</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
