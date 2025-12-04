import type { Config } from 'tailwindcss';
import { 
  baseFontSizes,
  fontSizes,
  fontWeights,
  spacing,
  componentSpacing,
  responsiveSpacing,
  componentSizes,
  borderRadius,
  componentBorderRadius,
  extendedShadows,
  transitionDurations,
  transitionTimingFunctions,
  breakpoints,
  keyframes,
  animations,
  lineClamp,
  gridSystem,
} from './src/shared/lib/design-tokens';

/**
 * TAILWIND CONFIG
 * 
 * ✅ Все токены импортируются из @/lib/design-tokens.ts
 * ❌ НЕ дублируйте значения здесь - используйте единственный источник истины
 * 
 * Этот файл только преобразует токены в формат Tailwind CSS.
 * Изменения делайте в ./lib/design-tokens.ts
 */

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    /**
     * BREAKPOINTS
     * Импортированы из design-tokens.ts
     */
    screens: {
      'sm': { 'min': `${breakpoints.sm}px`, 'max': `${breakpoints.md - 1}px` },
      'md': { 'min': `${breakpoints.md}px`, 'max': `${breakpoints.lg - 1}px` },
      'lg': { 'min': `${breakpoints.lg}px`, 'max': `${breakpoints.xl - 1}px` },
      'xl': { 'min': `${breakpoints.xl}px`, 'max': `${breakpoints['2xl'] - 1}px` },
      '2xl': { 'min': `${breakpoints['2xl']}px` },
      // Mobile-first helpers
      'mobile': { 'max': `${breakpoints.md - 1}px` },
      'tablet': { 'min': `${breakpoints.md}px`, 'max': `${breakpoints.lg - 1}px` },
      'desktop': { 'min': `${breakpoints.lg}px` },
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
          disabled: 'var(--color-accent-disabled)',
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
       * ТИПОГРАФИКА
       */
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      /**
       * ТЕНИ
       * Импортированы из design-tokens.ts
       */
      boxShadow: extendedShadows,
      /**
       * СКРУГЛЕНИЯ
       * Расширенная система border radius из design-tokens.ts
       * Включает базовые значения + семантические имена для компонентов
       */
      borderRadius: {
        ...borderRadius,
        // Семантические радиусы для компонентов
        'btn-sm': componentBorderRadius.button.sm,
        'btn-md': componentBorderRadius.button.md,
        'btn-lg': componentBorderRadius.button.lg,
        'btn-pill': componentBorderRadius.button.pill,
        'input': componentBorderRadius.input.default,
        'input-sm': componentBorderRadius.input.sm,
        'card-sm': componentBorderRadius.card.sm,
        'card-md': componentBorderRadius.card.md,
        'card-lg': componentBorderRadius.card.lg,
        'modal': componentBorderRadius.modal.default,
        'modal-lg': componentBorderRadius.modal.lg,
        'avatar-sm': componentBorderRadius.avatar.sm,
        'avatar-md': componentBorderRadius.avatar.md,
        'avatar-lg': componentBorderRadius.avatar.lg,
        'avatar-full': componentBorderRadius.avatar.full,
        'badge': componentBorderRadius.badge.default,
        'badge-square': componentBorderRadius.badge.square,
      },
      /**
       * COMPONENT HEIGHTS
       * Стандартизированные высоты для компонентов
       */
      height: {
        'btn-xs': componentSizes.button.height.xs,
        'btn-sm': componentSizes.button.height.sm,
        'btn-md': componentSizes.button.height.md,
        'btn-lg': componentSizes.button.height.lg,
        'btn-xl': componentSizes.button.height.xl,
        'input-sm': componentSizes.input.height.sm,
        'input-md': componentSizes.input.height.md,
        'input-lg': componentSizes.input.height.lg,
        'avatar-xs': componentSizes.avatar.xs,
        'avatar-sm': componentSizes.avatar.sm,
        'avatar-md': componentSizes.avatar.md,
        'avatar-lg': componentSizes.avatar.lg,
        'avatar-xl': componentSizes.avatar.xl,
        'avatar-2xl': componentSizes.avatar['2xl'],
      },
      /**
       * COMPONENT WIDTHS
       * Ширины для компонентов (совпадают с высотами для квадратных элементов)
       */
      width: {
        'avatar-xs': componentSizes.avatar.xs,
        'avatar-sm': componentSizes.avatar.sm,
        'avatar-md': componentSizes.avatar.md,
        'avatar-lg': componentSizes.avatar.lg,
        'avatar-xl': componentSizes.avatar.xl,
        'avatar-2xl': componentSizes.avatar['2xl'],
        'icon-xs': componentSizes.icon.xs,
        'icon-sm': componentSizes.icon.sm,
        'icon-md': componentSizes.icon.md,
        'icon-lg': componentSizes.icon.lg,
        'icon-xl': componentSizes.icon.xl,
        'icon-2xl': componentSizes.icon['2xl'],
      },
      /**
       * SPACING
       * Унифицированная система spacing из design-tokens.ts
       * Включает базовые значения + адаптивные размеры
       */
      spacing: {
        ...Object.fromEntries(
          Object.entries(spacing).map(([key, value]) => [key, value])
        ),
        ...responsiveSpacing,
      },
      /**
       * PADDING & MARGIN SHORTCUTS
       * Семантические значения для компонентов
       */
      padding: {
        'btn-xs': componentSizes.button.padding.xs,
        'btn-sm': componentSizes.button.padding.sm,
        'btn-md': componentSizes.button.padding.md,
        'btn-lg': componentSizes.button.padding.lg,
        'btn-xl': componentSizes.button.padding.xl,
        'input-sm': componentSizes.input.padding.sm,
        'input-md': componentSizes.input.padding.md,
        'input-lg': componentSizes.input.padding.lg,
      },
      /**
       * MAX WIDTH
       * Импортированы из design-tokens.ts (gridSystem.containerMaxWidth)
       */
      maxWidth: gridSystem.containerMaxWidth,
      /**
       * РАЗМЕРЫ ШРИФТОВ
       * Импортированы из design-tokens.ts
       */
      fontSize: {
        // Базовые размеры из design-tokens
        ...baseFontSizes,
        
        // Адаптивные размеры для Typography компонента
        'desktop-h1': fontSizes.desktop.h1,
        'desktop-h2': fontSizes.desktop.h2,
        'desktop-h3': fontSizes.desktop.h3,
        'desktop-body': fontSizes.desktop.body,
        'desktop-body-sm': fontSizes.desktop.bodySm,
        'desktop-tag': fontSizes.desktop.tag,
        'desktop-note': fontSizes.desktop.note,
        
        'tablet-h1': fontSizes.tablet.h1,
        'tablet-h2': fontSizes.tablet.h2,
        'tablet-h3': fontSizes.tablet.h3,
        'tablet-body': fontSizes.tablet.body,
        'tablet-body-sm': fontSizes.tablet.bodySm,
        'tablet-tag': fontSizes.tablet.tag,
        'tablet-note': fontSizes.tablet.note,
        
        'mobile-h1': fontSizes.mobile.h1,
        'mobile-h2': fontSizes.mobile.h2,
        'mobile-h3': fontSizes.mobile.h3,
        'mobile-body': fontSizes.mobile.body,
        'mobile-body-sm': fontSizes.mobile.bodySm,
        'mobile-tag': fontSizes.mobile.tag,
        'mobile-note': fontSizes.mobile.note,
      },
      /**
       * ВЕСА ШРИФТОВ
       * Импортированы из design-tokens.ts
       */
      fontWeight: fontWeights,
      /**
       * АНИМАЦИИ
       * Импортированы из design-tokens.ts
       */
      keyframes: keyframes,
      animation: animations,
      /**
       * ПЕРЕХОДЫ
       * Импортированы из design-tokens.ts
       */
      transitionDuration: transitionDurations,
      transitionTimingFunction: transitionTimingFunctions,
      /**
       * LINE CLAMP
       * Импортированы из design-tokens.ts
       */
      lineClamp: lineClamp,
    },
  },
  plugins: [],
};

export default config;

