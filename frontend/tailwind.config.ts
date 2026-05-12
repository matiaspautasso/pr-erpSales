import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
        },
        title: '#1E3A8A',
        background: {
          DEFAULT: '#EAF4FF',
          card: '#FFFFFF',
          hover: '#DCEEFF',
        },
        border: { DEFAULT: '#D0D7E2' },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        success: { DEFAULT: '#16A34A', bg: '#DCFCE7' },
        error: { DEFAULT: '#DC2626', bg: '#FEE2E2' },
        warning: { DEFAULT: '#F59E0B', bg: '#FEF3C7' },
        info: { DEFAULT: '#0284C7', bg: '#E0F2FE' },
        table: {
          header: '#F1F5F9',
          row: '#FFFFFF',
          rowAlt: '#F9FAFB',
          hover: '#E0ECFF',
        },
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Lexend', 'sans-serif'],
        sans: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
