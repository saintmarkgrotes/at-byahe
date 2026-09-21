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
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        'sans-extrabold': ['PlusJakartaSans_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
