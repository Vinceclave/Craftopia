// apps/mobile/tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        craftopia: {
          text: {
            primary: "#1A1A1A",
            secondary: "#6B7280",
          },
          surface: "#FFFFFF",
          neural: "#4B5563",
          energy: "#FF6B6B",   // Example theme colors
          focus: "#4F46E5",
          growth: "#10B981",
        },
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.08)", // ✅ Cross-platform safe shadow
      },
    },
  },
};
