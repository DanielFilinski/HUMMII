/**
 * DESIGN TOKENS - Единственный источник истины для дизайн-системы
 * 
 * Все цвета, типографика и другие токены определены здесь.
 * Используются в:
 * - tailwind.config.ts (для CSS-классов)
 * - Компонентах (для программного доступа)
 * 
 * ПРАВИЛА:
 * 1. Этот файл - единственное место для изменения токенов
 * 2. НЕ дублируйте значения в других файлах
 * 3. Импортируйте токены из этого файла везде
 */

// ============================================================================
// ЦВЕТОВЫЕ ПАЛИТРЫ
// ============================================================================

/**
 * Палитра для светлой темы (Light Mode)
 */
export const lightPalette = {
  background: {
    primary: '#FFFFFF',
    secondary: '#E1F7DB',
    tertiary: '#F6FBF7',
    card: '#FFFFFF',
    overlay: 'rgba(84, 84, 63, 0.7)',
    gradient: {
      main: 'linear-gradient(to top, #CDF2C2, #FCFFFD)',
      card: 'linear-gradient(to bottom, #DDF8D4, #F9D5B7)',
      banner: 'linear-gradient(to bottom, #FFFDE9, #D7FAD6)',
    },
  },
  text: {
    primary: '#2A2A0F',
    secondary: '#819082',
    tertiary: '#96A996',
    inverse: '#FFFFFF',
    disabled: '#DBDBDB',
    link: '#3A971E',
  },
  accent: {
    primary: '#3A971E',
    secondary: '#67AD51',
    tertiary: '#AAC89A',
    hover: '#2d7516',
    active: '#245d0f',
    disabled: '#AAC89A',
  },
  feedback: {
    error: '#B52F2F',
    success: '#3A971E',
    warning: '#F59E0B',
    info: '#3B82F6',
    attention: '#F13A0C',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#3A971E',
    error: '#B52F2F',
  },
  surface: {
    elevated: '#FFFFFF',
    sunken: '#F9FAFB',
    hover: '#F3F4F6',
    pressed: '#E5E7EB',
  },
} as const;

/**
 * Палитра для тёмной темы (Dark Mode)
 */
export const darkPalette = {
  background: {
    primary: '#0F1419',
    secondary: '#1A2028',
    tertiary: '#232B36',
    card: '#1A2028',
    overlay: 'rgba(15, 20, 25, 0.85)',
    gradient: {
      main: 'linear-gradient(to top, #1A2028, #0F1419)',
      card: 'linear-gradient(to bottom, #232B36, #1A2028)',
      banner: 'linear-gradient(to bottom, #2A3441, #1A2028)',
    },
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#0F1419',
    disabled: '#4B5563',
    link: '#67AD51',
  },
  accent: {
    primary: '#3A971E',
    secondary: '#67AD51',
    tertiary: '#AAC89A',
    hover: '#7DBD62',
    active: '#8FCC78',
    disabled: '#AAC89A',
  },
  feedback: {
    error: '#EF4444',
    success: '#67AD51',
    warning: '#FBBF24',
    info: '#60A5FA',
    attention: '#FB923C',
  },
  border: {
    primary: '#374151',
    secondary: '#4B5563',
    focus: '#67AD51',
    error: '#EF4444',
  },
  surface: {
    elevated: '#232B36',
    sunken: '#0F1419',
    hover: '#2A3441',
    pressed: '#1F2937',
  },
} as const;

/**
 * Экспорт палитр
 */
export const colorPalettes = {
  light: lightPalette,
  dark: darkPalette,
} as const;

// ============================================================================
// УПРОЩЁННЫЙ ДОСТУП К ЦВЕТАМ (для программного использования)
// ============================================================================

export const colors = {
  background: {
    1: lightPalette.background.primary,
    2: lightPalette.background.secondary,
    3: lightPalette.background.tertiary,
    overlay: lightPalette.background.overlay,
  },
  text: {
    primary: lightPalette.text.primary,
    secondary: lightPalette.text.secondary,
    unfocused: lightPalette.text.tertiary,
    inverse: lightPalette.text.inverse,
    disabled: lightPalette.text.disabled,
  },
  accent: {
    1: lightPalette.accent.primary,
    2: lightPalette.accent.secondary,
    disabled: lightPalette.accent.tertiary,
  },
  feedback: {
    error: lightPalette.feedback.error,
    attention: lightPalette.feedback.attention,
  },
} as const;

