import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./data/**/*.{js,ts,jsx,tsx}", "./store/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F8F8F6",
        ink: "#111111",
        coral: "#FF6B6B",
        quiet: "#8E8E93",
        mint: "#34C759"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.08)"
      },
      fontFamily: {
        sans: ["HarmonyOS Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
