const colors = require('./src/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Single source of truth: src/constants/colors.js
      colors,
      // One entry per weight, because React Native loads each weight as its own font file
      fontFamily: {
        sans: ['Nunito_400Regular'],
        'sans-medium': ['Nunito_500Medium'],
        'sans-semibold': ['Nunito_600SemiBold'],
        'sans-bold': ['Nunito_700Bold'],
        'sans-extrabold': ['Nunito_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
