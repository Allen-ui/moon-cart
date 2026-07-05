import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./data/**/*.{js,ts,jsx,tsx}", "./store/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 页面背景
        night: "#FDF3EC",
        "night-soft": "#FFF8F3",
        "night-card": "#FFFFFF",
        paper: "#FDF3EC",
        "paper-soft": "#FFF8F3",
        // 主强调色 Coral
        primary: "#D85A30",
        "primary-soft": "#F5C4B3",
        "primary-deep": "#993C1D",
        coral: "#D85A30",
        "coral-light": "#F5C4B3",
        "coral-deep": "#993C1D",
        // 玻璃
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-strong": "rgba(255, 255, 255, 0.14)",
        "glass-border": "rgba(255, 255, 255, 0.18)",
        "glass-highlight": "rgba(255, 255, 255, 0.22)",
        // 文字
        ink: "#2C2C2A",
        "ink-secondary": "#5F5E5A",
        "ink-tertiary": "#888780",
        quiet: "#5F5E5A",
        muted: "#888780",
        strike: "#B4B2A9",
        // 功能色
        price: "#A32D2D",
        gold: "#FAC775",
        mint: "#3B6D11",
        // 兼容旧名
        candy: "#D85A30",
        bubblegum: "#FF8FB1",
        sky: "#5EC5F0",
        sunbeam: "#FAC775",
        grape: "#B197FC"
      },
      boxShadow: {
        soft: "0 4px 16px rgba(216, 90, 48, 0.06), 0 1px 4px rgba(44, 44, 42, 0.04)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.5)",
        "inner-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
        "inner-deep": "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
        float: "0 20px 60px rgba(0, 0, 0, 0.5)",
        card: "0 6px 20px rgba(0, 0, 0, 0.3)"
      },
      fontFamily: {
        display: ['HarmonyOS Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        sans: ['HarmonyOS Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
      },
      borderRadius: {
        glass: "20px",
        "glass-lg": "28px",
        "glass-xl": "36px",
        pill: "9999px"
      },
      keyframes: {
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pop-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        "slide-up-fade": "slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-in": "pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
