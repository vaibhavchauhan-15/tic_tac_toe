/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          300: '#d8b4fe',
          800: '#6b21a8',
        },
        blue: {
          300: '#93c5fd',
          400: '#60a5fa',
          600: '#2563eb',
        },
        pink: {
          500: '#ec4899',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /from-(purple|blue)-(300|600|800)/,
      variants: ['hover', 'focus', 'lg', 'dark'],
    },
    {
      pattern: /to-(purple|blue)-(300|600)/,
      variants: ['hover', 'focus', 'lg', 'dark'],
    },
    {
      pattern: /text-(pink|blue)-(400|500)/,
      variants: ['hover', 'focus'],
    },
  ],
}

