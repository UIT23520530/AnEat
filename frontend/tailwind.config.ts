// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... các cấu hình khác của bạn
  theme: {
    extend: {
      colors: {
        'lama-yellow': '#F8B400', // Màu vàng cho nút Add/Filter/Sort
        'lama-sky': '#E0F7FA',   // Màu nền cho nút View/Edit
        'lama-sky-dark': '#00BCD4', // Màu icon cho nút View/Edit
        'lama-purple': '#F3E5F5', // Màu nền cho nút Delete
        'lama-purple-dark': '#9C27B0', // Màu icon cho nút Delete
        'lama-bg': '#F8F9FA', // Màu nền chung của trang
      },
      // ... các extend khác
    },
  },
  plugins: [require("tailwindcss-animate")],
}