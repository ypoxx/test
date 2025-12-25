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
        'msv-white': '#FFFFFF',
        'field-green': '#2D8659',
        'goal': '#FFD700',
        'success': '#10B981',
        'error': '#EF4444'
      },
      fontFamily: {
        'display': ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
