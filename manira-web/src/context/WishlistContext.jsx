'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '@/lib/api';

const WishlistContext = createContext(null);

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOAD':   return payload;
    case 'TOGGLE': {
      const exists = state.find(i => i.id === payload.id);
      return exists ? state.filter(i => i.id !== payload.id) : [...state, payload];
    }
    case 'CLEAR': return [];
    default: return state;
  }
};

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    const token = localStorage.getItem('mnr_token');
    if (token) {
      api.get('/wishlist').then(r => dispatch({ type: 'LOAD', payload: r.data || [] })).catch(() => {});
    }
  }, []);

  const isWishlisted = (id) => items.some(i => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, dispatch, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
