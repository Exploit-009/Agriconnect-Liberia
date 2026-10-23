/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f1',
          100: '#dcebe0',
          200: '#bcd8c4',
          300: '#8fb898',
          400: '#5e9070',
          500: '#3f7150',
          600: '#2e5a3e',
          700: '#264732',
          800: '#1f3a2a',
          900: '#1a3023',
          950: '#0d1b13',
        },
        leaf: {
          50: '#f3faef',
          100: '#e3f5d7',
          200: '#c9eab2',
          300: '#a4d980',
          400: '#82c257',
          500: '#62a73a',
          600: '#4b862c',
          700: '#3a6824',
          800: '#305320',
          900: '#28451d',
        },
        cream: {
          50: '#fdfbf5',
          100: '#faf5e6',
          200: '#f4e9c8',
          300: '#ecd9a0',
          400: '#e2c570',
          500: '#d9b14e',
          600: '#c79a3a',
          700: '#a57b30',
          800: '#85622b',
          900: '#6e5125',
        },
        gold: {
          400: '#e0b53c',
          500: '#d4a017',
          600: '#b8850f',
          700: '#92680c',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(30, 58, 42, 0.12), 0 1px 3px -1px rgba(30, 58, 42, 0.08)',
        'card-hover': '0 8px 24px -6px rgba(30, 58, 42, 0.18), 0 2px 8px -2px rgba(30, 58, 42, 0.12)',
        'soft': '0 1px 4px rgba(30, 58, 42, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
