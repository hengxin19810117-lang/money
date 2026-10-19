/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff9a9e',
        secondary: '#a18cd1',
        surface: {
          card: 'rgba(255, 255, 255, 0.08)',
          'card-subtle': 'rgba(255, 255, 255, 0.05)',
          container: {
            low: 'rgba(255, 255, 255, 0.1)',
            high: 'rgba(255, 255, 255, 0.15)',
          }
        },
        text: {
          primary: '#ffffff',
          secondary: '#e0e0e0',
          muted: '#a0a0a0',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
