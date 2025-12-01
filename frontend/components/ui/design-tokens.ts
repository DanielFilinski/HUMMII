/**
 * Design System Tokens
 * Centralized design tokens from Figma design system
 */

// Color Tokens
export const colors = {
  background: {
    1: '#FFFFFF',
    2: '#E1F7DB',
    3: '#F6FBF7',
    overlay: 'rgba(22, 22, 14, 0.7)',
  },
  text: {
    primary: '#2A2A0F',
    secondary: '#819082',
    unfocused: '#96A996',
    inverse: '#FFFFFF',
    disabled: '#DBDBDB',
  },
  accent: {
    1: '#3A971E',
    2: '#67AD51',
    disabled: '#AAC89A',
  },
  feedback: {
    error: '#B52F2F',
    attention: '#F13A0C',
  },
} as const;

// Gradient Tokens
export const gradients = {
  main: 'linear-gradient(to top, #CDF2C2, #FCFFFD)',
  card: 'linear-gradient(to bottom, #DDF8D4, #F9D5B7)',
  banner: 'linear-gradient(to bottom, #FFFDE9, #D7FAD6)',
} as const;

// Typography Classes - for easy responsive typography
export const typography = {
  h1: 'text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1',
  h2: 'text-mobile-h2 md:text-tablet-h2 lg:text-desktop-h2',
  h3: 'text-mobile-h3 md:text-tablet-h3 lg:text-desktop-h3',
  body: 'text-mobile-body md:text-tablet-body lg:text-desktop-body',
  bodySm: 'text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm',
  tag: 'text-mobile-tag md:text-tablet-tag lg:text-desktop-tag',
  note: 'text-mobile-note md:text-tablet-note lg:text-desktop-note',
} as const;

// Spacing Tokens
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '64px',
} as const;

// Border Radius Tokens
export const borderRadius = {
  sm: '4px',
  default: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
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
