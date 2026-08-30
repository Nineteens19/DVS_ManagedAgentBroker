import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deves Corporate Theme Tokens
        primary: {
          DEFAULT: '#012169', // Deves Navy กรมท่า/น้ำเงินเข้ม
          dark: '#001a52',
          light: '#0a328c',
          50: '#f0f4fc',
          100: '#dbe5f7',
          200: '#bdcfe0',
        },
        secondary: {
          DEFAULT: '#FFCD00', // Deves Gold เหลืองทอง
          dark: '#e6b800',
          light: '#ffe066',
        },
        deves: {
          navy: '#012169',
          gold: '#FFCD00',
          bg: '#F8F9FA',
          border: '#DEE2E6',
          text: '#212529',
          muted: '#6C757D',
          card: '#FFFFFF',
        },
        success: '#28A745',
        danger: '#DC3545',
        warning: '#FD7E14',
        info: '#17A2B8',
        bg: '#F8F9FA',
        border: '#DEE2E6',
        'text-muted': '#6C757D',
      },
      fontFamily: {
        sans: ['var(--font-sarabun)', 'Sarabun', 'sans-serif'],
        display: ['var(--font-prompt)', 'Prompt', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(1, 33, 105, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        header: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
