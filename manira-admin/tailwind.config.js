/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: '#B8860B', light: '#D4A017', dark: '#8B6508' },
        sidebar: '#1a1a2e',
      },
    },
  },
  plugins: [],
};
