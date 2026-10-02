/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Bharat Sovereign Design System Color Tokens (EBS-DOC-06-STYLE)
        bharat: {
          saffron: {
            DEFAULT: '#D97706',
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706', // Primary Kesari Saffron
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          terracotta: {
            DEFAULT: '#C2410C',
            50: '#FFF7ED',
            500: '#F97316',
            600: '#EA580C',
            700: '#C2410C', // Ancient Fort Terracotta
            800: '#9A3412',
          },
          evergreen: {
            DEFAULT: '#047857',
            50: '#ECFDF5',
            500: '#10B981',
            600: '#059669',
            700: '#047857', // Sahyadri & Himalayan Evergreen
            800: '#065F46',
            900: '#064E3B',
          },
          indigo: {
            DEFAULT: '#1E1B4B',
            50: '#EEF2FF',
            800: '#312E81',
            900: '#1E1B4B', // Royal Indigo Slate (Dark Theme Canvas)
            950: '#0F0E2A',
          },
          sandstone: {
            DEFAULT: '#CA8A04',
            100: '#FEF9C3',
            500: '#EAB308',
            600: '#CA8A04', // Temple Sandstone Gold
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#D97706',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#047857',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        indic: ['var(--font-indic)', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
