// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

// Only persist these known-safe fields — prevents stale/corrupt data
const sanitize = (raw) => {
  if (!raw) return null;
  const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
  // Only keep allowed fields and ensure phone is a real phone (not an email)
  const phone = obj.phone;
  const safePhone = phone && !phone.includes('@') ? phone : '';
  return {
    email    : obj.email    || '',
    fullName : obj.fullName || '',
    role     : obj.role     || '',
    userId   : obj.userId   || null,
    phone    : safePhone,
  };
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore session from localStorage (sanitized)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(sanitize(savedUser));
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (formData) => {
    const response = await axiosInstance.post('/auth/register', formData);
    const { token, email, fullName, role, userId, phone } = response.data;
    saveSession(token, { email, fullName, role, userId, phone: phone || '' });
    return response.data;
  };

  // Login
  const login = async (formData) => {
    const response = await axiosInstance.post('/auth/login', formData);
    const { token, email, fullName, role, userId, phone } = response.data;
    saveSession(token, { email, fullName, role, userId, phone: phone || '' });
    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Call this after profile update to keep context in sync
  const updateUser = (updates) => {
    setUser(prev => {
      const updated = sanitize({ ...prev, ...updates });
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // Save to state + localStorage
  const saveSession = useCallback((jwtToken, userData) => {
    const safe = sanitize(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(safe));
    setToken(jwtToken);
    setUser(safe);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout, updateUser, saveSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
