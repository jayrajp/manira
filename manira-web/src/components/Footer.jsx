import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-white tracking-widest mb-3">MANIRA</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Trendy imitation jewellery for women &amp; men. Stylish, affordable &amp; crafted with love — every piece tells your story.
          </p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-gray-600 rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-widest uppercase">Shop</h4>
          <ul className="space-y-2">
            {[
              ['Women',        '/products?gender=women'],
              ['Men',          '/products?gender=men'],
              ['Earrings',     '/category/earrings'],
              ['Necklaces',    '/category/necklaces'],
              ['Bangles',      '/category/bangles'],
              ['New Arrivals', '/products?badge=new'],
              ['Sale',         '/products?filter=sale'],
            ].map(([label, href]) => (
              <li key={label}><Link href={href} className="text-sm hover:text-gold transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-widest uppercase">Help</h4>
          <ul className="space-y-2">
            {[
              ['Track Order',       '/track-order'],
              ['Return Policy',     '/return-policy'],
              ['Shipping Policy',   '/shipping-policy'],
              ['Privacy Policy',    '/privacy-policy'],
              ['Terms & Conditions','/terms'],
              ['FAQ',               '/faq'],
              ['Contact Us',        '/contact'],
            ].map(([label, href]) => (
              <li key={label}><Link href={href} className="text-sm hover:text-gold transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-widest uppercase">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
              <span>123, Jewellers Lane, Mumbai - 400001, Maharashtra</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gold flex-shrink-0" />
              <a href="tel:+919999999999" className="hover:text-gold">+91 99999 99999</a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-gold flex-shrink-0" />
              <a href="mailto:hello@manira.in" className="hover:text-gold">hello@manira.in</a>
            </li>
          </ul>
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Subscribe for offers</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 bg-gray-800 text-white text-xs px-3 py-2 border border-gray-700 focus:outline-none focus:border-gold" />
              <button type="submit" className="bg-gold text-white text-xs px-3 py-2 hover:bg-gold-dark transition-colors">GO</button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500">© 2025 Manira Jewels. All rights reserved.</p>
        <div className="flex gap-4">
          {['Visa', 'Mastercard', 'UPI', 'Razorpay'].map(m => (
            <span key={m} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{m}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
