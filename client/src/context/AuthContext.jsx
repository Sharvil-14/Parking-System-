import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('vpms_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          // Only clear the token if the server explicitly rejected it (401).
          // Network errors (server down, timeout) should NOT wipe a potentially
          // valid token — the user can retry once the server is back.
          if (err.response && err.response.status === 401) {
            console.error('Token is invalid or expired — clearing session');
            localStorage.removeItem('vpms_token');
            setUser(null);
          } else {
            console.warn('Could not verify session (server may be unavailable):', err.message);
            // Keep the token in localStorage so subsequent API calls still work
            // once the server recovers. Do not set user — they'll need to reload
            // or the next API call will re-verify naturally.
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Listen for 401 auth expiry events from the API response interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('vpms_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('vpms_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('vpms_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    localStorage.setItem('vpms_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('vpms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'Admin', isOperator: user?.role === 'Operator', isCustomer: user?.role === 'Customer' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
