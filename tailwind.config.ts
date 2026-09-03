import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'custom-mobile': '25px',
        'custom-tablet': '35px',
        'custom-desktop': '45px',
      },
      boxShadow: {
        'soft': '0 8px 22px -3px rgba(15, 23, 42, 0.06), 0 3px 8px -2px rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 14px 30px -5px rgba(15, 23, 42, 0.09), 0 6px 14px -3px rgba(15, 23, 42, 0.04)',
        'soft-xl': '0 18px 36px -6px rgba(15, 23, 42, 0.10), 0 8px 18px -4px rgba(124, 58, 237, 0.08)',
        'darker': '0 12px 28px -4px rgba(15, 23, 42, 0.11), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
        'glow': '0 0 25px rgba(139, 92, 246, 0.35)',
        'glow-coral': '0 0 25px rgba(255, 107, 107, 0.35)',
      },
      colors: {
        brand: {
          50: '#fbf9f6',
          100: '#f5efe6',
          200: '#e8dbcb',
          300: '#d7c2a7',
          400: '#c2a17e',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
          dark: '#0f172a',
          surface: '#1e1b4b',
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        cream: {
          50: '#fefdfb',
          100: '#faf7f2',
          200: '#f4ece1',
          300: '#eadecf',
        }
      },
    },
  },
  plugins: [],
};

export default config;
