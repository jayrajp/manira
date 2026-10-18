'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Truck, Shield, RefreshCw, Star, ChevronDown, Minus, Plus, Check, Play } from 'lucide-react';
import api, { normalizeProduct, formatPrice } from '@/lib/api';
import { useCart }     from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const [product,       setProduct]       = useState(null);
  const [related,       setRelated]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [selectedVar,   setSelectedVar]   = useState('');
  const [selectedSize,  setSelectedSize]  = useState('');
  const [qty,           setQty]           = useState(1);
  const [expandedFaq,   setExpandedFaq]   = useState(null);
  const [activeTab,     setActiveTab]     = useState('description');
  const [freeShipping,  setFreeShipping]  = useState(999);

  const { dispatch: cartDispatch } = useCart();
  const { dispatch: wishDispatch, isWishlisted } = useWishlist();

  useEffect(() => {
    api.get('/settings').then(r => { if (r.data?.freeShippingMin) setFreeShipping(Number(r.data.freeShippingMin)); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!params?.slug) return;
    setLoading(true);
    api.get(`/products/${params.slug}`)
      .then(res => {
        const p = normalizeProduct(res.data);
        setProduct(p);
        setSelectedVar(p.variants?.[0]?.label || '');
        setSelectedSize(p.sizes?.[0]?.size || '');
        if (p.categoryId) {
          api.get(`/products?category=${p.categoryId}&limit=5`)
            .then(r => setRelated((r.data?.products || []).filter(x => x.id !== p.id).slice(0, 4).map(normalizeProduct)))
            .catch(() => {});
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-4xl">💎</p>
      <h2 className="font-serif text-2xl">Product not found</h2>
      <Link href="/products" className="btn-primary px-6 py-3">Browse All Jewellery</Link>
    </div>
  );

  const wishlisted = isWishlisted(product.id);
  const allMedia = product.videoUrl
    ? (product.mediaOrder === 'video_first'
        ? [{ type: 'video', src: product.videoUrl }, ...product.images.map(s => ({ type: 'image', src: s }))]
        : [...product.images.map(s => ({ type: 'image', src: s })), { type: 'video', src: product.videoUrl }])
    : product.images.map(s => ({ type: 'image', src: s }));
  const currentMedia = allMedia[selectedMedia] || allMedia[0];

  const selectedVariant = product.variants?.find(v => v.label === selectedVar);
  const variantStock    = selectedVariant?.stock ?? null;
  const selectedSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const sizeStock       = selectedSizeObj?.stock ?? null;
  const effectiveStock  = sizeStock ?? variantStock ?? product.stock;

  const addToCart = () => {
    if (effectiveStock === 0) { toast.error('Out of stock'); return; }
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, variant: selectedVar, size: selectedSize, qty } });
    toast.success(`${product.name} added to bag!`, { icon: '🛍️' });
  };
  const buyNow = () => { addToCart(); window.location.href = '/checkout'; };

  const faqs = [
    { q: 'What metal is this made of?',      a: `This piece is crafted in ${product.metal || 'premium metal'} ${product.purity ? `(${product.purity})` : ''}.` },
    { q: 'How do I care for this jewellery?', a: product.careInstructions || 'Avoid contact with water, perfume, and chemicals. Store in the pouch provided.' },
    { q: 'What is the return policy?',        a: 'We offer a 15-day easy return policy. Item must be unworn with original packaging.' },
    { q: 'How long does delivery take?',      a: 'Standard delivery: 3–7 business days. Express delivery available at checkout.' },
  ];

  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 py-3">
        <nav className="max-w-7xl mx-auto text-xs text-gray-500 flex gap-1 flex-wrap">
          <Link href="/" className="hover:text-gold">Home</Link> /
          <Link href="/products" className="hover:text-gold">Jewellery</Link> /
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-10">

          {/* Media Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px]">
              {allMedia.map((media, i) => (
                <button key={i} onClick={() => setSelectedMedia(i)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative border-2 transition-colors overflow-hidden ${selectedMedia === i ? 'border-gold' : 'border-gray-200 hover:border-gold/50'}`}>
                  {media.type === 'video'
                    ? <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Play size={18} className="text-white" /></div>
                    : <Image src={media.src} alt={`View ${i + 1}`} fill className="object-cover" unoptimized />
                  }
                </button>
              ))}
            </div>

            {/* Main viewer */}
            <div className="flex-1 relative bg-white" style={{ aspectRatio: '3/4' }}>
              {currentMedia?.type === 'video'
                ? <video src={currentMedia.src} controls className="w-full h-full object-contain" />
                : <Image src={currentMedia?.src || product.images[0]} alt={product.name} fill className="object-contain transition-all duration-300" priority unoptimized />
              }
              {/* Badges */}
              {product.discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{product.discount}%</span>
              )}
              {!product.discount && product.badge === 'new' && (
                <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2.5 py-1 rounded-full">NEW</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            {/* Metal & Name */}
            <div>
              {product.metal && <p className="text-xs text-gold font-semibold uppercase tracking-widest">{product.metal} {product.purity && `• ${product.purity}`}</p>}
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-black mt-1 leading-snug">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill={i < Math.floor(product.rating) ? '#B8860B' : 'none'} className="text-gold" />
                  ))}
                </div>
                <span className="text-sm font-semibold">{Number(product.rating).toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.reviewCount || 0} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-cream-dark p-4 border-l-4 border-gold">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-black text-3xl">{formatPrice(product.price)}</span>
                {product.mrp > product.price && (
                  <span className="text-gray-400 line-through text-xl">{formatPrice(product.mrp)}</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                    Save {formatPrice(product.mrp - product.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes. Free delivery above {formatPrice(freeShipping)}.</p>
            </div>

            {/* Variants (color/finish) */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Finish: <span className="font-normal text-gray-600">{selectedVar}</span>
                  {variantStock !== null && variantStock <= 3 && variantStock > 0 && (
                    <span className="ml-2 text-xs text-orange-500 font-semibold">Only {variantStock} left!</span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map(v => (
                    <button key={v.label} onClick={() => setSelectedVar(v.label)}
                      disabled={v.stock === 0}
                      title={v.label}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs border-2 font-medium transition-all ${
                        selectedVar === v.label ? 'border-gold text-black' : 'border-gray-200 text-gray-600 hover:border-gold/50'
                      } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}>
                      {v.hexColor && <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: v.hexColor }} />}
                      {v.label}
                      {selectedVar === v.label && <Check size={12} className="text-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes (for rings/bangles) */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Size: <span className="font-normal text-gray-600">{selectedSize}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)}
                      disabled={s.stock === 0}
                      className={`w-10 h-10 text-xs font-semibold border-2 transition-all ${
                        selectedSize === s.size ? 'border-gold bg-gold text-white' : 'border-gray-200 hover:border-gold'
                      } ${s.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-800">Quantity:</p>
              <div className="flex items-center border border-gray-300">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100"><Minus size={13} /></button>
                <span className="px-5 py-2 text-sm font-semibold border-x border-gray-300">{qty}</span>
                <button onClick={() => setQty(q => Math.min(effectiveStock || 10, q + 1))} className="px-3 py-2 hover:bg-gray-100"><Plus size={13} /></button>
              </div>
              {product.inStock ? <span className="text-xs text-green-600 font-semibold">✓ In Stock</span>
                               : <span className="text-xs text-red-500 font-semibold">Out of Stock</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <button onClick={addToCart} disabled={!product.inStock || effectiveStock === 0}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                <ShoppingBag size={17} /> Add to Bag
              </button>
              <button onClick={buyNow} disabled={!product.inStock || effectiveStock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                Buy Now
              </button>
              <button onClick={() => { wishDispatch({ type: 'TOGGLE', payload: product }); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!'); }}
                className={`w-12 h-12 border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'bg-red-50 border-red-400 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400'
                }`}>
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Truck,     label: 'Free Delivery', sub: `above ${formatPrice(freeShipping)}` },
                { icon: Shield,    label: 'BIS Hallmark',  sub: '100% Certified' },
                { icon: RefreshCw, label: 'Easy Returns',  sub: '15 Days' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="border border-gray-100 bg-white p-3">
                  <Icon size={18} className="text-gold mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-white border border-gray-100">
          <div className="flex border-b overflow-x-auto">
            {['description', 'details', 'reviews', 'faq'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab ? 'text-gold border-b-2 border-gold bg-cream' : 'text-gray-500 hover:text-gold'
                }`}>
                {tab === 'faq' ? 'FAQ' : tab}
                {tab === 'reviews' && <span className="ml-1 text-xs text-gray-400">({product.reviewCount || 0})</span>}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <p className="text-gray-700 leading-relaxed text-sm">{product.description || 'No description available.'}</p>
            )}
            {activeTab === 'details' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['Metal',      product.metal],
                  ['Purity',     product.purity],
                  ['Stone',      product.stone],
                  ['Finish',     product.finish],
                  ['Gender',     product.gender],
                  ['Occasion',   product.occasion],
                  ['Weight',     product.weight ? `${product.weight}g` : null],
                  ['Dimensions', product.dimensions],
                  ['SKU',        product.sku],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm border-b border-gray-50 pb-2">
                    <span className="font-semibold text-gray-700 min-w-[110px]">{k}:</span>
                    <span className="text-gray-600 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-black">{Number(product.rating).toFixed(1)}</div>
                    <div className="flex gap-1 justify-center mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating) ? '#B8860B' : 'none'} className="text-gold" />)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{product.reviewCount || 0} reviews</p>
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <div key={r.id} className="border border-gray-100 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                            {(r.customerName || 'C')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-semibold">{r.customerName || 'Customer'}</p>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < r.rating ? '#B8860B' : 'none'} className="text-gold" />)}
                              </div>
                            </div>
                            {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Be the first to review this product!</p>
                )}
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-100">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="flex items-center justify-between w-full p-4 text-left text-sm font-semibold text-gray-800 hover:bg-cream transition-colors">
                      {faq.q}
                      <ChevronDown size={15} className={`flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t bg-cream">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-black">You May Also Like</h2>
                <div className="w-10 h-0.5 bg-gold mt-2" />
              </div>
              <Link href="/products" className="text-sm text-gold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
