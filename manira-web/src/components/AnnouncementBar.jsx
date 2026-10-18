'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AnnouncementBar() {
  const [items, setItems] = useState([
    { id: 1, emoji: '🚚', text: 'Free Shipping on orders above ₹999' },
    { id: 2, emoji: '✨', text: 'Trendy Imitation Jewellery for Women & Men' },
    { id: 3, emoji: '🎁', text: 'Gift Wrapping Available on all orders' },
    { id: 4, emoji: '↩️', text: '15-Day Easy Returns' },
  ]);

  useEffect(() => {
    api.get('/announcements').then(r => { if (r.data?.length) setItems(r.data); }).catch(() => {});
  }, []);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [items.length]);

  const item = items[idx];
  return (
    <div className="bg-black text-white text-xs text-center py-2 px-4 tracking-wide">
      {item?.emoji} {item?.text}
    </div>
  );
}
