import type { Config } from 'tailwindcss';

/**
 * DESIGN SYSTEM: COLOR PALETTES
 * 
 * Система цветов для светлой и тёмной темы.
 * Используйте CSS-переменные для автоматического переключения тем.
 * 
 * ПРАВИЛА ИСПОЛЬЗОВАНИЯ:
 * 1. ВСЕГДА используйте семантические названия (background, text, accent)
 * 2. НЕ используйте прямые цвета в компонентах (#FFFFFF, #000000)
 * 3. Используйте var(--*) или Tailwind-классы (bg-background, text-primary)
 * 4. Для добавления новой темы: добавьте palette в colorPalettes и CSS-переменные
 * 
 * ПРИМЕРЫ:
 * ✅ ПРАВИЛЬНО:
 *   <div className="bg-background text-primary">
 *   <div style={{ backgroundColor: 'var(--background-primary)' }}>
 * 
 * ❌ НЕПРАВИЛЬНО:
 *   <div className="bg-white text-black">
 *   <div style={{ backgroundColor: '#FFFFFF' }}>
 */

// Палитра для светлой темы (Light Mode)
const lightPalette = {
  background: {
    primary: '#FFFFFF',           // Основной фон
    secondary: '#E1F7DB',         // Вторичный фон (светло-зелёный)
    tertiary: '#F6FBF7',          // Третичный фон (очень светлый)
    card: '#FFFFFF',              // Фон карточек
    overlay: 'rgba(22, 22, 14, 0.7)', // Оверлей для модалок
    gradient: {
      main: 'linear-gradient(to top, #CDF2C2, #FCFFFD)',
      card: 'linear-gradient(to bottom, #DDF8D4, #F9D5B7)',
      banner: 'linear-gradient(to bottom, #FFFDE9, #D7FAD6)',
    },
  },
  text: {
    primary: '#2A2A0F',           // Основной текст (тёмный)
    secondary: '#819082',         // Вторичный текст (серый)
    tertiary: '#96A996',          // Третичный/Unfocused текст
    inverse: '#FFFFFF',           // Инверсный текст (белый на тёмном)
    disabled: '#DBDBDB',          // Отключённый текст
    link: '#3A971E',              // Ссылки
  },
  accent: {
    primary: '#3A971E',           // Основной акцент (зелёный)
    secondary: '#67AD51',         // Вторичный акцент (светло-зелёный)
    tertiary: '#AAC89A',          // Третичный акцент / Disabled
    hover: '#2d7516',             // Hover-состояние
    active: '#245d0f',            // Active-состояние
  },
  feedback: {
    error: '#B52F2F',             // Ошибка (красный)
    success: '#3A971E',           // Успех (зелёный)
    warning: '#F59E0B',           // Предупреждение (жёлтый)
    info: '#3B82F6',              // Информация (синий)
    attention: '#F13A0C',         // Внимание (оранжевый)
  },
  border: {
    primary: '#E5E7EB',           // Основная граница
    secondary: '#D1D5DB',         // Вторичная граница
    focus: '#3A971E',             // Граница при фокусе
    error: '#B52F2F',             // Граница при ошибке
  },
  surface: {
    elevated: '#FFFFFF',          // Приподнятые поверхности
    sunken: '#F9FAFB',            // Утопленные поверхности
    hover: '#F3F4F6',             // Hover-состояние
    pressed: '#E5E7EB',           // Pressed-состояние
  },
};

