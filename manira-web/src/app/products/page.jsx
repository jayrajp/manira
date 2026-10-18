'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid2X2, Grid3X3, List, ChevronDown, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import api, { normalizeProduct } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'default',      label: 'Best Selling'      },
  { value: 'newest',       label: 'Newest First'       },
  { value: 'price_asc',    label: 'Price: Low → High'  },
  { value: 'price_desc',   label: 'Price: High → Low'  },
  { value: 'rating',       label: 'Best Rated'         },
  { value: 'bestselling',  label: 'Most Popular'       },
];

const PER_PAGE_OPTIONS = [12, 24, 48];

const PRICE_RANGES = [
  { label: 'Under ₹500',        min: 0,    max: 499   },
  { label: '₹500 – ₹999',      min: 500,  max: 999   },
  { label: '₹1,000 – ₹2,499',  min: 1000, max: 2499  },
  { label: '₹2,500 – ₹4,999',  min: 2500, max: 4999  },
  { label: '₹5,000 – ₹9,999',  min: 5000, max: 9999  },
  { label: '₹10,000 & Above',   min: 10000,max: 999999},
];

const DISCOUNT_OPTIONS = [
  { label: '10% or more', min: 10 },
  { label: '25% or more', min: 25 },
  { label: '40% or more', min: 40 },
  { label: '60% or more', min: 60 },
];

const LOOKS = ['Gold', 'Silver', 'Rose Gold', 'Oxidized', 'Ethnic', 'Modern', 'Bridal', 'Casual'];
const GENDERS = [{ label: 'Women', value: 'women' }, { label: 'Men', value: 'men' }, { label: 'Unisex', value: 'unisex' }];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100 pt-4 pb-2">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3">
        {title}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterRadio({ name, label, value, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <input type="radio" name={name} className="w-3.5 h-3.5 accent-gold"
        checked={checked} onChange={() => onChange(value)} />
      <span className="text-sm text-gray-600 group-hover:text-gold transition-colors">{label}</span>
    </label>
  );
}

