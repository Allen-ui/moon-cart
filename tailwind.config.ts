import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./data/**/*.{js,ts,jsx,tsx}", "./store/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFF8F5",
        ink: "#1A1A1A",
        primary: "#FF5000",
        price: "#FF2D2D",
        coral: "#FF6B6B",
        gold: "#FFB800",
        quiet: "#8E8E93",
        mint: "#34C759",
        "paper-soft": "#FFF5F0"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.08)",
        card: "0 8px 24px rgba(255, 80, 0, 0.08)"
      },
      fontFamily: {
        sans: ["HarmonyOS Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
