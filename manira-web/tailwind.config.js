/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#B8860B', light: '#D4A017', dark: '#8B6508' },
        black:   { DEFAULT: '#1a1a1a', soft: '#2d2d2d' },
        cream:   { DEFAULT: '#FAF7F2', dark: '#F0EBE1' },
        silver:  { DEFAULT: '#C0C0C0', dark: '#A8A8A8' },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        gold: '0 4px 20px rgba(184,134,11,0.3)',
      },
    },
  },
  plugins: [],
};
