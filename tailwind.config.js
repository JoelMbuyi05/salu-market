/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a6b3c",
        whatsapp: "#25d366",
        accent: "#6ee7a3",
        "badge-bg": "#e8f5ee",
        "badge-text": "#0f5e30",
        "near-black": "#1a1a1a",
        muted: "#888787",
        border: "#e0e0e0",
        "light-bg": "#f5f5f5",
      },
    },
  },
  plugins: [],
}