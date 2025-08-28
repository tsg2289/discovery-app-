/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'discovery-blue': '#1e40af',
        'discovery-turquoise': '#06b6d4',
        'discovery-light-blue': '#3b82f6',
        'discovery-dark-blue': '#1e3a8a',
        'discovery-teal': '#0891b2',
      },
    },
  },
  plugins: [],
}
