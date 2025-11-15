/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Lấy từ phần 'content' của bạn
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}" // Dòng này quét các tệp .jsx
  ],
  
  // 2. Lấy từ phần 'theme' của bạn
  theme: {
    extend: {
      keyframes: {
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-bottom': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-left': 'fade-in-left 0.8s ease-out forwards',
        'fade-in-bottom': 'fade-in-bottom 0.8s ease-out forwards',
      },
    },
  },

  // 3. Lấy từ phần 'plugins' của bạn
  plugins: [],
};