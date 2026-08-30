/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'corp-navy': '#1F3864',
        'corp-navy-dark': '#152747',
        'corp-blue': '#2F5597',
        'corp-blue-light': '#D9E1F2',
        'corp-blue-subtle': '#E8EEF8',
        'corp-gray': '#595959',
        'corp-gray-light': '#F2F2F2',
        'corp-gray-border': '#D9D9D9',
        'corp-yellow-light': '#FFF2CC',
        'corp-orange-light': '#FCE4D6',
        'corp-green-light': '#E2EFDA',
        'corp-green-dark': '#375623',
        'stage-d0': '#2563EB',
        'stage-d1': '#D97706',
        'stage-d2': '#EA580C',
        'stage-d3': '#4F46E5',
        'stage-d4': '#16A34A',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Arial', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
