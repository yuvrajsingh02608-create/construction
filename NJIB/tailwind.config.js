/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        njib: {
          red:        '#CC0000',
          'red-dark': '#AA0000',
          charcoal:   '#1A1A1A',
          'gray-mid': '#888888',
          'gray-light': '#F5F5F5',
          border:     '#E0E0E0',
        },
        primary: {
          DEFAULT: '#CC0000',
          light: '#FF4444',
          dark: '#AA0000',
        },
        accent: {
          DEFAULT: '#CC0000',
          light: '#FF4444',
        },
        success: '#2E7D32',
        warning: '#F57F17',
        danger: '#CC0000',
        background: '#F5F5F5',
        textDark: '#1A1A1A',
        textSecondary: '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
