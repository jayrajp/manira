'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import api, { formatDate } from '@/lib/api';
import { Search, Mail, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [messages, setMessages] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [read,     setRead]     = useState('all');
  const [page,     setPage]     = useState(1);
  const [expanded, setExpanded] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search)         params.set('search', search);
      if (read !== 'all') params.set('isRead', read);
      const res = await api.get(`/contacts?${params}`);
      setMessages(res.data?.messages || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Failed to load messages'); }
    setLoading(false);
  }, [search, read, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (id) => {
    try {
      await api.patch(`/contacts/${id}`, { isRead: true });
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Message deleted');
      fetchMessages();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExpand = (id) => {
    setExpanded(e => e === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.isRead) markRead(id);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout title="Messages">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search messages..."
            className="input pl-9 w-64 text-sm py-2" />
        </div>
        <select value={read} onChange={e => { setRead(e.target.value); setPage(1); }}
          className="input w-36 text-sm py-2">
          <option value="all">All Messages</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <p className="ml-auto text-xs text-gray-500">{total} messages</p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <Mail size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {messages.map(m => (
              <div key={m.id} className={`transition-colors ${!m.isRead ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50" onClick={() => handleExpand(m.id)}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!m.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm ${!m.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{m.name}</p>
                      <span className="text-[10px] text-gray-400">{m.email}</span>
                      {m.phone && <span className="text-[10px] text-gray-400">{m.phone}</span>}
                      {m.subject && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.subject}</span>}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${expanded === m.id ? 'whitespace-normal' : ''} ${!m.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {m.message}
                    </p>
                    {expanded === m.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{formatDate(m.createdAt)}</span>
                    {m.isRead && <CheckCircle size={14} className="text-green-400" />}
                    <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{total} messages</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <span className="px-3 py-1.5 text-xs bg-gold text-white rounded-lg">Page {page}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
