'use client';

// سياق المصادقة - إدارة حالة تسجيل الدخول

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '@/lib/types';

interface AuthContextType {
  user: Employee | null;
  setUser: (user: Employee | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود مستخدم محفوظ في localStorage
    const savedUser = localStorage.getItem('taskmanagar_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('taskmanagar_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (newUser: Employee | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('taskmanagar_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('taskmanagar_user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskmanagar_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, isLoading, logout }}>
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
