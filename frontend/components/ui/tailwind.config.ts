import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: { min: '640px', max: '767px' },
      md: { min: '768px', max: '1023px' },
      lg: { min: '1024px', max: '1279px' },
      xl: { min: '1280px', max: '1535px' },
      '2xl': { min: '1536px' },
    },
    extend: {
      colors: {
        background: {
          1: '#FFFFFF',
          2: '#E1F7DB',
          3: '#F6FBF7',
          overlay: 'rgba(22, 22, 14, 0.7)',
          DEFAULT: '#FFFFFF',
        },
        text: {
          primary: '#2A2A0F',
          secondary: '#819082',
          unfocused: '#96A996',
          inverse: '#FFFFFF',
          disabled: '#DBDBDB',
          DEFAULT: '#2A2A0F',
        },
        accent: {
          1: '#3A971E',
          2: '#67AD51',
          disabled: '#AAC89A',
          DEFAULT: '#3A971E',
        },
        feedback: {
          error: '#B52F2F',
          attention: '#F13A0C',
        },
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(to top, #CDF2C2, #FCFFFD)',
        'gradient-card': 'linear-gradient(to bottom, #DDF8D4, #F9D5B7)',
        'gradient-banner': 'linear-gradient(to bottom, #FFFDE9, #D7FAD6)',
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
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
        
        // Mobile typography (fallback to tablet for now)
        'mobile-h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'mobile-h2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'mobile-h3': ['18px', { lineHeight: '22px', fontWeight: '500' }],
        'mobile-body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'mobile-body-sm': ['14px', { lineHeight: '18px', fontWeight: '400' }],
        'mobile-tag': ['14px', { lineHeight: '18px', fontWeight: '800' }],
        'mobile-note': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        sm: '0px 0.5px 9px 0px rgba(0, 0, 0, 0.07)',
        DEFAULT: '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
        md: '0px 4px 8px 0px rgba(0, 0, 0, 0.12)',
        lg: '0px 8px 16px 0px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
