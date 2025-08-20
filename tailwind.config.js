/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['var(--font-playfair)', 'Playfair Display', 'serif'],
        'heading': ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        'body': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#FF6B00', // Zostel orange
        secondary: '#FFD600', // Zostel yellow
        background: '#FFFFFF', // plain white
        text: '#222222', // soft dark for text
      },
    },
  },
  plugins: [],
} 