'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import api, { normalizeProduct, formatPrice } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = [
  { label: 'Necklaces',    href: '/category/necklaces',    emoji: '📿' },
  { label: 'Earrings',     href: '/category/earrings',     emoji: '✨' },
  { label: 'Rings',        href: '/category/rings',        emoji: '💍' },
  { label: 'Bangles',      href: '/category/bangles',      emoji: '🔮' },
  { label: 'Bracelets',    href: '/category/bracelets',    emoji: '🌸' },
  { label: 'Mangalsutra',  href: '/category/mangalsutra',  emoji: '🪙' },
  { label: 'Maang Tikka',  href: '/category/maang-tikka',  emoji: '👑' },
  { label: 'Men',          href: '/products?gender=men',   emoji: '♟️' },
];

const SHOP_BY_LOOK = [
  { label: 'Antique Gold',  value: 'Antique Gold',  bg: 'bg-yellow-50',  border: 'border-yellow-300', dot: '#B8860B' },
  { label: 'Silver Tone',   value: 'Silver Tone',   bg: 'bg-gray-50',    border: 'border-gray-300',   dot: '#C0C0C0' },
  { label: 'Rose Gold',     value: 'Rose Gold',     bg: 'bg-rose-50',    border: 'border-rose-300',   dot: '#E8A0A0' },
  { label: 'Oxidised',      value: 'Oxidized',      bg: 'bg-stone-50',   border: 'border-stone-300',  dot: '#8B7355' },
  { label: 'Kundan',        value: 'Kundan',        bg: 'bg-amber-50',   border: 'border-amber-300',  dot: '#F59E0B' },
  { label: 'Meenakari',     value: 'Meenakari',     bg: 'bg-pink-50',    border: 'border-pink-300',   dot: '#EC4899' },
];

