'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import api, { normalizeProduct } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'default',   label: 'Best Selling'      },
  { value: 'newest',    label: 'Newest First'       },
  { value: 'price_asc', label: 'Price: Low → High'  },
  { value: 'price_desc',label: 'Price: High → Low'  },
  { value: 'rating',    label: 'Best Rated'         },
];

const PRICE_RANGES = [
  { label: 'Under ₹500',       min: 0,    max: 499    },
  { label: '₹500 – ₹999',     min: 500,  max: 999    },
  { label: '₹1,000 – ₹2,499', min: 1000, max: 2499   },
  { label: '₹2,500 & Above',  min: 2500, max: 999999 },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts]   = useState([]);
  const [category, setCategory]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [sort, setSort]           = useState('default');
  const [priceRange, setPriceRange] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch category info
  useEffect(() => {
    api.get('/categories').then(r => {
      const cat = (r.data || []).find(c => c.slug === slug);
      setCategory(cat || { name: slug?.replace(/-/g, ' '), slug });
    }).catch(() => setCategory({ name: slug?.replace(/-/g, ' '), slug }));
  }, [slug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: slug, sort, page, limit: 24 });
      if (priceRange) {
        params.set('minPrice', priceRange.min);
        params.set('maxPrice', priceRange.max);
      }
      const res = await api.get(`/products?${params}`);
      setProducts((res.data?.products || []).map(normalizeProduct));
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  }, [slug, sort, page, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categoryTitle = category?.name
    ? category.name.replace(/\b\w/g, l => l.toUpperCase())
    : slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">{categoryTitle}</h1>
          <nav className="mt-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-gold">Home</Link>
            {' / '}
            <Link href="/products" className="hover:text-gold">All Jewellery</Link>
            {' / '}
            <span className="text-gray-200">{categoryTitle}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 bg-white border border-gray-100 px-3 py-2.5 flex-wrap">
          <button onClick={() => setFilterOpen(o => !o)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-medium border border-gray-300 px-3 py-1.5 hover:border-gold">
            <SlidersHorizontal size={13} /> Filters
          </button>
          <span className="text-xs text-gray-500">{total} items</span>
          <div className="flex items-center gap-2 ml-auto">
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-gold bg-white">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Filter sidebar */}
          <div className={`${filterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
            <div className="bg-white p-5 sticky top-24 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Filter</h3>
                {priceRange && (
                  <button onClick={() => setPriceRange(null)} className="text-xs text-gold hover:underline flex items-center gap-1">
                    <X size={11} /> Clear
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Price Range</p>
                <div className="space-y-2">
                  {PRICE_RANGES.map(r => (
                    <label key={r.label} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                      <input type="radio" name="price" className="w-3.5 h-3.5 accent-gold"
                        checked={priceRange?.label === r.label}
                        onChange={() => setPriceRange(priceRange?.label === r.label ? null : r)} />
                      <span className="text-sm text-gray-600 group-hover:text-gold">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white animate-pulse" style={{ aspectRatio: '3/4' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">💎</p>
                <h3 className="font-semibold text-gray-700 text-lg mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or check back later</p>
                <Link href="/products" className="btn-primary">Browse All Jewellery</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
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
      </div>
    </div>
  );
}
