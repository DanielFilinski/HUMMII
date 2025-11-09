'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { message } from 'antd';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (credentials: { email: string; password: string; code?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Проверяем токен при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('accessToken');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUser(userData);
        } else {
          throw new Error('Token invalid');
        }
      } catch (error) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const login = async (credentials: { email: string; password: string; code?: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setUser(data.user);
      
      // Перенаправляем на дашборд
      router.push('/admin/dashboard');
      message.success('Успешный вход в систему');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Ошибка аутентификации');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/admin/login');
      message.info('Выход из системы выполнен');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};