import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'Space Mono', 'monospace'],
      },
      colors: {
        light: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          border: '#E4E4E7',
          text: '#18181B',
          sub: '#71717A',
        },
        dark: {
          bg: '#09090B',
          card: '#121214',
          border: '#27272A',
          hover: '#18181B',
          text: '#F4F4F5',
          sub: '#A1A1AA',
        },
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        'fill-bar': 'fill-bar 1.2s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'draw-line': 'draw-line 1.5s ease-out both',
        // New gradient animations
        'gradient-slow': 'gradient-slow 15s ease-in-out infinite',
        'gradient-slower': 'gradient-slower 20s ease-in-out infinite',
        'gradient-reverse': 'gradient-reverse 12s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float-delayed 10s ease-in-out infinite 2s',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fill-bar': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
          '50%': { boxShadow: '0 0 20px 2px rgba(99, 102, 241, 0.15)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
        // New gradient keyframes
        'gradient-slow': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '0.3',
          },
          '33%': {
            transform: 'translate(30px, -30px) scale(1.1)',
            opacity: '0.4',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
            opacity: '0.25',
          },
        },
        'gradient-slower': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translate(-40px, -40px) scale(1.15) rotate(10deg)',
            opacity: '0.35',
          },
        },
        'gradient-reverse': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: '0.2',
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            opacity: '0.3',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
            opacity: '0.25',
          },
          '50%': {
            transform: 'translateY(-20px)',
            opacity: '0.35',
          },
        },
        'float-delayed': {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
            opacity: '0.2',
          },
          '50%': {
            transform: 'translateY(15px) translateX(-15px)',
            opacity: '0.3',
          },
        },
      },
      backgroundImage: {
        noise:
          "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
};

export default config;