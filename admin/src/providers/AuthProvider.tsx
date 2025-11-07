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
      const token = Cookies.get('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        Cookies.remove('admin_token');
        setIsAuthenticated(false);
        setUser(null);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const login = async (credentials: { email: string; password: string; code?: string }) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setUser(data.user);
      
      // Перенаправляем на дашборд
      router.push('/admin/dashboard');
      message.success('Успешный вход в систему');
    } catch (error) {
      message.error('Ошибка аутентификации');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      Cookies.remove('admin_token');
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