/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pcai: {
          bg: '#f6f9ff',
          card: '#ffffff',
          border: '#e6edf6',
        },
      },
    },
  },
  plugins: [],
}
