'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mnr_admin');
    const token  = localStorage.getItem('mnr_admin_token');
    if (stored && token) { try { setAdmin(JSON.parse(stored)); } catch {} }
    setLoading(false);
  }, []);

  const login  = (data, token) => { setAdmin(data); localStorage.setItem('mnr_admin', JSON.stringify(data)); localStorage.setItem('mnr_admin_token', token); };
  const logout = () => { setAdmin(null); localStorage.removeItem('mnr_admin'); localStorage.removeItem('mnr_admin_token'); };

  return (
    <AuthContext.Provider value={{ admin, loading, isLoggedIn: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
