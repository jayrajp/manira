'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Lock, ChevronRight, Truck, CreditCard } from 'lucide-react';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

export default function CheckoutPage() {
  const { items, total, shipping, dispatch } = useCart();
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=address, 2=payment
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('online'); // 'online' | 'cod'
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    address: '', city: '', state: 'Gujarat', pincode: '',
  });

  const grand    = total + shipping;
  const discount = 0;

  if (!items.length) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some jewellery to proceed to checkout</p>
          <Link href="/products" className="btn-primary px-8 py-3">Shop Now</Link>
        </div>
      </div>
    );
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!form.pincode.match(/^\d{6}$/)) { toast.error('Enter valid 6-digit pincode'); return; }
    if (!form.phone.match(/^[6-9]\d{9}$/)) { toast.error('Enter valid 10-digit mobile number'); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  // ── Cash on Delivery ─────────────────────────────────────────────────────────
  const handleCod = async () => {
    setLoading(true);
    try {
      const payload = {
        customerName: form.name,
        email:        form.email,
        phone:        form.phone,
        addressLine:  form.address,
        city:         form.city,
        state:        form.state,
        pincode:      form.pincode,
        items: items.map(i => ({
          productId:   i.id,
          productName: i.name,
          productImage:i.images?.[0] || '',
          price:       i.price,
          quantity:    i.qty,
          variant:     i.variant || '',
          size:        i.size    || '',
        })),
        couponCode: '',
      };
      await api.post('/payment/cod', payload);
      dispatch({ type: 'CLEAR' });
      toast.success('Order placed! Pay on delivery. 🎉');
      router.push('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  // ── Razorpay ─────────────────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payment/create', {
        amount: grand,
        items: items.map(i => ({ productId: i.id, quantity: i.qty, variant: i.variant, size: i.size })),
        address: form,
      });

      const rzp = new window.Razorpay({
        key:         data.keyId,
        amount:      data.amount,
        currency:    'INR',
        name:        'Manira Jewels',
        description: 'Imitation Jewellery Order',
        order_id:    data.razorpayOrderId || data.orderId,
        prefill:     { name: form.name, email: form.email, contact: form.phone },
        theme:       { color: '#B8860B' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customerName:  form.name,
              email:         form.email,
              phone:         form.phone,
              addressLine:   form.address,
              city:          form.city,
              state:         form.state,
              pincode:       form.pincode,
              items: items.map(i => ({
                productId:   i.id,
                productName: i.name,
                productImage:i.images?.[0] || '',
                price:       i.price,
                quantity:    i.qty,
                variant:     i.variant || '',
                size:        i.size    || '',
              })),
              couponCode: '',
            });
            dispatch({ type: 'CLEAR' });
            toast.success('Order placed successfully! 🎉');
            router.push('/orders');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed. Try COD instead.');
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    if (payMethod === 'cod') handleCod();
    else handleRazorpay();
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-serif text-2xl font-bold text-black mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <span className={`font-semibold ${step >= 1 ? 'text-gold' : 'text-gray-400'}`}>1. Delivery Address</span>
          <ChevronRight size={14} className="text-gray-400" />
          <span className={`font-semibold ${step >= 2 ? 'text-gold' : 'text-gray-400'}`}>2. Payment</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel */}
          <div className="lg:col-span-2">

            {/* Step 1: Address */}
            {step === 1 && (
              <form onSubmit={handleAddressSubmit} className="bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800 mb-2">Delivery Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name',    label: 'Full Name',  type: 'text',  placeholder: 'Your Name',       required: true  },
                    { key: 'email',   label: 'Email',       type: 'email', placeholder: 'your@email.com',  required: true  },
                    { key: 'phone',   label: 'Phone',       type: 'tel',   placeholder: '9876543210',      required: true  },
                    { key: 'pincode', label: 'Pincode',     type: 'text',  placeholder: '380001',          required: true  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">{f.label}</label>
                      <input type={f.type} required={f.required} value={form[f.key]} placeholder={f.placeholder}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">Address</label>
                  <textarea required rows={2} value={form.address} placeholder="House No, Street, Area, Landmark"
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold resize-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">City</label>
                    <input type="text" required value={form.city} placeholder="Ahmedabad"
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 uppercase tracking-wide">State</label>
                    <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gold bg-white">
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2">Continue to Payment</button>
              </form>
            )}

            {/* Step 2: Payment method selection */}
            {step === 2 && (
              <div className="bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-800 mb-4">Select Payment Method</h2>

                {/* Online Payment */}
                <label className={`flex items-start gap-3 border-2 p-4 rounded-lg cursor-pointer transition-colors
                  ${payMethod === 'online' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payMethod" value="online"
                    checked={payMethod === 'online'} onChange={() => setPayMethod('online')}
                    className="mt-0.5 accent-gold" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gold" />
                      <p className="font-semibold text-sm">Pay Online</p>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">RECOMMENDED</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">UPI, Card, Net Banking, Wallets via Razorpay</p>
                    {payMethod === 'online' && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                        <Lock size={11} /> 100% secure — powered by Razorpay
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-start gap-3 border-2 p-4 rounded-lg cursor-pointer transition-colors
                  ${payMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payMethod" value="cod"
                    checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')}
                    className="mt-0.5 accent-gold" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-600" />
                      <p className="font-semibold text-sm">Cash on Delivery</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Pay in cash when your order arrives</p>
                    {payMethod === 'cod' && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                        COD available for orders up to ₹5,000. An extra ₹0 handling charge may apply.
                      </div>
                    )}
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">Back</button>
                  <button onClick={handlePayNow} disabled={loading}
                    className="btn-primary flex-1 py-3 disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                      : payMethod === 'cod'
                        ? `Place Order (COD) — ${formatPrice(grand)}`
                        : `Pay ${formatPrice(grand)}`
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 shadow-sm h-fit">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 flex-1 pr-2">
                    {item.name} {item.variant && `(${item.variant})`} × {item.qty}
                  </span>
                  <span className="font-medium text-black flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && <p className="text-xs text-green-600">🎉 You qualify for free shipping!</p>}
            </div>
            <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-gold">{formatPrice(grand)}</span>
            </div>

            {/* Trust badges */}
            <div className="mt-4 pt-4 border-t space-y-2">
              {[
                { icon: '🔒', text: 'Secure Checkout' },
                { icon: '🔄', text: '15-Day Easy Returns' },
                { icon: '🚚', text: `Free Shipping ${shipping === 0 ? '✓' : 'above ₹999'}` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
