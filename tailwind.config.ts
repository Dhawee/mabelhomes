import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1528",
        gold: {
          DEFAULT: "#B8954A",
          light: "#D9B86A",
        },
        soft: "#F6F7F9",
        text: "#2D2D2D",
      },
      fontFamily: {
        heading: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 4px 30px rgba(12, 35, 69, 0.08)",
        "luxury-lg": "0 8px 40px rgba(12, 35, 69, 0.12)",
        gold: "0 4px 20px rgba(184, 149, 74, 0.25)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "loading-bar": "loadingBar 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        loadingBar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