function ProductsInner() {
  const searchParams = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [categories,  setCategories]  = useState([]);
  const [collections, setCollections] = useState([]);
  const [view,        setView]        = useState('grid4');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [perPage,     setPerPage]     = useState(24);
  const [sort,        setSort]        = useState('default');

  const [filters, setFilters] = useState({
    category:    searchParams.get('category')  || '',
    collection:  searchParams.get('collection')|| '',
    look:        searchParams.get('look')      || '',
    gender:      searchParams.get('gender')    || '',
    priceRange:  null,
    discountMin: null,
    onSale:      searchParams.get('filter') === 'sale',
  });

  useEffect(() => {
    const urlSort = searchParams.get('sort') || 'default';
    setSort(urlSort === 'newest' ? 'newest' : 'default');
    setFilters(f => ({
      ...f,
      category:   searchParams.get('category')  || '',
      collection: searchParams.get('collection')|| '',
      look:       searchParams.get('look')      || '',
      gender:     searchParams.get('gender')    || '',
      onSale:     searchParams.get('filter') === 'sale',
    }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
    api.get('/collections').then(r => setCollections(r.data || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page, limit: perPage });
      const search = searchParams.get('search');
      const badge  = searchParams.get('badge');
      if (search)            params.set('search',     search);
      if (badge)             params.set('badge',      badge);
      if (filters.category)  params.set('category',   filters.category);
      if (filters.collection)params.set('collection', filters.collection);
      if (filters.look)      params.set('look',       filters.look);
      if (filters.gender)    params.set('gender',     filters.gender);
      if (filters.onSale)    params.set('onSale',     'true');
      if (filters.priceRange) {
        params.set('minPrice', filters.priceRange.min);
        params.set('maxPrice', filters.priceRange.max);
      }
      const res = await api.get(`/products?${params}`);
      setProducts((res.data?.products || []).map(normalizeProduct));
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  }, [sort, page, perPage, filters, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };
  const clearFilters = () => {
    setFilters({ category: '', collection: '', look: '', gender: '', priceRange: null, discountMin: null, onSale: false });
    setPage(1);
  };

  const activeCount = [filters.category, filters.collection, filters.look, filters.gender, filters.priceRange, filters.onSale]
    .filter(Boolean).length;

  const pageTitle = searchParams.get('badge') === 'new' ? 'New Arrivals'
    : searchParams.get('filter') === 'sale'   ? 'Sale & Offers'
    : searchParams.get('search') ? `Results for "${searchParams.get('search')}"`
    : 'All Jewellery';

  const FilterPanel = () => (
    <div className={`${filterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-60 flex-shrink-0`}>
      <div className="bg-white p-5 sticky top-24 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Filters</h3>
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-gold hover:underline flex items-center gap-1">
              <X size={11} /> Clear ({activeCount})
            </button>
          )}
        </div>

        {/* Shop by Type */}
        <FilterSection title="Shop by Type">
          {categories.map(cat => (
            <FilterRadio key={cat.id} name="category" label={`${cat.name}${cat.productCount ? ` (${cat.productCount})` : ''}`}
              value={cat.slug} checked={filters.category === cat.slug}
              onChange={v => setFilter('category', filters.category === v ? '' : v)} />
          ))}
        </FilterSection>

        {/* Shop by Look */}
        <FilterSection title="Shop by Look">
          {LOOKS.map(look => (
            <FilterRadio key={look} name="look" label={look}
              value={look} checked={filters.look === look}
              onChange={v => setFilter('look', filters.look === v ? '' : v)} />
          ))}
        </FilterSection>

        {/* Shop by Price */}
        <FilterSection title="Shop by Price">
          {PRICE_RANGES.map(r => (
            <FilterRadio key={r.label} name="price" label={r.label}
              value={r.label} checked={filters.priceRange?.label === r.label}
              onChange={() => setFilter('priceRange', filters.priceRange?.label === r.label ? null : r)} />
          ))}
        </FilterSection>

        {/* Shop by Collection */}
        {collections.length > 0 && (
          <FilterSection title="Shop by Collection">
            {collections.map(col => (
              <FilterRadio key={col.id} name="collection" label={col.name}
                value={col.slug} checked={filters.collection === col.slug}
                onChange={v => setFilter('collection', filters.collection === v ? '' : v)} />
            ))}
          </FilterSection>
        )}

        {/* Gender */}
        <FilterSection title="Gender" defaultOpen={false}>
          {GENDERS.map(g => (
            <FilterRadio key={g.value} name="gender" label={g.label}
              value={g.value} checked={filters.gender === g.value}
              onChange={v => setFilter('gender', filters.gender === v ? '' : v)} />
          ))}
        </FilterSection>
      </div>
    </div>
  );

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">{pageTitle}</h1>
          <nav className="mt-2 text-xs text-gray-400">
            <a href="/" className="hover:text-gold">Home</a> / <span className="text-gray-200">{pageTitle}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 bg-white border border-gray-100 px-3 py-2.5 flex-wrap">
          <button onClick={() => setFilterOpen(o => !o)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-medium border border-gray-300 px-3 py-1.5 hover:border-gold">
            <SlidersHorizontal size={13} /> Filters
            {activeCount > 0 && <span className="bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>

          <span className="text-xs text-gray-500 hidden sm:block">{total} items</span>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Per page */}
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="text-xs border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-gold bg-white">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
            </select>

            {/* Sort */}
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-gold bg-white">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex border border-gray-200">
              {[['grid2', Grid2X2], ['grid4', Grid3X3], ['list', List]].map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-1.5 transition-colors ${view === v ? 'bg-gold text-white' : 'text-gray-400 hover:text-gold'}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <FilterPanel />

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={view === 'list' ? 'space-y-0' : view === 'grid2' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3'}>
                {[...Array(8)].map((_, i) => <div key={i} className="bg-white animate-pulse" style={{ aspectRatio: '3/4' }} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">💎</p>
                <h3 className="font-semibold text-gray-700 text-lg mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={
                  view === 'list'  ? 'border border-gray-100 bg-white' :
                  view === 'grid2' ? 'grid grid-cols-2 gap-4' :
                                     'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3'
                }>
                  {products.map(p => <ProductCard key={p.id} product={p} view={view} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-300 hover:border-gold disabled:opacity-40">← Prev</button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 text-sm border ${page === p ? 'bg-gold text-white border-gold' : 'border-gray-300 hover:border-gold'}`}>
                          {p}
                        </button>
                      );
                    })}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" /></div>}>
      <ProductsInner />
    </Suspense>
  );
}
