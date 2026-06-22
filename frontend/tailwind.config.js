/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'github-dark': '#0d1117',
        'github-dark-secondary': '#161b22',
        'github-dark-tertiary': '#1c2128',
        'github-border': '#30363d',
      },
    },
  },
  plugins: [],
}