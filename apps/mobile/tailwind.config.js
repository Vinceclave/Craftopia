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
          primary: "#374A36",       // Dark olive green
          secondary: "#6B8E6B",     // Dusty green
          accent: "#D4A96A",        // Natural wheat/wood tone
          surface: "#FEFEFE",       // Pure white
          light: "#F2F4F3",         // Cool gray with green hint
          textPrimary: "#1D261D",   // Near black
          textSecondary: "#5D6B5D", // Sophisticated gray
        }
      },
      spacing: {
        1: 6,   // was 4
        2: 12,  // was 8
        3: 18,  // was 12
        4: 24,  // was 16
        6: 36,  // was 24
        8: 48,  // was 32
      },
      fontSize: {
        xs: ['14px', '20px'],  // was 12/18
        sm: ['16px', '24px'],  // was 14/20
        base: ['18px', '28px'], // was 16/24
        lg: ['20px', '30px'],   // was 18/26
        xl: ['24px', '32px'],   // was 20/28
      },
    },
  },
};
