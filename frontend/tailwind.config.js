/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#090A0B", secondary: "#0D0F10" },
        panel: { DEFAULT: "#151719", secondary: "#1C1F22" },
        border: { DEFAULT: "rgba(255,255,255,0.08)" },
        ink: { DEFAULT: "#FFFFFF", muted: "#A0A4AA" },
        accent: { DEFAULT: "#DFFF00", dim: "#B8D600" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(223,255,0,0.15)",
      },
    },
  },
  plugins: [],
};
