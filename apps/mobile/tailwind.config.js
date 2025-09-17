// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'craftopia': {
          light: '#F0F0F0',
          surface: '#FFFFFF',
          accent: '#E5E7EB',
          neural: '#004E98',
          digital: '#00A896',
          energy: '#FF6B6B',
          spark: '#FFD93D',
          text: {
            primary: '#004E98',
            secondary: '#6B7280'
          }
        }
      }
    }
  },
  plugins: [],
};