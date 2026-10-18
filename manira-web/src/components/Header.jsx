'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart }    from '@/context/CartContext';
import { useWishlist }from '@/context/WishlistContext';
import { useAuth }    from '@/context/AuthContext';
import api from '@/lib/api';

const NAV = [
  {
    label: 'Women',
    href:  '/products?gender=women',
    sub: [
      { label: 'Necklace Sets', href: '/category/necklace-sets' },
      { label: 'Earrings',      href: '/category/earrings' },
      { label: 'Rings',         href: '/category/rings' },
      { label: 'Bangles',       href: '/category/bangles' },
      { label: 'Bracelets',     href: '/category/bracelets' },
      { label: 'Mangalsutra',   href: '/category/mangalsutra' },
      { label: 'Pendants',      href: '/category/pendants' },
      { label: 'Anklets',       href: '/category/anklets' },
      { label: 'Maang Tikka',   href: '/category/maang-tikka' },
      { label: 'Nose Pins',     href: '/category/nose-pins' },
    ],
  },
  {
    label: 'Men',
    href:  '/products?gender=men',
    sub: [
      { label: 'Chains',      href: '/category/chains' },
      { label: 'Bracelets',   href: '/category/bracelets-men' },
      { label: 'Rings',       href: '/category/rings-men' },
      { label: 'Pendants',    href: '/category/pendants-men' },
      { label: 'Earrings',    href: '/category/earrings-men' },
    ],
  },
  { label: 'New Arrivals', href: '/products?badge=new' },
  { label: 'Sale',         href: '/products?filter=sale' },
];

export default function Header() {
  const { count }    = useCart();
  const { items: wishItems } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav,  setActiveNav]  = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu */}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="font-serif text-2xl font-bold text-black tracking-widest">
              MANIRA
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV.map(item => (
                <div key={item.label} className="relative group"
                  onMouseEnter={() => setActiveNav(item.label)}
                  onMouseLeave={() => setActiveNav(null)}>
                  <Link href={item.href}
                    className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gold transition-colors py-5">
                    {item.label}
                    {item.sub && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}
                  </Link>
                  {item.sub && activeNav === item.label && (
                    <div className="absolute top-full left-0 bg-white border border-gray-100 shadow-lg min-w-[180px] py-2 z-50">
                      {item.sub.map(s => (
                        <Link key={s.label} href={s.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-cream hover:text-gold transition-colors">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <button onClick={() => setSearchOpen(s => !s)} className="p-1 text-gray-700 hover:text-gold transition-colors">
                <Search size={20} />
              </button>
              <Link href="/wishlist" className="relative p-1 text-gray-700 hover:text-gold transition-colors">
                <Heart size={20} />
                {wishItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishItems.length}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative p-1 text-gray-700 hover:text-gold transition-colors">
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="p-1 text-gray-700 hover:text-gold transition-colors">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full hidden group-hover:block bg-white border border-gray-100 shadow-lg min-w-[160px] py-2 z-50">
                    <p className="px-4 py-2 text-xs text-gray-500 border-b">{user?.name}</p>
                    <Link href="/profile"   className="block px-4 py-2 text-sm hover:bg-cream">My Account</Link>
                    <Link href="/orders"    className="block px-4 py-2 text-sm hover:bg-cream">My Orders</Link>
                    <Link href="/wishlist"  className="block px-4 py-2 text-sm hover:bg-cream">Wishlist</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-cream">Logout</button>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="p-1 text-gray-700 hover:text-gold transition-colors">
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t bg-white px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="Search for jewellery..."
                className="flex-1 border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-gold" />
              <button type="submit" className="bg-gold text-white px-5 py-2 text-sm font-semibold hover:bg-gold-dark transition-colors">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-serif text-xl font-bold">MANIRA</span>
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <nav className="p-4 space-y-1">
              {NAV.map(item => (
                <div key={item.label}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)}
                    className="block py-2.5 text-sm font-semibold text-gray-800 border-b border-gray-100">
                    {item.label}
                  </Link>
                  {item.sub && (
                    <div className="pl-4 space-y-1 mt-1 mb-2">
                      {item.sub.map(s => (
                        <Link key={s.label} href={s.href} onClick={() => setMobileOpen(false)}
                          className="block py-1.5 text-sm text-gray-600 hover:text-gold">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
