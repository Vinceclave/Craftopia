// apps/mobile/tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        craftopia: {
          primary: "#004E98",
          secondary: "#00A896",
          accent: "#FF6700",
          surface: "#FFFFFF",
          light: "#F0F0F0",
          text: {
            primary: "#1A1A1A",
            secondary: "#6B7280",
          },
        },
      },
    },
  }
  };
