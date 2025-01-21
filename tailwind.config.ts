import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        tablet: '640px', // For our specific tablet use case
      },
      colors: {
        // Mexican restaurant-themed colors
        primary: '#D62828', // Deep red
        secondary: '#006847', // Mexican green
        accent: '#F4C430', // Warm yellow (pueb)
        adobe: '#E4D5C3', // Warm tan/adobe
        'adobe-dark': '#C4B5A3', // Darker adobe for contrast
      },
      fontFamily: {
        // You might want to update these with fonts that match Mexican restaurant branding
        sans: ['var(--font-inter)'],
        display: ['var(--font-playfair-display)'],
      },
    },
  },
  plugins: [],
};

export default config;
