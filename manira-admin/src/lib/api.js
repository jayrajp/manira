import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5000/api/admin';

const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mnr_admin_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mnr_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const formatPrice  = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const formatDate   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const getStatusColor = (s) => ({
  active: 'badge-active', inactive: 'badge-inactive', draft: 'badge-inactive',
  processing: 'badge-pending', confirmed: 'badge-active', shipped: 'badge-active',
  delivered: 'badge-active', cancelled: 'badge-inactive', pending: 'badge-pending',
  paid: 'badge-active', failed: 'bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full',
}[s] || 'badge-inactive');
