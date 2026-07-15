/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ZUT-Token-Layer (definiert in src/index.css :root) — RGB-Kanal-Form,
        // damit Tailwind-Alpha-Modifier (z.B. bg-msv-blue/40) weiter funktionieren.
        'msv-blue': 'rgb(var(--zut-msv-rgb) / <alpha-value>)',        // = --zut-msv (#005CA9)
        'msv-blue-bright': 'rgb(var(--zut-msv-hi-rgb) / <alpha-value>)', // = --zut-msv-hi (#0A7AD1)
        'msv-white': '#FFFFFF',
        'field-green': '#14532D', // kein ZUT-Token (Alt-Grün), Phase >1
        'night': '#0B1220',       // Achtung: NICHT farbgleich mit --zut-night-1 (#040D24) — bewusst Hex
        'goal': '#FFD700',        // NICHT farbgleich mit --zut-gold-1 (#FFCB2D) — bewusst Hex
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
