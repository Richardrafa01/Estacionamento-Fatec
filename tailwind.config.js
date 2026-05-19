export default {
  content: ['./*.html', './pages/**/*.html', './cliente/**/*.html', './js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#a855f7',
          hover: '#6b21a8',
        },
      },
    },
  },
  plugins: [],
};
