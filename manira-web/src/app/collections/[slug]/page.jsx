'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import api, { normalizeProduct } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'default',   label: 'Best Selling'     },
  { value: 'newest',    label: 'Newest First'      },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
];

export default function CollectionPage() {
  const { slug } = useParams();
  const [products, setProducts]     = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [sort, setSort]             = useState('default');

  useEffect(() => {
    api.get('/collections').then(r => {
      const col = (r.data || []).find(c => c.slug === slug);
      setCollection(col || { name: slug?.replace(/-/g, ' '), slug });
    }).catch(() => setCollection({ name: slug?.replace(/-/g, ' '), slug }));
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ collection: slug, sort, page, limit: 24 });
      const res = await api.get(`/products?${params}`);
      setProducts((res.data?.products || []).map(normalizeProduct));
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  }, [slug, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const collectionTitle = collection?.name
    ? collection.name.replace(/\b\w/g, l => l.toUpperCase())
    : slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Collection</p>
          <h1 className="font-serif text-4xl font-bold mb-3">{collectionTitle}</h1>
          {collection?.description && (
            <p className="text-gray-300 text-sm max-w-lg mx-auto">{collection.description}</p>
          )}
          <nav className="mt-4 text-xs text-gray-400">
            <Link href="/" className="hover:text-gold">Home</Link>
            {' / '}
            <span className="text-gray-200">{collectionTitle}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{total} pieces in this collection</p>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="text-xs border border-gray-200 px-3 py-2 focus:outline-none focus:border-gold bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white animate-pulse" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">✨</p>
            <h3 className="font-semibold text-gray-700 text-lg mb-2">Coming Soon</h3>
            <p className="text-gray-400 text-sm mb-6">This collection is being curated. Check back soon!</p>
            <Link href="/products" className="btn-primary">Browse All Jewellery</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 hover:border-gold disabled:opacity-40">← Prev</button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 text-sm border ${page === i + 1 ? 'bg-gold text-white border-gold' : 'border-gray-300 hover:border-gold'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 hover:border-gold disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