export default function HomePage() {
  const [banners,      setBanners]      = useState([]);
  const [featured,     setFeatured]     = useState([]);
  const [newArrivals,  setNewArrivals]  = useState([]);
  const [bestsellers,  setBestsellers]  = useState([]);
  const [collections,  setCollections]  = useState([]);
  const [bannerIdx,    setBannerIdx]    = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/banners?position=hero'),
      api.get('/products/featured'),
      api.get('/products/new-arrivals'),
      api.get('/products/bestsellers'),
      api.get('/collections'),
    ]).then(([b, f, n, bs, c]) => {
      setBanners(b.data || []);
      setFeatured((f.data || []).map(normalizeProduct));
      setNewArrivals((n.data || []).map(normalizeProduct));
      setBestsellers((bs.data || []).map(normalizeProduct));
      setCollections(c.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-black" style={{ height: '70vh', minHeight: 420 }}>
        {banners.length > 0 ? (
          <>
            {banners.map((b, i) => (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}>
                {b.image && <Image src={b.image} alt={b.title} fill className="object-cover opacity-70" unoptimized priority={i === 0} />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-8 w-full">
                    <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">{b.subtitle || 'New Collection'}</p>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold text-white max-w-xl leading-tight">{b.title}</h1>
                    {b.cta && b.link && (
                      <Link href={b.link} className="mt-6 inline-flex items-center gap-2 bg-gold text-white px-7 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors">
                        {b.cta} <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === bannerIdx ? 'bg-gold' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        ) : (
          /* Fallback hero */
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center">
            <div className="max-w-7xl mx-auto px-8">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3 font-medium">New Collection 2025</p>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-white max-w-xl leading-tight">
                Jewellery That<br />Tells Your Story
              </h1>
              <p className="text-gray-300 mt-4 max-w-md text-sm leading-relaxed">Trendy imitation jewellery for women &amp; men — from bridal to everyday wear, at prices you'll love.</p>
              <div className="flex gap-4 mt-8">
                <Link href="/products" className="bg-gold text-white px-7 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-gold-dark transition-colors">
                  Shop Now
                </Link>
                <Link href="/collections" className="border border-white text-white px-7 py-3.5 text-sm font-semibold tracking-widest uppercase hover:border-gold hover:text-gold transition-colors">
                  Collections
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Offer Strip (like Voylla's "Extra 15% off") ───────── */}
      <div className="bg-gold text-white text-center py-3 px-4">
        <p className="text-sm font-semibold tracking-wide">
          💎 Extra 10% off on orders above ₹999 — Use code: <span className="font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded">MANIRA10</span>
        </p>
      </div>

      {/* ── Shop by Category ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle mb-8">Find your perfect piece</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} href={cat.href}
              className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cream-dark border-2 border-gray-100 flex items-center justify-center text-2xl sm:text-3xl group-hover:border-gold group-hover:shadow-gold transition-all">
                {cat.emoji}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gold transition-colors text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular Products ─────────────────────────────────────── */}
      {(featured.length > 0 || loading) && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-black">Popular Products</h2>
              <div className="w-12 h-0.5 bg-gold mt-2" />
            </div>
            <Link href="/products" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <div key={i} className="bg-white animate-pulse" style={{ aspectRatio: '3/4' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {featured.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* ── New Launch ───────────────────────────────────────────── */}
      {(newArrivals.length > 0 || loading) && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-gold font-semibold tracking-widest uppercase">Just Arrived</span>
                <h2 className="font-serif text-2xl font-bold text-black mt-1">New Launch</h2>
                <div className="w-12 h-0.5 bg-gold mt-2" />
              </div>
              <Link href="/products?badge=new" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-cream animate-pulse" style={{ aspectRatio: '3/4' }} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Shop by Look (like Voylla's Shop by Style) ────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">Shop by Finish</h2>
        <p className="section-subtitle mb-8">Find your favourite style</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {SHOP_BY_LOOK.map(look => (
            <Link key={look.label} href={`/products?look=${look.value}`}
              className={`${look.bg} border ${look.border} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow group`}>
              <div className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: look.dot }} />
              <span className="text-xs font-semibold text-gray-700 group-hover:text-gold transition-colors">{look.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Collection ────────────────────────────────── */}
      {collections.length > 0 && (
        <section className="bg-cream-dark py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="section-title mb-2">Shop by Collection</h2>
            <p className="section-subtitle mb-8">Curated for every occasion</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {collections.slice(0, 4).map(col => (
                <Link key={col.id} href={`/collections/${col.slug}`}
                  className="relative overflow-hidden rounded-xl group" style={{ aspectRatio: '4/3' }}>
                  {col.image
                    ? <Image src={col.image} alt={col.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                    : <div className="w-full h-full bg-gradient-to-br from-gold/20 to-black/20" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="font-serif text-white font-bold text-lg leading-tight">{col.name}</h3>
                      <span className="text-gold text-xs font-medium mt-1 flex items-center gap-1">
                        Explore <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Best Sellers ──────────────────────────────────────── */}
      {(bestsellers.length > 0 || loading) && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-black">Best Sellers</h2>
              <div className="w-12 h-0.5 bg-gold mt-2" />
            </div>
            <Link href="/products?sort=bestselling" className="text-sm font-medium text-gold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-white animate-pulse" style={{ aspectRatio: '3/4' }} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bestsellers.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Trust Badges ─────────────────────────────────────── */}
      <section className="bg-black py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '✨', title: 'Imitation Jewellery', sub: 'Stylish & affordable fashion pieces' },
            { icon: '🚚', title: 'Free Shipping',        sub: 'On orders above ₹999' },
            { icon: '↩️', title: 'Easy Returns',         sub: '15-day return policy' },
            { icon: '💳', title: 'Secure Payment',       sub: 'Razorpay & UPI secured' },
          ].map(b => (
            <div key={b.title} className="text-white">
              <div className="text-3xl mb-2">{b.icon}</div>
              <h4 className="font-semibold text-sm">{b.title}</h4>
              <p className="text-gray-400 text-xs mt-1">{b.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
