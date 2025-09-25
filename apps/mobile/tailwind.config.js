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
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        6: 24,
        8: 32,
      },
      fontSize: {
        xs: ['12px', '18px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '26px'],
        xl: ['20px', '28px'],
      },
    },
  },
};
