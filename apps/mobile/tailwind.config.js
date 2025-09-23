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
            primary: "#004E98",       // main blue for branding
            secondary: "#00A896",     // secondary green accent
            accent: "#FF6700",        // highlights / buttons
            surface: "#FFFFFF",       // background surfaces
            light: "#F0F0F0",         // subtle backgrounds
            textPrimary: "#1A1A1A",   // main text
            textSecondary: "#6B7280", // secondary text
          },
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
          xs: ['12px', '18px'],    // slightly bigger than default
          sm: ['14px', '20px'],    // neutral small
          base: ['16px', '24px'],  // main body text
          lg: ['18px', '26px'],    // headings
          xl: ['20px', '28px'],    // larger headings
        },
      },
    },
  };
