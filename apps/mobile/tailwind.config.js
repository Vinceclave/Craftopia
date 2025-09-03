/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        craftopia: {
          // Primary AI colors
          neural: '#6D28D9',      // Deep Purple - AI brain/neural networks
          digital: '#0891B2',     // Dark Cyan - Digital/tech forward
          spark: '#D97706',       // Dark Amber - Creative spark/inspiration
          energy: '#DC2626',      // Dark Red - Creative energy/passion
          growth: '#059669',      // Dark Emerald - Growth/generation
          
          // Background colors
          light: '#FFFFFF',       // Primary light background
          surface: '#F9FAFB',     // Secondary light surface
          accent: '#F3F4F6',      // Accent light background
          
          // Text colors
          text: {
            primary: '#111827',   // Primary dark text
            secondary: '#6B7280', // Secondary gray text
            accent: '#0891B2',    // Accent text color (dark cyan)
          }
        }
      },
    },
  },
  plugins: [],
};