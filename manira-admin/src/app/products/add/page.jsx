'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, X } from 'lucide-react';

const METALS  = ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'White Gold', 'Brass', 'Copper', 'Alloy'];
const PURITY  = ['24K', '22K', '18K', '14K', '925 Sterling', '916 Gold', '999 Silver', 'Gold Plated', 'Rhodium Plated'];
const FINISHES= ['Polished', 'Matte', 'Oxidized', 'Hammered', 'Antique', 'Brushed', 'Satin'];
const LOOKS   = ['Ethnic', 'Modern', 'Bridal', 'Casual', 'Western', 'Traditional', 'Fusion', 'Minimalist'];
const GENDERS = ['women', 'men', 'unisex'];
const OCCASIONS = ['Wedding', 'Festival', 'Party', 'Office', 'Daily Wear', 'Engagement', 'Anniversary'];
const BADGES  = ['', 'new', 'bestseller', 'sale', 'trending', 'limited'];
const STATUSES= ['active', 'draft', 'out_of_stock'];

const COMMON_STONES = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Kundan', 'Polki', 'American Diamond', 'Moissanite', 'Coral', 'Topaz', 'No Stone'];

const RING_SIZES   = ['4', '5', '6', '7', '8', '9', '10', '11', '12', 'Free Size'];
const BANGLE_SIZES = ['2.2', '2.4', '2.6', '2.8', '3.0', 'Free Size'];

