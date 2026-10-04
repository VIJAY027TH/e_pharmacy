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
          50: '#F4F7F4',
          100: '#EEF5EE', // soft green
          200: '#D6E4D6',
          300: '#ADC7AD',
          400: '#84AA84',
          500: '#5A7A5A', // primary
          600: '#4F6F52', // primary darker
          700: '#3F5941',
          800: '#2F4331',
          900: '#1F2C21',
        },
        warm: {
          50: '#FAF9F6', // background
          100: '#F2F0EB',
          200: '#E5E2DA', // border
          300: '#D1CCC0',
          400: '#999999',
          500: '#666666', // secondary text
          600: '#525252',
          700: '#3D3D3D',
          800: '#252525', // dark text
          900: '#1A1A1A',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FBF5EB',
          200: '#F5E8D1',
          300: '#EBD4AD',
          400: '#DEC088',
          500: '#C9A66B', // warm accent
          600: '#B38E4F',
          700: '#8C6E3B',
        },
        success: {
          50: '#F0F7F2',
          100: '#E2EFE5',
          500: '#4F8A5B',
          600: '#43754D',
          700: '#355D3D',
        }
      }
    },
  },
  plugins: [],
}
