import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  requestOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string; devOtp?: string }>;
  verifyAndRegister: (data: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateUserLocal: (updated: Partial<User>) => void;
  switchDemoUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cf_access_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (!localStorage.getItem('cf_access_token')) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (e) {
      console.warn('Failed to load active profile session');
      localStorage.removeItem('cf_access_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const requestOtp = async (email: string) => {
    const res = await api.post('/auth/request-otp', { email });
    return res.data;
  };

  const verifyAndRegister = async (data: any) => {
    const res = await api.post('/auth/verify-otp', data);
    if (res.data.success) {
      localStorage.setItem('cf_access_token', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res.data;
  };

  const loginWithOtp = async (email: string, otp: string) => {
    const res = await api.post('/auth/login', { email, otp });
    if (res.data.success) {
      localStorage.setItem('cf_access_token', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cf_access_token');
    setToken(null);
    setUser(null);
  };

  const updateUserLocal = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const switchDemoUser = async (email: string) => {
    setLoading(true);
    try {
      const otpRes = await api.post('/auth/request-otp', { email });
      const devOtp = otpRes.data.devOtp || '123456';
      await loginWithOtp(email, devOtp);
    } catch (err) {
      console.error('Demo user switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        requestOtp,
        verifyAndRegister,
        loginWithOtp,
        logout,
        updateUserLocal,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
