import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#0B1528",
        "navy-light": "#122038", // Lighter dark navy shade for contrasting sections
        gold: {
          DEFAULT: "#B8954A",
          light: "#D9B86A",
          dark: "#967530",
        },
        soft: "#F8F6F0",
        text: {
          DEFAULT: "#1C2A38",
          muted: "#606F7B",
        },
      },
      fontFamily: {
        heading: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(184, 149, 74, 0.15)",
        "luxury-lg": "0 20px 40px -15px rgba(184, 149, 74, 0.25)",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
