/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F0F5F1', 100: '#E5EEE7', 200: '#D0DFD3', 300: '#AEC6B4',
          400: '#89A790', 500: '#6F8F7A', 600: '#315C4A', 700: '#294D3E',
          800: '#213E33', 900: '#192F27',
        },
        warm: {
          50: '#F7F8F5', 100: '#F0F2EF', 200: '#E4E8E5', 300: '#D2D8D3',
          400: '#98A29A', 500: '#667085', 600: '#58636B', 700: '#3F4B51', 800: '#29353B', 900: '#1F2933',
        },
        gold: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
        }
      }
    },
  },
  plugins: [],
}