export default function AddProductPage() {
  const router = useRouter();
  const [saving,   setSaving]   = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [collections, setCollections] = useState([]);
  const [metals,      setMetals]      = useState(METALS);
  const [stones,      setStones]      = useState(COMMON_STONES);

  const [form, setForm] = useState({
    name: '', sku: '', categoryId: '', collectionId: '',
    metal: '', purity: '', stone: '', finish: '', look: '',
    gender: 'women', occasion: '', isFeatured: false,
    price: '', mrp: '', stock: '0', status: 'active',
    description: '', careInstructions: '',
    weight: '', dimensions: '',
    tags: '', badge: '', videoUrl: '', mediaOrder: 'image_first',
    seoTitle: '', seoDescription: '',
  });

  const [images,   setImages]   = useState([]); // [{imageUrl, isMain, displayOrder}]
  const [variants, setVariants] = useState([]); // [{label, hexColor, stock}]
  const [sizes,    setSizes]    = useState([]); // [{size, stock}]
  const [uploading,setUploading]= useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
    api.get('/collections').then(r => setCollections(r.data || [])).catch(() => {});
    api.get('/masters/metals').then(r => { if (r.data?.length) setMetals(r.data.map(m => m.name)); }).catch(() => {});
    api.get('/masters/stones').then(r => { if (r.data?.length) setStones(r.data.map(s => s.name)); }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map(async file => {
        const fd = new FormData(); fd.append('image', file);
        const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data.url;
      }));
      setImages(prev => [
        ...prev,
        ...results.map((url, i) => ({ imageUrl: url, isMain: prev.length + i === 0, displayOrder: prev.length + i })),
      ]);
      toast.success(`${results.length} image(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, displayOrder: i }));
      if (next.length > 0 && !next.some(i => i.isMain)) next[0].isMain = true;
      return next;
    });
  };
  const setMain = (idx) => setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === idx })));

  const addVariant = () => setVariants(v => [...v, { label: '', hexColor: '#B8860B', stock: 0 }]);
  const updateVariant = (i, k, val) => setVariants(v => v.map((x, j) => j === i ? { ...x, [k]: val } : x));
  const removeVariant = (i) => setVariants(v => v.filter((_, j) => j !== i));

  const addSize = () => setSizes(s => [...s, { size: '', stock: 0 }]);
  const updateSize = (i, k, val) => setSizes(s => s.map((x, j) => j === i ? { ...x, [k]: val } : x));
  const removeSize = (i) => setSizes(s => s.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price || !form.mrp) {
      toast.error('Name, SKU, Price and MRP are required'); return;
    }
    setSaving(true);
    try {
      await api.post('/products', {
        ...form,
        price:    Number(form.price),
        mrp:      Number(form.mrp),
        stock:    Number(form.stock),
        weight:   form.weight ? Number(form.weight) : null,
        badge:    form.badge || null,
        videoUrl: form.videoUrl || null,
        images, variants, sizes,
      });
      toast.success('Product created!');
      router.push('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally { setSaving(false); }
  };

  const discount = form.price && form.mrp && Number(form.mrp) > Number(form.price)
    ? Math.round((1 - Number(form.price) / Number(form.mrp)) * 100) : 0;

  return (
    <AdminLayout title="Add Product">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">

        {/* Basic Info */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" placeholder="e.g. Kundan Floral Necklace Set" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">SKU *</label>
              <input className="input" placeholder="e.g. MNR-NKL-001" value={form.sku}
                onChange={e => set('sku', e.target.value)} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">— Select Category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Collection</label>
              <select className="input" value={form.collectionId} onChange={e => set('collectionId', e.target.value)}>
                <option value="">— Select Collection —</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={4} placeholder="Product description..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Jewelry-Specific Fields */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b flex items-center gap-2">
            <span>💎</span> Jewellery Details
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Metal</label>
              <select className="input" value={form.metal} onChange={e => set('metal', e.target.value)}>
                <option value="">— Select Metal —</option>
                {metals.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Purity</label>
              <select className="input" value={form.purity} onChange={e => set('purity', e.target.value)}>
                <option value="">— Select Purity —</option>
                {PURITY.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Finish</label>
              <select className="input" value={form.finish} onChange={e => set('finish', e.target.value)}>
                <option value="">— Select Finish —</option>
                {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Look / Style</label>
              <select className="input" value={form.look} onChange={e => set('look', e.target.value)}>
                <option value="">— Select Look —</option>
                {LOOKS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stone / Gemstone</label>
              <select className="input" value={form.stone} onChange={e => set('stone', e.target.value)}>
                <option value="">— No Stone / Select —</option>
                {stones.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Occasion(s)</label>
              <input className="input" placeholder="e.g. Wedding, Festival" value={form.occasion}
                onChange={e => set('occasion', e.target.value)} />
              <p className="text-[10px] text-gray-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="label">Weight (grams)</label>
              <input type="number" step="0.01" className="input" placeholder="e.g. 12.5"
                value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
            <div>
              <label className="label">Dimensions</label>
              <input className="input" placeholder="e.g. 2.5cm × 1.8cm"
                value={form.dimensions} onChange={e => set('dimensions', e.target.value)} />
            </div>
            <div>
              <label className="label">Care Instructions</label>
              <input className="input" placeholder="Avoid water, perfume..."
                value={form.careInstructions} onChange={e => set('careInstructions', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">Pricing & Inventory</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input type="number" className="input" placeholder="999" required min={0}
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="label">MRP (₹) *</label>
              <input type="number" className="input" placeholder="1499" required min={0}
                value={form.mrp} onChange={e => set('mrp', e.target.value)} />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" className="input" placeholder="0" min={0}
                value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
            <div className="flex items-end">
              {discount > 0 && (
                <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 font-semibold">{discount}% Discount</p>
                  <p className="text-[10px] text-green-500">Customer saves ₹{Number(form.mrp) - Number(form.price)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">Product Images</h3>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-gold transition-colors ${uploading ? 'opacity-50' : ''}`}>
            <Upload size={24} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
              {images.map((img, i) => (
                <div key={i} className={`relative group rounded-lg overflow-hidden border-2 aspect-square ${img.isMain ? 'border-gold' : 'border-gray-200'}`}>
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <button type="button" onClick={() => setMain(i)} className="text-[10px] text-white bg-gold px-2 py-0.5 rounded font-medium">Main</button>
                    <button type="button" onClick={() => removeImage(i)} className="text-[10px] text-white bg-red-500 px-2 py-0.5 rounded font-medium">Remove</button>
                  </div>
                  {img.isMain && (
                    <span className="absolute top-1 left-1 bg-gold text-white text-[9px] px-1 py-0.5 rounded font-bold">MAIN</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants (Color/Finish) */}
        <div className="card">
          <div className="flex items-center justify-between mb-5 pb-3 border-b">
            <h3 className="font-semibold text-gray-800">Variants (Color / Finish)</h3>
            <button type="button" onClick={addVariant} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <Plus size={13} /> Add Variant
            </button>
          </div>
          {variants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No variants added. Add variants for multiple colors or finishes (e.g., Gold, Silver, Rose Gold).</p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end bg-gray-50 p-3 rounded-lg">
                  <div>
                    <label className="label">Label</label>
                    <input className="input" placeholder="e.g. Gold" value={v.label}
                      onChange={e => updateVariant(i, 'label', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Color Swatch</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={v.hexColor || '#B8860B'}
                        onChange={e => updateVariant(i, 'hexColor', e.target.value)}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" />
                      <input className="input" placeholder="#B8860B" value={v.hexColor || ''}
                        onChange={e => updateVariant(i, 'hexColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="label">Stock</label>
                      <input type="number" className="input" min={0} value={v.stock}
                        onChange={e => updateVariant(i, 'stock', Number(e.target.value))} />
                    </div>
                    <button type="button" onClick={() => removeVariant(i)}
                      className="w-10 h-10 flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sizes (for rings/bangles) */}
        <div className="card">
          <div className="flex items-center justify-between mb-5 pb-3 border-b">
            <h3 className="font-semibold text-gray-800">Sizes (Rings / Bangles)</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSizes(RING_SIZES.map(s => ({ size: s, stock: 0 })))}
                className="text-xs text-gold hover:underline">Preset Ring Sizes</button>
              <button type="button" onClick={() => setSizes(BANGLE_SIZES.map(s => ({ size: s, stock: 0 })))}
                className="text-xs text-gold hover:underline">Preset Bangle Sizes</button>
              <button type="button" onClick={addSize} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Plus size={13} /> Add Size
              </button>
            </div>
          </div>
          {sizes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No sizes added. Skip for necklaces, earrings, etc.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {sizes.map((s, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg relative">
                  <button type="button" onClick={() => removeSize(i)}
                    className="absolute top-1 right-1 text-gray-300 hover:text-red-500 transition-colors">
                    <X size={12} />
                  </button>
                  <label className="label">Size</label>
                  <input className="input mb-2" placeholder="e.g. 7" value={s.size}
                    onChange={e => updateSize(i, 'size', e.target.value)} />
                  <label className="label">Stock</label>
                  <input type="number" className="input" min={0} value={s.stock}
                    onChange={e => updateSize(i, 'stock', Number(e.target.value))} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promotions */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">Promotions & Visibility</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Badge</label>
              <select className="input" value={form.badge} onChange={e => set('badge', e.target.value)}>
                {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" placeholder="kundan, bridal, gold,..."
                value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div>
              <label className="label">Media Order</label>
              <select className="input" value={form.mediaOrder} onChange={e => set('mediaOrder', e.target.value)}>
                <option value="image_first">Images First</option>
                <option value="video_first">Video First</option>
              </select>
            </div>
            <div>
              <label className="label">Product Video URL</label>
              <input className="input" placeholder="https://..." value={form.videoUrl}
                onChange={e => set('videoUrl', e.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)}
                  className="w-4 h-4 accent-gold rounded" />
                <span className="text-sm font-medium text-gray-700">Feature on Homepage</span>
              </label>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">SEO</h3>
          <div className="grid sm:grid-cols-1 gap-4">
            <div>
              <label className="label">SEO Title</label>
              <input className="input" placeholder="Product title for search engines"
                value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} />
            </div>
            <div>
              <label className="label">SEO Description</label>
              <textarea className="input" rows={2} placeholder="Meta description for search engines"
                value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