// Палитра для тёмной темы (Dark Mode)
const darkPalette = {
  background: {
    primary: '#0F1419',           // Основной фон
    secondary: '#1A2028',         // Вторичный фон
    tertiary: '#232B36',          // Третичный фон
    card: '#1A2028',              // Фон карточек
    overlay: 'rgba(15, 20, 25, 0.85)', // Оверлей для модалок
    gradient: {
      main: 'linear-gradient(to top, #1A2028, #0F1419)',
      card: 'linear-gradient(to bottom, #232B36, #1A2028)',
      banner: 'linear-gradient(to bottom, #2A3441, #1A2028)',
    },
  },
  text: {
    primary: '#F9FAFB',           // Основной текст (светлый)
    secondary: '#9CA3AF',         // Вторичный текст (серый)
    tertiary: '#6B7280',          // Третичный/Unfocused текст
    inverse: '#0F1419',           // Инверсный текст (тёмный на светлом)
    disabled: '#4B5563',          // Отключённый текст
    link: '#67AD51',              // Ссылки
  },
  accent: {
    primary: '#67AD51',           // Основной акцент (зелёный)
    secondary: '#86C06E',         // Вторичный акцент (светло-зелёный)
    tertiary: '#5A8D47',          // Третичный акцент
    hover: '#7DBD62',             // Hover-состояние
    active: '#8FCC78',            // Active-состояние
  },
  feedback: {
    error: '#EF4444',             // Ошибка (красный)
    success: '#67AD51',           // Успех (зелёный)
    warning: '#FBBF24',           // Предупреждение (жёлтый)
    info: '#60A5FA',              // Информация (синий)
    attention: '#FB923C',         // Внимание (оранжевый)
  },
  border: {
    primary: '#374151',           // Основная граница
    secondary: '#4B5563',         // Вторичная граница
    focus: '#67AD51',             // Граница при фокусе
    error: '#EF4444',             // Граница при ошибке
  },
  surface: {
    elevated: '#232B36',          // Приподнятые поверхности
    sunken: '#0F1419',            // Утопленные поверхности
    hover: '#2A3441',             // Hover-состояние
    pressed: '#1F2937',           // Pressed-состояние
  },
};

/**
 * Экспорт палитр для использования вне Tailwind
 * Используйте для генерации CSS-переменных или темизации
 */
export const colorPalettes = {
  light: lightPalette,
  dark: darkPalette,
};

