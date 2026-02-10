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
        // Legacy gradient animations (kept for compatibility)
        'gradient-slow': 'gradient-slow 15s ease-in-out infinite',
        'gradient-slower': 'gradient-slower 20s ease-in-out infinite',
        'gradient-reverse': 'gradient-reverse 12s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float-delayed 10s ease-in-out infinite 2s',
        // Stripe-style flowing gradient animations
        'stripe-1': 'stripe-flow-1 18s ease-in-out infinite',
        'stripe-2': 'stripe-flow-2 22s ease-in-out infinite',
        'stripe-3': 'stripe-flow-3 25s ease-in-out infinite',
        'stripe-4': 'stripe-flow-4 20s ease-in-out infinite',
        'stripe-5': 'stripe-flow-5 28s ease-in-out infinite',
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
        // Legacy gradient keyframes
        'gradient-slow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)', opacity: '0.4' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)', opacity: '0.25' },
        },
        'gradient-slower': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translate(-40px, -40px) scale(1.15) rotate(10deg)', opacity: '0.35' },
        },
        'gradient-reverse': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.2' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '0.3' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.25' },
          '50%': { transform: 'translateY(-20px)', opacity: '0.35' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.2' },
          '50%': { transform: 'translateY(15px) translateX(-15px)', opacity: '0.3' },
        },
        // Stripe-style flowing gradient keyframes – high dynamics, opacity handled on element
        'stripe-flow-1': {
          '0%':   { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
          '15%':  { transform: 'translate(25%, -30%) scale(1.25) rotate(8deg)' },
          '35%':  { transform: 'translate(-15%, 20%) scale(0.8) rotate(-5deg)' },
          '55%':  { transform: 'translate(30%, 10%) scale(1.35) rotate(12deg)' },
          '75%':  { transform: 'translate(-20%, -25%) scale(0.9) rotate(-8deg)' },
          '100%': { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
        },
        'stripe-flow-2': {
          '0%':   { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
          '20%':  { transform: 'translate(-30%, 25%) rotate(15deg) scale(1.3)' },
          '45%':  { transform: 'translate(20%, -15%) rotate(-10deg) scale(0.75)' },
          '70%':  { transform: 'translate(10%, 30%) rotate(12deg) scale(1.2)' },
          '100%': { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
        },
        'stripe-flow-3': {
          '0%':   { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
          '25%':  { transform: 'translate(35%, -35%) scale(0.7) rotate(-12deg)' },
          '50%':  { transform: 'translate(-25%, 15%) scale(1.4) rotate(8deg)' },
          '75%':  { transform: 'translate(15%, -20%) scale(0.85) rotate(-6deg)' },
          '100%': { transform: 'translate(0%, 0%) scale(1) rotate(0deg)' },
        },
        'stripe-flow-4': {
          '0%':   { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
          '20%':  { transform: 'translate(-20%, -30%) rotate(-12deg) scale(1.3)' },
          '50%':  { transform: 'translate(25%, 20%) rotate(10deg) scale(0.75)' },
          '80%':  { transform: 'translate(-15%, 10%) rotate(-6deg) scale(1.15)' },
          '100%': { transform: 'translate(0%, 0%) rotate(0deg) scale(1)' },
        },
        'stripe-flow-5': {
          '0%':   { transform: 'translate(0%, 0%) scale(0.9) rotate(0deg)' },
          '20%':  { transform: 'translate(30%, -20%) scale(1.3) rotate(15deg)' },
          '40%':  { transform: 'translate(-20%, 30%) scale(0.8) rotate(-10deg)' },
          '65%':  { transform: 'translate(-25%, -15%) scale(1.35) rotate(8deg)' },
          '85%':  { transform: 'translate(15%, 10%) scale(0.85) rotate(-5deg)' },
          '100%': { transform: 'translate(0%, 0%) scale(0.9) rotate(0deg)' },
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
