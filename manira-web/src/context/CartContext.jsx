'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'LOAD': return payload;
    case 'ADD_ITEM': {
      const key = i => `${i.id}_${i.variant || ''}_${i.size || ''}`;
      const existing = state.find(i => key(i) === key(payload));
      if (existing) return state.map(i => key(i) === key(payload) ? { ...i, qty: i.qty + (payload.qty || 1) } : i);
      return [...state, { ...payload, qty: payload.qty || 1 }];
    }
    case 'UPDATE_QTY': {
      const key = i => `${i.id}_${i.variant || ''}_${i.size || ''}`;
      return payload.qty <= 0
        ? state.filter(i => key(i) !== key(payload))
        : state.map(i => key(i) === key(payload) ? { ...i, qty: payload.qty } : i);
    }
    case 'REMOVE': {
      const key = i => `${i.id}_${i.variant || ''}_${i.size || ''}`;
      return state.filter(i => key(i) !== key(payload));
    }
    case 'CLEAR': return [];
    default: return state;
  }
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    try { dispatch({ type: 'LOAD', payload: JSON.parse(localStorage.getItem('mnr_cart') || '[]') }); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('mnr_cart', JSON.stringify(items));
  }, [items]);

  const total    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count    = items.reduce((s, i) => s + i.qty, 0);
  const shipping = total >= 999 ? 0 : 99;

  return (
    <CartContext.Provider value={{ items, dispatch, total, count, shipping }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
