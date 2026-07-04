import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./data/**/*.{js,ts,jsx,tsx}", "./store/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 深夜星空底
        night: "#0a0a1a",
        "night-soft": "#12122a",
        "night-card": "#1a1a38",
        // 主橙（iOS 规范，#FF5000）
        primary: "#FF5000",
        "primary-soft": "#FF7A3D",
        "primary-deep": "#E04400",
        // 玻璃高亮
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-strong": "rgba(255, 255, 255, 0.14)",
        "glass-border": "rgba(255, 255, 255, 0.18)",
        "glass-highlight": "rgba(255, 255, 255, 0.22)",
        // 文字
        ink: "#FFFFFF",
        "ink-secondary": "rgba(255, 255, 255, 0.7)",
        "ink-tertiary": "rgba(255, 255, 255, 0.4)",
        // 兼容旧名
        paper: "#0a0a1a",
        price: "#FF5000",
        coral: "#FF5000",
        gold: "#FFD23F",
        quiet: "rgba(255, 255, 255, 0.45)",
        mint: "#10B981",
        "paper-soft": "#12122a",
        // 糖果色备用（保持兼容）
        candy: "#FF5000",
        bubblegum: "#FF8FB1",
        sky: "#5EC5F0",
        sunbeam: "#FFD23F",
        grape: "#B197FC"
      },
      boxShadow: {
        // iOS 风格柔光投影
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.5)",
        // 内高光（玻璃顶部亮边）
        "inner-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
        "inner-deep": "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
        // 浮动投影
        float: "0 20px 60px rgba(0, 0, 0, 0.5)",
        // 保留旧名
        soft: "0 8px 24px rgba(0, 0, 0, 0.35)",
        card: "0 6px 20px rgba(0, 0, 0, 0.3)"
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"PingFang SC"', 'system-ui', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"PingFang SC"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        glass: "20px",
        "glass-lg": "28px",
        "glass-xl": "36px",
        pill: "9999px"
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "10px",
        lg: "20px",
        xl: "30px",
        "2xl": "40px"
      },
      keyframes: {
        "glass-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" }
        },
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
        "glass-float": "glass-float 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "slide-up-fade": "slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-in": "pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
