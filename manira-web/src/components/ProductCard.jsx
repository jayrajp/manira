'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart }     from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth }     from '@/context/AuthContext';
import { formatPrice } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, view = 'grid' }) {
  const { dispatch: cartDispatch }               = useCart();
  const { dispatch: wishDispatch, isWishlisted } = useWishlist();
  const { isLoggedIn, openLoginModal }           = useAuth();

  const wishlisted  = isWishlisted(product.id);
  const mainImage   = product.images?.[0] || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&h=800&fit=crop';
  const discount    = product.discount || 0;
  const isNew       = product.badge === 'new';
  const isBestseller= product.badge === 'bestseller';

  const addToCart = (e) => {
    e.preventDefault();
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, variant: product.variants?.[0]?.label || '' } });
    toast.success('Added to cart!', { icon: '🛍️' });
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { openLoginModal(); return; }
    wishDispatch({ type: 'TOGGLE', payload: product });
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  /* ── LIST VIEW ──────────────────────────────────────────────── */
  if (view === 'list') {
    return (
      <div className="flex gap-4 p-4 bg-white border-b border-gray-100 hover:bg-cream transition-colors">
        <Link href={`/products/${product.slug}`} className="flex-shrink-0 relative w-28 sm:w-36" style={{ aspectRatio: '3/4' }}>
          <Image src={mainImage} alt={product.name} fill className="object-cover" unoptimized />
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        </Link>
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-medium text-gray-800 hover:text-gold line-clamp-2">{product.name}</h3>
            </Link>
            {product.metal && <p className="text-xs text-gold mt-1 font-medium">{product.metal}</p>}
            {product.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < Math.floor(product.rating) ? '#B8860B' : 'none'} className="text-gold" />)}
                </div>
                <span className="text-[10px] text-gray-500">({product.reviewCount || 0})</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black text-base">{formatPrice(product.price)}</span>
              {product.mrp > product.price && <span className="text-gray-400 line-through text-sm">{formatPrice(product.mrp)}</span>}
              {discount > 0 && <span className="text-xs text-green-600 font-semibold">{discount}% off</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={toggleWishlist}
                className={`p-2 border rounded-full transition-colors ${wishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'}`}>
                <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={addToCart} className="bg-gold text-white px-4 py-1.5 text-xs font-semibold hover:bg-gold-dark transition-colors flex items-center gap-1.5">
                <ShoppingBag size={12} /> Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VIEW (default — Voylla style) ─────────────────────── */
  return (
    <div className="group relative bg-white cursor-pointer">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />

        {/* Discount badge — Voylla style: red circle top-left */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10">
            -{discount}%
          </span>
        )}
        {!discount && isNew && (
          <span className="absolute top-2 left-2 bg-gold text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10">NEW</span>
        )}
        {!discount && isBestseller && (
          <span className="absolute top-2 left-2 bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10">BESTSELLER</span>
        )}

        {/* Wishlist button */}
        <button onClick={toggleWishlist}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100'
          }`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Mobile add button */}
        <button onClick={addToCart}
          className="sm:hidden absolute bottom-2 right-2 z-10 w-9 h-9 bg-gold text-white rounded-full flex items-center justify-center shadow active:scale-95">
          <ShoppingBag size={15} />
        </button>

        {/* Desktop hover add-to-bag bar */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={addToCart}
            className="w-full bg-black text-white text-xs font-semibold py-3 flex items-center justify-center gap-2 hover:bg-gold transition-colors">
            <ShoppingBag size={14} /> Add to Bag
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-2.5 pb-3 px-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs sm:text-sm text-gray-800 hover:text-gold transition-colors line-clamp-2 font-medium leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill={i < Math.floor(product.rating) ? '#B8860B' : 'none'} className="text-gold" />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="font-bold text-black text-sm">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-gray-400 line-through text-xs">{formatPrice(product.mrp)}</span>
          )}
          {discount > 0 && (
            <span className="text-xs text-green-600 font-semibold">{discount}% off</span>
          )}
        </div>
      </div>
    </div>
  );
}
