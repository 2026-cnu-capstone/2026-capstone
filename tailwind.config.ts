import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        f: {
          bg: '#f7f7f8',
          surface: '#ffffff',
          surface2: '#f3f4f6',
          border: '#e4e4e7',
          border2: '#d1d5db',
          t1: '#111827',
          t2: '#374151',
          t3: '#6b7280',
          t4: '#9ca3af',
          accent: '#2563eb',
          'accent-light': '#eff6ff',
          success: '#16a34a',
          warn: '#d97706',
          danger: '#dc2626',
          purple: '#7c3aed',
          'canvas-bg': '#f0f0f2',
          'dot': '#d4d4d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        pulse2: {
          '0%': { opacity: '0.3', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1.15)' },
        },
      },
      animation: {
        pulse2: 'pulse2 0.8s ease-in-out infinite alternate',
        pulse2d: 'pulse2 0.95s ease-in-out infinite alternate',
        pulse2e: 'pulse2 1.1s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};

export default config;
