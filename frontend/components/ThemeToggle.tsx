/**
 * КОМПОНЕНТ ПЕРЕКЛЮЧАТЕЛЯ ТЕМЫ
 * 
 * Простая кнопка для переключения между светлой и тёмной темой.
 * Показывает иконку солнца/луны в зависимости от текущей темы.
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * import { ThemeToggle } from '@/components/ThemeToggle';
 * <ThemeToggle />
 */

'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, effectiveTheme, toggleTheme, mounted } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Избегаем гидратации SSR/CSR несоответствия
  if (!isClient || !mounted) {
    return (
      <button
        className="btn-secondary w-12 h-12 p-0 flex items-center justify-center"
        disabled
        aria-label="Переключить тему"
      >
        <span className="text-xl">⚙️</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary w-12 h-12 p-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      aria-label={`Переключить на ${effectiveTheme === 'dark' ? 'светлую' : 'тёмную'} тему`}
      title={`Текущая тема: ${effectiveTheme === 'dark' ? 'Тёмная' : 'Светлая'}`}
    >
      {effectiveTheme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * КОМПОНЕНТ ВЫБОРА ТЕМЫ (с тремя опциями)
 * 
 * Расширенный компонент с выбором между светлой, тёмной и системной темой.
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * import { ThemeSelector } from '@/components/ThemeToggle';
 * <ThemeSelector />
 */
export function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !mounted) {
    return (
      <div className="flex gap-2 rounded-lg border border-border-primary p-1 bg-background-card">
        <button className="btn-secondary px-4 py-2" disabled>
          Загрузка...
        </button>
      </div>
    );
  }

  const themes: Array<{ value: typeof theme; label: string; icon: string }> = [
    { value: 'light', label: 'Светлая', icon: '☀️' },
    { value: 'dark', label: 'Тёмная', icon: '🌙' },
    { value: 'system', label: 'Авто', icon: '💻' },
  ];

  return (
    <div className="flex gap-2 rounded-lg border border-border-primary p-1 bg-background-card">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${
              theme === t.value
                ? 'bg-accent-primary text-text-inverse shadow-md'
                : 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }
          `}
          aria-label={`Переключить на ${t.label.toLowerCase()} тему`}
          aria-pressed={theme === t.value}
        >
          <span className="mr-2">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/**
 * КОМПАКТНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (только иконки)
 * 
 * Минималистичный вариант с тремя иконками для быстрого переключения.
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * import { CompactThemeToggle } from '@/components/ThemeToggle';
 * <CompactThemeToggle />
 */
export function CompactThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !mounted) {
    return (
      <div className="flex gap-1 rounded-lg border border-border-primary p-1 bg-background-card">
        <button className="w-10 h-10 rounded flex items-center justify-center" disabled>
          ⚙️
        </button>
      </div>
    );
  }

  const themes: Array<{ value: typeof theme; icon: JSX.Element; label: string }> = [
    {
      value: 'light',
      label: 'Светлая тема',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Тёмная тема',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'Системная тема',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-1 rounded-lg border border-border-primary p-1 bg-background-card">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`
            w-10 h-10 rounded flex items-center justify-center transition-all duration-200
            ${
              theme === t.value
                ? 'bg-accent-primary text-text-inverse shadow-md'
                : 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }
          `}
          aria-label={t.label}
          aria-pressed={theme === t.value}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
