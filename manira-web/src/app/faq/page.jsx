'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    category: 'Products',
    items: [
      {
        q: 'What type of jewellery does Manira sell?',
        a: 'Manira specialises in imitation (fashion) jewellery for women and men. Our pieces are crafted to look beautiful and stylish without using real precious metals or stones. All finishes like "Antique Gold", "Silver Tone", "Oxidised" refer to the plating style only.',
      },
      {
        q: 'Is the jewellery skin-friendly?',
        a: 'Yes, we use high-quality brass, copper, and zinc alloy base metals with protective plating. However, individual sensitivities vary. If you have metal allergies, we recommend checking the product description for material details.',
      },
      {
        q: 'How do I care for my imitation jewellery?',
        a: 'Keep jewellery away from water, perfume, and sweat. Store in the provided pouch or box. Wipe with a soft dry cloth after use. Avoid prolonged sun exposure to maintain shine and plating.',
      },
      {
        q: 'Do products look exactly like the photos?',
        a: 'We make every effort to ensure accurate product representation. However, actual colours may vary slightly due to screen calibration and photography lighting. Measurements are approximate.',
      },
    ],
  },
  {
    category: 'Orders & Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods via Razorpay: UPI (PhonePe, GPay, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and digital Wallets.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'Orders can be cancelled within 24 hours of placement. After dispatch, cancellation is not possible — but you can initiate a return after delivery. To cancel, contact us at support@manira.in.',
      },
      {
        q: 'Is it safe to pay on Manira?',
        a: 'Absolutely. All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We do not store any payment information on our servers.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 4–7 business days. Metro cities typically receive within 3–5 business days. Remote areas may take up to 10 business days.',
      },
      {
        q: 'Is there free shipping?',
        a: 'Yes! We offer FREE shipping on all orders above ₹999. Orders below ₹999 have a flat shipping fee of ₹49.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once shipped, you\'ll receive an SMS and email with your AWB tracking number. You can also use our Track Order page to get real-time updates.',
      },
      {
        q: 'Do you ship across India?',
        a: 'Yes, we deliver pan-India including remote locations. For international shipping, please contact us directly.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 15-day return policy. Items must be unused, unworn, and in original packaging with all tags intact. Sale items and personalised orders are not eligible for returns.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Email us at support@manira.in with your order number, reason for return, and photos of the item within 15 days of delivery. Our team will guide you through the process.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days to your original payment method.',
      },
      {
        q: 'What if I received a damaged product?',
        a: 'We\'re sorry about that! Please contact us within 48 hours of delivery with photos of the damaged item. We\'ll arrange a free replacement or full refund.',
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-gold transition-colors">
        <span className="text-sm font-medium text-gray-800">{q}</span>
        <ChevronDown size={16} className={`flex-shrink-0 text-gold transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-sm mt-2">Everything you need to know about Manira Jewels</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-6">
          {FAQS.map(({ category, items }) => (
            <div key={category} className="bg-white shadow-sm">
              <div className="bg-black text-white px-5 py-3">
                <h2 className="font-semibold text-sm tracking-wide">{category}</h2>
              </div>
              <div className="px-5">
                {items.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white p-6 shadow-sm text-center">
          <p className="text-2xl mb-3">💬</p>
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Our support team is happy to help you</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact" className="btn-primary px-6 py-2.5 text-sm">Contact Us</Link>
            <a href="mailto:support@manira.in" className="btn-secondary px-6 py-2.5 text-sm">Email Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
