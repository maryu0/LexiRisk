/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          accent: "#4f46e5", // Indigo
        },
        risk: {
          high: "#dc2626", // Red 600
          highBg: "#fef2f2", // Red 50
          medium: "#f59e0b", // Amber 500
          mediumBg: "#fffbeb", // Amber 50
          low: "#0ea5e9", // Sky 500
          lowBg: "#f0f9ff", // Sky 50
          none: "#e2e8f0", // Slate 200
          noneBg: "#f8fafc", // Slate 50
        },
      },
    },
  },
  plugins: [],
};
