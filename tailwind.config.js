export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: '#09090b',
        surface: '#111113',
        card: '#18181b',
        'card-hover': '#1c1c20',
        border: '#27272a',
        'border-light': '#3f3f46',
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          muted: 'rgba(16,185,129,0.12)',
          glow: 'rgba(16,185,129,0.25)',
        },
        flame: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245,158,11,0.12)',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          muted: 'rgba(139,92,246,0.12)',
        },
        sky: {
          DEFAULT: '#0ea5e9',
          muted: 'rgba(14,165,233,0.12)',
        },
        rose: {
          DEFAULT: '#f43f5e',
          muted: 'rgba(244,63,94,0.12)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245,158,11,0.12)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(16,185,129,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(16,185,129,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(16,185,129,0.2)',
        'glow': '0 0 16px rgba(16,185,129,0.3)',
        'glow-lg': '0 0 32px rgba(16,185,129,0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};