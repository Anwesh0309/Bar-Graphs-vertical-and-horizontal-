/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Baloo 2"', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        'gq-gold': '#F5A623',
        'gq-gold-light': '#FFC94A',
        'gq-pink': '#E85D8C',
        'gq-green': '#4ADE80',
        'gq-purple-start': '#1a1030',
        'gq-purple-end': '#2b1b4e',
      },
      borderRadius: {
        'gq-lg': '20px',
        'gq-md': '14px',
      }
    },
  },
  plugins: [],
}
