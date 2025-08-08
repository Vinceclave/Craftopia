/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './auth/**/*.{js,ts,tsx}',
    './src/**/*.{js,ts,tsx}', // Add this if your code lives in /src
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        darkgray: '#3B3B3B',
        cream: '#FFF9F0',
        forest: '#2B4A2F',
        green: '#6CAC73',
        lightgray: '#BABABA',
        softwhite: '#FDFDFD',
      },
      fontFamily: {
        luckiest: ['LuckiestGuy'],
        openSans: ['OpenSans'],
      },
    },
  },
  plugins: [],
};
