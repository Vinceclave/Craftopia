// apps/mobile/tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito'],
        poppinsBold: ['Poppins-Bold'],
      },
      colors: {
        craftopia: {
          // 🌱 Core brand colors (balanced universal palette)
          primary: "#3B6E4D",        // Calming green (nature, balance)
          secondary: "#89A67E",      // Soft muted green (supportive tone)
          accent: "#E6B655",         // Warm amber for highlights & buttons

          // ☁️ Backgrounds & surfaces
          surface: "#FFFFFF",        // Pure white surface
          light: "#F5F7F2",          // Soft natural off-white
          background: "#FAFAF7",     // Neutral paper-like base

          // 🖋️ Text colors
          textPrimary: "#1F2A1F",    // Deep green-black for clarity
          textSecondary: "#5F6F64",  // Muted gray-green for body text

          // 🔔 Feedback colors
          success: "#5BA776",        // Friendly fresh green
          warning: "#E3A84F",        // Warm yellow-gold
          error: "#D66B4E",          // Earthy coral-red
          info: "#5C89B5",           // Soft sky blue

          // 🌈 Gradient & hover tones
          primaryLight: "#4F8A63",   // Brighter green for hover/focus
          secondaryLight: "#A7C3A0", // Pastel green variant
          accentLight: "#F1C977",    // Soft glowing amber
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
        'xs': ['12px', '16px'],
        'sm': ['14px', '18px'],
        'base': ['16px', '20px'],
        'lg': ['18px', '22px'],
      },
    },
  },
};
