/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amrita: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#a41d35', // Amrita Crimson Red
          600: '#8c182b', // Deep Amrita Red (Portal Header)
          700: '#731222',
          800: '#590b18',
          900: '#40060f',
        },
        brand: {
          red: '#8c182b',
          crimson: '#a41d35',
          gold: '#d97706',
          bg: '#f8fafc',
          card: '#ffffff',
          dark: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
