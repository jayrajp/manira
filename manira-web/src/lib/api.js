import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/user';

const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mnr_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mnr_token');
      localStorage.removeItem('mnr_user');
    }
    return Promise.reject(err);
  }
);

export default api;

export const formatPrice = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

export const getDiscount = (price, mrp) =>
  mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

export const normalizeProduct = (p) => ({
  ...p,
  price:         Number(p.price),
  mrp:           Number(p.mrp),
  rating:        Number(p.rating || 0),
  discount:      getDiscount(Number(p.price), Number(p.mrp)),
  images:        Array.isArray(p.images) ? p.images : (p.mainImage ? [p.mainImage] : []),
  variants:      Array.isArray(p.variants) ? p.variants : [],
  sizes:         Array.isArray(p.sizes)    ? p.sizes    : [],
  inStock:       p.status !== 'out_of_stock' && (p.stock ?? 1) > 0,
});
