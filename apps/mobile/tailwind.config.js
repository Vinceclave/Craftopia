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
          nunito: ['Nunito'],        // variable font
          poppinsBold: ['Poppins-Bold'], // bold only
        },
        colors: {
          craftopia: {
            primary: "#374A36",       // Dark olive green
            secondary: "#6B8E6B",     // Dusty green
            accent: "#D4A96A",        // Natural wheat/wood tone
            surface: "#FEFEFE",       // Pure white
            light: "#F2F4F3",         // Cool gray with green hint
            textPrimary: "#1D261D",   // Near black
            textSecondary: "#5D6B5D", // Sophisticated gray
            
            // Suggested additional colors for variety
            success: "#4A7C59",       // Muted green (between primary & secondary)
            warning: "#B68D40",       // Muted gold (complements accent)
            error: "#8B4513",         // Warm brown (earth tone)
            info: "#5D8AA8",          // Muted blue (subtle contrast)
            
            // Gradient variants
            primaryLight: "#4A5D48",  // Lighter olive
            secondaryLight: "#7A977A", // Lighter dusty green
            accentLight: "#DDB98A",   // Lighter wheat tone
          }
        },
        spacing: {
          1: 4,   // smaller base unit
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