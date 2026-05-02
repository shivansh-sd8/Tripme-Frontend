/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // fontFamily: {
      //   'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      //   'display': ['var(--font-playfair)', 'Playfair Display', 'serif'],
      //   'heading': ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      //   'body': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      // },

      //  fontFamily: {
      //   sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
      // },
      fontFamily: {
        sans: ['var(--font-jost)', 'Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        h1: ['36px', { lineHeight: '44px', fontWeight: '600' }],
        h2: ['28px', { lineHeight: '36px', fontWeight: '600' }],
        h3: ['22px', { lineHeight: '30px', fontWeight: '500' }],
        body: ['16px', { lineHeight: '26px', fontWeight: '400' }],
        small: ['14px', { lineHeight: '22px', fontWeight: '400' }],
      },
      
      colors: {
        primary: {
          50: '#E8F0FE',
          100: '#D2E3FC',
          200: '#AECBFA',
          300: '#8AB4F8',
          400: '#669DF6',
          500: '#4285F4',
          600: '#1A73E8',
          700: '#1967D2',
          800: '#185ABC',
          900: '#174EA6',
          DEFAULT: '#4285F4',
          active: '#4285F4',
          inactive: '#717171',
        },

        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },

        background: '#FFFFFF',
        border: '#E5E7EB',
      },
       spacing: {
        section: '64px',
        container: '1200px',
      },

      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      // colors: {
      //   primary: '#FF6B00', // Zostel orange
      //   secondary: '#FFD600', // Zostel yellow
      //   background: '#FFFFFF', // plain white
      //   text: '#222222', // soft dark for text
      // },
    },
  },
  plugins: [],
} 