const config: Config = {
  darkMode: 'class', // Включаем поддержку тёмной темы через класс .dark
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Custom responsive breakpoints
    screens: {
      'sm': { 'min': '640px', 'max': '767px' },
      'md': { 'min': '768px', 'max': '1023px' },
      'lg': { 'min': '1024px', 'max': '1279px' },
      'xl': { 'min': '1280px', 'max': '1535px' },
      '2xl': { 'min': '1536px' },
      // Mobile-first helpers
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
    },
    extend: {
      /**
       * ЦВЕТА ДИЗАЙН-СИСТЕМЫ
       * Используют CSS-переменные для автоматического переключения тем
       */
      colors: {
        // Фоны
        background: {
          DEFAULT: 'var(--color-background-primary)',
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          card: 'var(--color-background-card)',
          overlay: 'var(--color-background-overlay)',
        },
        // Текст
        text: {
          DEFAULT: 'var(--color-text-primary)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          disabled: 'var(--color-text-disabled)',
          link: 'var(--color-text-link)',
        },
        // Акценты
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          tertiary: 'var(--color-accent-tertiary)',
          hover: 'var(--color-accent-hover)',
          active: 'var(--color-accent-active)',
        },
        // Обратная связь (статусы)
        feedback: {
          error: 'var(--color-feedback-error)',
          success: 'var(--color-feedback-success)',
          warning: 'var(--color-feedback-warning)',
          info: 'var(--color-feedback-info)',
          attention: 'var(--color-feedback-attention)',
        },
        // Границы
        border: {
          DEFAULT: 'var(--color-border-primary)',
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          focus: 'var(--color-border-focus)',
          error: 'var(--color-border-error)',
        },
        // Поверхности (карточки, модалки)
        surface: {
          elevated: 'var(--color-surface-elevated)',
          sunken: 'var(--color-surface-sunken)',
          hover: 'var(--color-surface-hover)',
          pressed: 'var(--color-surface-pressed)',
        },
      },
      /**
       * ГРАДИЕНТЫ
       */
      backgroundImage: {
        'gradient-main': 'var(--gradient-main)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-banner': 'var(--gradient-banner)',
      },
      /**
       * ГРАДИЕНТЫ
       */
      backgroundImage: {
        'gradient-main': 'var(--gradient-main)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-banner': 'var(--gradient-banner)',
      },
      /**
       * ТИПОГРАФИКА
       */
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      /**
       * ТЕНИ
       * Используйте семантические названия, а не размеры
       */
      boxShadow: {
        'sm': '0px 0.5px 9px 0px rgba(0, 0, 0, 0.07)',
        'DEFAULT': '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
        'md': '0px 4px 8px 0px rgba(0, 0, 0, 0.12)',
        'lg': '0px 8px 16px 0px rgba(0, 0, 0, 0.15)',
        'xl': '0px 12px 24px 0px rgba(0, 0, 0, 0.18)',
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'focus': 'var(--shadow-focus)',
      },
      /**
       * СКРУГЛЕНИЯ
       */
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      // Responsive spacing scale
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '88': '22rem',    // 352px
        '100': '25rem',   // 400px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
      },
      // Responsive container max widths
      maxWidth: {
        'xs': '20rem',    // 320px
        'sm': '24rem',    // 384px
        'md': '28rem',    // 448px
        'lg': '32rem',    // 512px
        'xl': '36rem',    // 576px
        '2xl': '42rem',   // 672px
        '3xl': '48rem',   // 768px
        '4xl': '56rem',   // 896px
        '5xl': '64rem',   // 1024px
        '6xl': '72rem',   // 1152px
        '7xl': '80rem',   // 1280px
        'full': '100%',
      },
      /**
       * РАЗМЕРЫ ШРИФТОВ
       * Используйте семантические названия для разных устройств
       */
      fontSize: {
        // Базовые размеры
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
        '8xl': ['6rem', { lineHeight: '1' }],          // 96px
        '9xl': ['8rem', { lineHeight: '1' }],          // 128px
        
        // Desktop typography
        'desktop-h1': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'desktop-h2': ['24px', { lineHeight: '30px', fontWeight: '600' }],
        'desktop-h3': ['20px', { lineHeight: '24px', fontWeight: '500' }],
        'desktop-body': ['20px', { lineHeight: '32px', fontWeight: '400' }],
        'desktop-body-sm': ['16px', { lineHeight: '20px', fontWeight: '400' }],
        'desktop-tag': ['16px', { lineHeight: '20px', fontWeight: '800' }],
        'desktop-note': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        
        // Tablet typography
        'tablet-h1': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'tablet-h2': ['24px', { lineHeight: '30px', fontWeight: '600' }],
        'tablet-h3': ['20px', { lineHeight: '24px', fontWeight: '500' }],
        'tablet-body': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'tablet-body-sm': ['16px', { lineHeight: '20px', fontWeight: '400' }],
        'tablet-tag': ['16px', { lineHeight: '20px', fontWeight: '800' }],
        'tablet-note': ['16px', { lineHeight: '20px', fontWeight: '400' }],
        
        // Mobile typography
        'mobile-h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'mobile-h2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'mobile-h3': ['18px', { lineHeight: '22px', fontWeight: '500' }],
        'mobile-body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'mobile-body-sm': ['14px', { lineHeight: '18px', fontWeight: '400' }],
        'mobile-tag': ['14px', { lineHeight: '18px', fontWeight: '800' }],
        'mobile-note': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      /**
       * ВЕСА ШРИФТОВ
       */
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      /**
       * ВЕСА ШРИФТОВ
       */
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      /**
       * АНИМАЦИИ
       */
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.2s ease-out',
        slideInFromLeft: 'slideInFromLeft 0.3s ease-out',
        slideInFromRight: 'slideInFromRight 0.3s ease-out',
        fadeIn: 'fadeIn 0.2s ease-in',
        fadeOut: 'fadeOut 0.2s ease-out',
        gradient: 'gradient 3s ease infinite',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      /**
       * ПЕРЕХОДЫ
       */
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'ease-in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-smooth': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-smooth': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

