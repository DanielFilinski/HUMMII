/**
 * ХУК ДЛЯ УПРАВЛЕНИЯ ТЕМОЙ
 * 
 * Этот хук управляет переключением между светлой и тёмной темой.
 * Сохраняет выбор пользователя в localStorage и применяет класс к <html>.
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * import { useTheme } from '@/hooks/useTheme';
 * 
 * const { theme, setTheme, toggleTheme } = useTheme();
 */

'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Определяем системную тему
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Применяем тему к DOM
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const html = document.documentElement;
    const effectiveTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    
    // Убираем все классы тем
    html.classList.remove('light', 'dark');
    
    // Добавляем нужный класс
    html.classList.add(effectiveTheme);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  };

  // Инициализация темы при монтировании
  useEffect(() => {
    setMounted(true);
    
    // Читаем сохранённую тему из localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // По умолчанию используем системную тему
        setThemeState('system');
        applyTheme('system');
      }
    } catch (error) {
      console.error('Failed to read theme from localStorage:', error);
      setThemeState('system');
      applyTheme('system');
    }
  }, []);

  // Слушаем изменения системной темы
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme('system');
    };

    // Современные браузеры
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mounted, theme]);

  // Изменение темы
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Переключение между светлой и тёмной темой
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Получение текущей эффективной темы (без 'system')
  const getEffectiveTheme = (): 'light' | 'dark' => {
    return theme === 'system' ? getSystemTheme() : theme;
  };

  return {
    theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme,
    toggleTheme,
    mounted, // Полезно для избежания flash of unstyled content
  };
}
