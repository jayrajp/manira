'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loginModal, setLoginModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mnr_user');
    const token  = localStorage.getItem('mnr_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    setUser(userData);
    localStorage.setItem('mnr_user',  JSON.stringify(userData));
    localStorage.setItem('mnr_token', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mnr_user');
    localStorage.removeItem('mnr_token');
    api.post('/auth/logout').catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, isLoggedIn: !!user,
      login, logout,
      loginModal, openLoginModal: () => setLoginModal(true), closeLoginModal: () => setLoginModal(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
