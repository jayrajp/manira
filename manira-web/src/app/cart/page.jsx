'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';

export default function CartPage() {
  const { items, dispatch, total, shipping } = useCart();

  const updateQty = (item, qty) =>
    dispatch({ type: 'UPDATE_QTY', payload: { ...item, qty } });
  const remove = (item) =>
    dispatch({ type: 'REMOVE', payload: item });

  if (!items.length) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-5">
      <ShoppingBag size={56} className="text-gray-300" />
      <h2 className="font-serif text-2xl font-bold text-gray-700">Your bag is empty</h2>
      <p className="text-gray-400 text-sm">Add some jewellery to get started!</p>
      <Link href="/products" className="btn-primary px-8 py-3">Continue Shopping</Link>
    </div>
  );

  const grandTotal = total + shipping;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-black mb-8">Shopping Bag ({items.reduce((s, i) => s + i.qty, 0)} items)</h1>
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map(item => {
              const key = `${item.id}_${item.variant || ''}_${item.size || ''}`;
              const img = item.images?.[0] || '';
              return (
                <div key={key} className="bg-white p-4 flex gap-4 border border-gray-100">
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0 relative w-24 h-32">
                    {img && <Image src={img} alt={item.name} fill className="object-cover" unoptimized />}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="text-sm font-semibold text-gray-800 hover:text-gold line-clamp-2">{item.name}</h3>
                      </Link>
                      <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                        {item.variant && <p>Finish: {item.variant}</p>}
                        {item.size    && <p>Size: {item.size}</p>}
                        {item.metal   && <p>Metal: {item.metal}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQty(item, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-gray-50"><Minus size={12} /></button>
                        <span className="px-4 py-1.5 text-sm font-semibold border-x">{item.qty}</span>
                        <button onClick={() => updateQty(item, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-gray-50"><Plus size={12} /></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-black">{formatPrice(item.price * item.qty)}</span>
                        <button onClick={() => remove(item)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white border border-gray-100 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-5 pb-3 border-b">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add {formatPrice(999 - total)} more for free shipping</p>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Total</span><span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-6 py-3.5">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link href="/products" className="text-sm text-gold hover:underline text-center block mt-4">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
