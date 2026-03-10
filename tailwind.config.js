/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "background-primary": "#FFFFFF",
        "background-card": "#F5F5F5",
        "labels-primary": "#000000",
        primary: "#27272A",
        // Gray text scale — 2 tokens replacing 4 near-identical grays
        secondary: "#B0B3BA",   // captions, inactive tab labels, hints, chart axis, profile subtitle
        "tab-selected": "#000000",
        "icon-primary": "#333333",
        "weather-sun": "#EDA36E",
        "weather-cloud": "#8AA2D7",
        "status-button": "#27272A",
        "tint-active": "#EEFAE8",
        "tint-grace": "#FEF2F2",
        "tint-critical": "#FFF1F2",
        "state-active": "#5FB537",
        "state-grace": "#FB923C",
        "state-critical": "#EF4444",
        // Unified orange — same value as state-grace
        alert: "#FB923C",
        overlay: "rgba(0, 0, 0, 0.4)",
        "tint-alert-banner": "#FFF7ED",
        "chart-grid": "#E5E5E5",
        "chart-tooltip": "#000000",
        "chart-tooltip-text": "#FFFFFF",
        "status-safe": "#10B981",
        "status-warning": "#EF4444",
        "chevron-muted": "#B0B3BA",
        separator: "#E5E5E5",
        "brand-primary": "#9BDA53",
      },
      borderRadius: {
        card: "20px",
        button: "100px",
        modal: "34px",
        "inner-card": "16px",  // unified secondary card radius (replaces rounded-xl + rounded-2xl)
      },
      borderWidth: {
        bar: "0.33px",
      },
      boxShadow: {
        button: "0px 4px 8px 1px rgba(56, 91, 61, 0.25)",
        "state-active": "0px 2px 4px 0px rgba(42, 165, 42, 0.30)",
        "state-grace": "0px 2px 4px 0px rgba(165, 114, 42, 0.30)",
        "state-critical": "0px 2px 4px 0px rgba(165, 42, 42, 0.30)",
      },
      fontSize: {
        tab: ["10px", { lineHeight: "1" }],
      },
    },
  },
  plugins: [],
};
