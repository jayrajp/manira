'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Megaphone,
  Image, Ticket, Star, Settings, LogOut, Menu, X, Layers,
  BarChart2, MessageSquare, ChevronRight, Gem
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Products',     href: '/products',     icon: Package },
  { label: 'Orders',       href: '/orders',       icon: ShoppingCart },
  { label: 'Customers',    href: '/customers',    icon: Users },
  { label: 'Inventory',    href: '/inventory',    icon: Layers },
  { label: 'Categories',   href: '/categories',   icon: Tag },
  { label: 'Collections',  href: '/collections',  icon: Gem },
  { label: 'Banners',      href: '/banners',      icon: Image },
  { label: 'Coupons',      href: '/coupons',      icon: Ticket },
  { label: 'Reviews',      href: '/reviews',      icon: Star },
  { label: 'Announcements',href: '/announcements',icon: Megaphone },
  { label: 'Reports',      href: '/reports',      icon: BarChart2 },
  { label: 'Messages',     href: '/contacts',     icon: MessageSquare },
  { label: 'Settings',     href: '/settings',     icon: Settings },
];

export default function AdminLayout({ children, title }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { admin, logout, isLoggedIn, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push('/login');
  }, [loading, isLoggedIn, router]);

  if (loading || !isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
    </div>
  );

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-sidebar flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <div>
            <h1 className="text-white font-bold text-lg tracking-widest">MANIRA</h1>
            <p className="text-gold text-[10px] tracking-widest uppercase">Admin</p>
          </div>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                  active ? 'bg-gold text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-sm font-bold">
              {(admin?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{admin?.name}</p>
              <p className="text-gray-400 text-[10px] truncate">{admin?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1 text-gray-600" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          </div>
          <div className="text-sm text-gray-500">
            Welcome, <span className="font-semibold text-gray-800">{admin?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
