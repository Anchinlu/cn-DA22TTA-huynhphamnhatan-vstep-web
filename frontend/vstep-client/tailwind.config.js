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
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0077B6", // Màu xanh biển yêu cầu
        "primary-dark": "#005885",
      },
      animation: {
        "slide-up": "slideUp 0.5s ease-out forwards",
        "shake": "shake 0.3s ease-in-out",
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
    },
  },
  plugins: [],
};
