/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#121212",
        darkCard: "#1E1E1E",
        darkText: "#EAEAEA",
        primary: "#007AFF",
      },
    },
  },
  plugins: [],
}