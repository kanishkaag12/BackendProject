import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user session already exists in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password, role = 'user') => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user: userData, accessToken, refreshToken } = response.data.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setLoading(false);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, refreshToken } = response.data.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setLoading(false);
      return userData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
