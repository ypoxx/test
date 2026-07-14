/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'msv-blue': '#005CA9',
        'msv-blue-bright': '#0A7AD1',
        'msv-white': '#FFFFFF',
        'field-green': '#14532D',
        'night': '#0B1220',
        'goal': '#FFD700',
        'success': '#10B981',
        'error': '#EF4444'
      },
      fontFamily: {
        'display': ['"Archivo Variable"', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