export const gradients = {
  main: lightPalette.background.gradient.main,
  card: lightPalette.background.gradient.card,
  banner: lightPalette.background.gradient.banner,
} as const;

// ============================================================================
// ТИПОГРАФИКА
// ============================================================================

/**
 * Базовые размеры шрифтов (стандартные Tailwind размеры)
 */
export const baseFontSizes = {
  xs: ['0.75rem', { lineHeight: '1rem' }] as [string, { lineHeight: string }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }] as [string, { lineHeight: string }],
  base: ['1rem', { lineHeight: '1.5rem' }] as [string, { lineHeight: string }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }] as [string, { lineHeight: string }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }] as [string, { lineHeight: string }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }] as [string, { lineHeight: string }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }] as [string, { lineHeight: string }],
  '5xl': ['3rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  '6xl': ['3.75rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  '7xl': ['4.5rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  '8xl': ['6rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
  '9xl': ['8rem', { lineHeight: '1' }] as [string, { lineHeight: string }],
} as const;

/**
 * Адаптивные размеры шрифтов для разных устройств
 */
export const fontSizes = {
  // Desktop
  desktop: {
    h1: ['36px', { lineHeight: '1.2', fontWeight: '700' }] as [string, { lineHeight: string; fontWeight: string }],
    h2: ['24px', { lineHeight: '30px', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    h3: ['20px', { lineHeight: '24px', fontWeight: '500' }] as [string, { lineHeight: string; fontWeight: string }],
    body: ['20px', { lineHeight: '32px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    bodySm: ['16px', { lineHeight: '20px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    tag: ['16px', { lineHeight: '20px', fontWeight: '800' }] as [string, { lineHeight: string; fontWeight: string }],
    note: ['14px', { lineHeight: '20px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
  },
  // Tablet
  tablet: {
    h1: ['30px', { lineHeight: '1.2', fontWeight: '700' }] as [string, { lineHeight: string; fontWeight: string }],
    h2: ['24px', { lineHeight: '30px', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    h3: ['20px', { lineHeight: '24px', fontWeight: '500' }] as [string, { lineHeight: string; fontWeight: string }],
    body: ['18px', { lineHeight: '28px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    bodySm: ['16px', { lineHeight: '20px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    tag: ['16px', { lineHeight: '20px', fontWeight: '800' }] as [string, { lineHeight: string; fontWeight: string }],
    note: ['16px', { lineHeight: '20px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
  },
  // Mobile
  mobile: {
    h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }] as [string, { lineHeight: string; fontWeight: string }],
    h2: ['22px', { lineHeight: '28px', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    h3: ['18px', { lineHeight: '22px', fontWeight: '500' }] as [string, { lineHeight: string; fontWeight: string }],
    body: ['16px', { lineHeight: '24px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    bodySm: ['14px', { lineHeight: '18px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    tag: ['14px', { lineHeight: '18px', fontWeight: '800' }] as [string, { lineHeight: string; fontWeight: string }],
    note: ['12px', { lineHeight: '16px', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
  },
} as const;

/**
 * Адаптивные классы типографики (для компонента Typography)
 */
export const typography = {
  h1: 'text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1',
  h2: 'text-mobile-h2 md:text-tablet-h2 lg:text-desktop-h2',
  h3: 'text-mobile-h3 md:text-tablet-h3 lg:text-desktop-h3',
  body: 'text-mobile-body md:text-tablet-body lg:text-desktop-body',
  bodySm: 'text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm',
  tag: 'text-mobile-tag md:text-tablet-tag lg:text-desktop-tag',
  note: 'text-mobile-note md:text-tablet-note lg:text-desktop-note',
} as const;

// ============================================================================
// SPACING SYSTEM (PADDING & MARGIN)
// ============================================================================

/**
 * Базовая система spacing для padding, margin и gap
 * Используется во всех компонентах для единообразия
 */
export const spacing = {
  0: '0px',      // 0px
  px: '1px',     // 1px border
  0.5: '2px',    // 2px
  1: '4px',      // 4px
  1.5: '6px',    // 6px
  2: '8px',      // 8px
  2.5: '10px',   // 10px
  3: '12px',     // 12px
  3.5: '14px',   // 14px
  4: '16px',     // 16px
  5: '20px',     // 20px
  6: '24px',     // 24px
  7: '28px',     // 28px
  8: '32px',     // 32px
  9: '36px',     // 36px
  10: '40px',    // 40px
  11: '44px',    // 44px
  12: '48px',    // 48px
  14: '56px',    // 56px
  16: '64px',    // 64px
  18: '72px',    // 72px
  20: '80px',    // 80px
  24: '96px',    // 96px
  28: '112px',   // 112px
  32: '128px',   // 128px
  36: '144px',   // 144px
  40: '160px',   // 160px
  44: '176px',   // 176px
  48: '192px',   // 192px
  52: '208px',   // 208px
  56: '224px',   // 224px
  60: '240px',   // 240px
  64: '256px',   // 256px
  72: '288px',   // 288px
  80: '320px',   // 320px
  96: '384px',   // 384px
} as const;

/**
 * Семантические spacing значения для компонентов
 */
export const componentSpacing = {
  // Внутренние отступы
  padding: {
    xs: spacing[2],     // 8px - минимальные отступы
    sm: spacing[3],     // 12px - маленькие отступы
    md: spacing[4],     // 16px - стандартные отступы
    lg: spacing[6],     // 24px - большие отступы
    xl: spacing[8],     // 32px - очень большие отступы
    '2xl': spacing[12], // 48px - максимальные отступы
  },
  // Внешние отступы
  margin: {
    xs: spacing[1],     // 4px - минимальные отступы
    sm: spacing[2],     // 8px - маленькие отступы
    md: spacing[4],     // 16px - стандартные отступы
    lg: spacing[6],     // 24px - большие отступы
    xl: spacing[8],     // 32px - очень большие отступы
    '2xl': spacing[12], // 48px - максимальные отступы
  },
  // Отступы между элементами (gap)
  gap: {
    xs: spacing[1],     // 4px
    sm: spacing[2],     // 8px
    md: spacing[3],     // 12px
    lg: spacing[4],     // 16px
    xl: spacing[6],     // 24px
    '2xl': spacing[8],  // 32px
  },
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

/**
 * Система радиусов скругления
 * Унифицированные значения для всех компонентов
 */
export const borderRadius = {
  none: '0px',       // Без скругления
  xs: '2px',         // Очень маленькое скругление
  sm: '4px',         // Маленькое скругление
  default: '6px',    // Стандартное скругление (изменено с 8px на 6px)
  md: '8px',         // Среднее скругление
  lg: '12px',        // Большое скругление
  xl: '16px',        // Очень большое скругление
  '2xl': '20px',     // Максимальное скругление
  '3xl': '24px',     // Экстра большое скругление
  full: '9999px',    // Полное скругление (круг/pill)
} as const;

/**
 * Семантические радиусы для компонентов
 */
export const componentBorderRadius = {
  button: {
    sm: borderRadius.sm,      // 4px - маленькие кнопки
    md: borderRadius.md,      // 8px - стандартные кнопки
    lg: borderRadius.lg,      // 12px - большие кнопки
    pill: borderRadius.full,  // Полное скругление для pill-кнопок
  },
  input: {
    default: borderRadius.md, // 8px - стандартные инпуты
    sm: borderRadius.sm,      // 4px - компактные инпуты
  },
  card: {
    sm: borderRadius.lg,      // 12px - маленькие карточки
    md: borderRadius.xl,      // 16px - стандартные карточки
    lg: borderRadius['2xl'],  // 20px - большие карточки
  },
  modal: {
    default: borderRadius['2xl'], // 20px - модальные окна
    lg: borderRadius['3xl'],      // 24px - большие модалки
  },
  avatar: {
    sm: borderRadius.sm,      // 4px - маленькие аватары
    md: borderRadius.md,      // 8px - средние аватары
    lg: borderRadius.lg,      // 12px - большие аватары
    full: borderRadius.full,  // Круглые аватары
  },
  badge: {
    default: borderRadius.full, // Полное скругление для бейджей
    square: borderRadius.sm,    // 4px - квадратные бейджи
  },
} as const;

// Shadow Tokens
export const shadows = {
  sm: '0px 0.5px 9px 0px rgba(0, 0, 0, 0.07)',
  default: '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
  md: '0px 4px 8px 0px rgba(0, 0, 0, 0.12)',
  lg: '0px 8px 16px 0px rgba(0, 0, 0, 0.15)',
} as const;

// Transition Tokens
export const transitions = {
  fast: '150ms ease-in-out',
  default: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

// Breakpoint values (for programmatic use)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Z-index Tokens
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

/**
 * Размеры иконок - стандартизированные значения для всех иконок
 */
export const iconSizes = {
  sm: 16,  // 16px
  md: 24,  // 24px
  lg: 32,  // 32px
  xl: 48,  // 48px
} as const;

// ============================================================================
// GRID SYSTEM
// ============================================================================

/**
 * Grid система для layout'ов
 */
export const gridSystem = {
  columns: 12,
  gutter: 24, // 24px
  containerMaxWidth: {
    xs: '20rem',    // 320px
    sm: '24rem',    // 384px
    md: '28rem',    // 448px
    lg: '32rem',    // 512px
    xl: '36rem',    // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
    full: '100%',
  },
} as const;

// ============================================================================
// OPACITY
// ============================================================================

/**
 * Значения прозрачности для различных состояний
 */
export const opacities = {
  disabled: 0.4,
  hover: 0.8,
  loading: 0.6,
  overlay: 0.7,
  subtle: 0.1,
  medium: 0.2,
} as const;

// ============================================================================
// FONT WEIGHTS
// ============================================================================

/**
 * Веса шрифтов
 */
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================

/**
 * Размеры для различных компонентов
 */
export const componentSizes = {
  button: {
    height: {
      xs: '24px',    // Очень маленькие кнопки
      sm: '32px',    // Маленькие кнопки
      md: '40px',    // Стандартные кнопки
      lg: '48px',    // Большие кнопки
      xl: '56px',    // Очень большие кнопки
    },
    padding: {
      xs: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      sm: `${spacing[2]} ${spacing[4]}`,  // 8px 16px
      md: `${spacing[3]} ${spacing[6]}`,  // 12px 24px
      lg: `${spacing[4]} ${spacing[8]}`,  // 16px 32px
      xl: `${spacing[5]} ${spacing[10]}`, // 20px 40px
    },
  },
  input: {
    height: {
      sm: '32px',    // Компактные инпуты
      md: '40px',    // Стандартные инпуты
      lg: '48px',    // Большие инпуты
    },
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,  // 8px 12px
      md: `${spacing[3]} ${spacing[4]}`,  // 12px 16px
      lg: `${spacing[4]} ${spacing[5]}`,  // 16px 20px
    },
  },
  avatar: {
    xs: '24px',    // Очень маленькие аватары
    sm: '32px',    // Маленькие аватары
    md: '40px',    // Стандартные аватары
    lg: '48px',    // Большие аватары
    xl: '64px',    // Очень большие аватары
    '2xl': '80px', // Максимальные аватары
  },
  icon: {
    xs: '12px',    // Очень маленькие иконки
    sm: '16px',    // Маленькие иконки
    md: '20px',    // Стандартные иконки
    lg: '24px',    // Большие иконки
    xl: '32px',    // Очень большие иконки
    '2xl': '40px', // Максимальные иконки
  },
} as const;

// ============================================================================
// RESPONSIVE SPACING
// ============================================================================

/**
 * Дополнительные spacing значения для адаптивных layout'ов
 */
export const responsiveSpacing = {
  14: '3.5rem',   // 56px
  18: '4.5rem',   // 72px
  22: '5.5rem',   // 88px
  26: '6.5rem',   // 104px
  30: '7.5rem',   // 120px
  88: '22rem',    // 352px
  100: '25rem',   // 400px
  112: '28rem',   // 448px
  128: '32rem',   // 512px
} as const;

/**
 * Адаптивные отступы для различных экранов
 */
export const responsivePadding = {
  container: {
    mobile: spacing[4],    // 16px - мобильные устройства
    tablet: spacing[6],    // 24px - планшеты
    desktop: spacing[8],   // 32px - десктоп
  },
  section: {
    mobile: spacing[8],    // 32px - между секциями на мобилке
    tablet: spacing[12],   // 48px - между секциями на планшете
    desktop: spacing[16],  // 64px - между секциями на десктопе
  },
  card: {
    mobile: spacing[4],    // 16px - внутри карточек на мобилке
    tablet: spacing[5],    // 20px - внутри карточек на планшете
    desktop: spacing[6],   // 24px - внутри карточек на десктопе
  },
} as const;

// ============================================================================
// EXTENDED SHADOWS
// ============================================================================

/**
 * Расширенные тени (включая именованные)
 */
export const extendedShadows = {
  ...shadows,
  xl: '0px 12px 24px 0px rgba(0, 0, 0, 0.18)',
  card: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  elevated: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(58, 151, 30, 0.3)',
} as const;

// ============================================================================
// TRANSITION DURATIONS
// ============================================================================

/**
 * Длительности переходов
 */
export const transitionDurations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

// ============================================================================
// TRANSITION TIMING FUNCTIONS
// ============================================================================

/**
 * Функции сглаживания для переходов
 */
export const transitionTimingFunctions = {
  'ease-in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-out-smooth': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-smooth': 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ============================================================================
// KEYFRAMES & ANIMATIONS
// ============================================================================

/**
 * Keyframes для анимаций
 */
export const keyframes = {
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
} as const;

/**
 * Анимации (keyframe + duration + timing)
 */
export const animations = {
  slideIn: 'slideIn 0.2s ease-out',
  slideInFromLeft: 'slideInFromLeft 0.3s ease-out',
  slideInFromRight: 'slideInFromRight 0.3s ease-out',
  fadeIn: 'fadeIn 0.2s ease-in',
  fadeOut: 'fadeOut 0.2s ease-out',
  gradient: 'gradient 3s ease infinite',
  shimmer: 'shimmer 2s linear infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const;

// ============================================================================
// LINE CLAMP
// ============================================================================

/**
 * Line clamp для усечения текста
 */
export const lineClamp = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
} as const;

// ============================================================================
// TYPESCRIPT NAMESPACE
// ============================================================================

/**
 * TypeScript namespace для программного доступа к токенам
 * Используйте для type-safe доступа к дизайн-токенам
 * 
 * @example
 * ```ts
 * import { DesignTokens } from '@/lib/design-tokens';
 * 
 * type PrimaryColor = DesignTokens.ColorPalette;
 * type SpacingKey = DesignTokens.Spacing;
 * type ButtonSize = DesignTokens.ComponentSize['button'];
 * ```
 */
export namespace DesignTokens {
  // Color types
  export type ColorPalette = typeof lightPalette;
  export type BackgroundColor = keyof typeof lightPalette.background;
  export type TextColor = keyof typeof lightPalette.text;
  export type AccentColor = keyof typeof lightPalette.accent;
  export type FeedbackColor = keyof typeof lightPalette.feedback;
  export type BorderColor = keyof typeof lightPalette.border;
  export type SurfaceColor = keyof typeof lightPalette.surface;
  
  // Typography types
  export type TypographyVariant = keyof typeof typography;
  export type FontSize = keyof typeof fontSizes.desktop;
  export type FontWeight = keyof typeof fontWeights;
  export type Breakpoint = keyof typeof fontSizes;
  
  // Spacing types
  export type Spacing = keyof typeof spacing;
  export type ComponentSpacing = typeof componentSpacing;
  export type ResponsiveSpacing = keyof typeof responsiveSpacing;
  export type ResponsivePadding = typeof responsivePadding;
  export type IconSize = keyof typeof iconSizes;
  
  // Component types
  export type ComponentSize = typeof componentSizes;
  export type ComponentBorderRadius = typeof componentBorderRadius;
  
  // Other types
  export type BorderRadius = keyof typeof borderRadius;
  export type Shadow = keyof typeof extendedShadows;
  export type Transition = keyof typeof transitions;
  export type TransitionDuration = keyof typeof transitionDurations;
  export type ZIndex = keyof typeof zIndex;
  export type Opacity = keyof typeof opacities;
  export type Animation = keyof typeof animations;
}

// ============================================================================
// ЭКСПОРТ ВСЕХ ТОКЕНОВ
// ============================================================================

/**
 * Полный экспорт всех токенов для использования в других проектах
 * @version 2.1.0
 */
export const designTokens = {
  version: '2.1.0',
  colors: colorPalettes,
  typography,
  baseFontSizes,
  fontSizes,
  fontWeights,
  spacing,
  componentSpacing,
  responsiveSpacing,
  responsivePadding,
  componentSizes,
  iconSizes,
  gridSystem,
  opacities,
  borderRadius,
  componentBorderRadius,
  shadows: extendedShadows,
  transitions,
  transitionDurations,
  transitionTimingFunctions,
  breakpoints,
  zIndex,
  keyframes,
  animations,
  lineClamp,
} as const;

/**
 * Тип для всего набора токенов
 */
export type DesignTokensType = typeof designTokens;
