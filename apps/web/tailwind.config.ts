import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f2ff',
          100: '#ebe5ff',
          200: '#d7ccff',
          400: '#a078ff',
          500: '#7c3aed',
          600: '#6d28d9',
        },
        accent: '#f97316',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
