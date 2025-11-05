module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6B21A8", // example extension
      },
      spacing: {
        72: "18rem",
      },
    },
  },
  safelist: [
    // classes generated dynamically (optional)
    "bg-purple-600",
    "text-white",
    "hidden",
    "flex",
  ],
  plugins: [],
};