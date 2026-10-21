'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import {
  apiRequest,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
} from '@/lib/api';

interface AuthResponse {
  status: string;
  message?: string;
  token: string;
  user: UserProfile;
}

interface MeResponse {
  status: string;
  user: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: 'owner' | 'member' | 'trainee') => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'owner' | 'member' | 'trainee') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session from stored JWT and verify with backend
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const token = getAuthToken();
      const cachedUser = getStoredUser();

      if (cachedUser && isMounted) {
        setUser(cachedUser);
        setLoading(false);
      }

      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest<MeResponse>('/auth/me');
        if (isMounted && data.user) {
          setUser(data.user);
          setStoredUser(data.user);
        }
      } catch (err: any) {
        // بنفحص إذا الخطأ هو فعلا انتهاء الصلاحية أو غير مصرح (401 / 403) عشان ما نطرد المستخدم إذا النت قطع لحظيا
        const isAuthError =
          err?.status === 401 ||
          err?.status === 403 ||
          err?.message?.toLowerCase().includes('unauthorized') ||
          err?.message?.toLowerCase().includes('invalid token') ||
          err?.message?.toLowerCase().includes('token expired');

        if (isAuthError) {
          console.warn('[TaskFlow Auth] Session expired or invalid, clearing credentials:', err);
          removeAuthToken();
          setStoredUser(null);
          if (isMounted) setUser(null);
        } else {
          // إذا انقطاع شبكة أو السيرفر بعمل إعادة تشغيل، بنحافظ على جلسة المستخدم من الكاش
          console.info('[TaskFlow Auth] Network or server transient glitch, preserving cached session');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });

      setAuthToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'owner' | 'member' | 'trainee' = 'owner'
  ): Promise<void> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (pass.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          displayName: name.trim(),
          email: cleanEmail,
          password: pass,
          role,
        }),
      });

      setAuthToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      removeAuthToken();
      setStoredUser(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: 'owner' | 'member' | 'trainee'): Promise<void> => {
    const email =
      role === 'owner'
        ? 'owner@taqat-gaza.com'
        : role === 'member'
        ? 'member@taqat-gaza.com'
        : 'trainee@taqat-gaza.com';
    const pass = 'password123';
    await login(email, pass);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
