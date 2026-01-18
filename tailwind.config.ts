import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1628',
          800: '#0f2744',
          700: '#163860',
          600: '#1e4a7c',
        },
        royal: {
          500: '#2563eb',
          400: '#3b82f6',
          300: '#60a5fa',
        },
        accent: {
          orange: '#f97316',
          'orange-light': '#fb923c',
          'orange-dark': '#ea580c',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        script: ['Great Vibes', 'Pacifico', 'cursive'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a1628 0%, #163860 50%, #2563eb 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(30, 74, 124, 0.5) 0%, rgba(15, 39, 68, 0.8) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
