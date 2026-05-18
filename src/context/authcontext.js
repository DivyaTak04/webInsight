// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // checking stored token on startup

  // On app load: check if a token exists and validate it
  useEffect(() => {
    const token = localStorage.getItem('wi_token');
    if (token) {
      authAPI.me()
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem('wi_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('wi_token', res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password);
    localStorage.setItem('wi_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('wi_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};