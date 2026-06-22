import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#071220",
          900: "#1F385F",
          800: "#243F68",
          700: "#3F628F",
        },
        sand: {
          50: "#FAF7EF",
          100: "#F5EEDC",
          200: "#E8DFC9",
          300: "#D7C08A",
        },
        gold: "#D7C08A",
        muted: "#C9C0AA",
        ink: "#0B1626",
        navy: "#243F68",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(31, 56, 95, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
