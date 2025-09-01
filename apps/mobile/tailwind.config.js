/** tailwind.config.js */
module.exports = {
  content: ["./App.{js,ts,tsx}", "./**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#FBBF24",
        background: "#F3F4F6",
      },
      fontFamily: {
        inter: ["Inter_400Regular", "Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
