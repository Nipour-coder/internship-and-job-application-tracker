import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0b0c0e",
          900: "#111216",
          850: "#16181e",
          800: "#1c1f27",
          750: "#222530",
          700: "#2a2e3b",
          600: "#393e4f",
          500: "#555b70",
          400: "#8890a4",
          300: "#b4bac9",
          200: "#d7dbe3",
          100: "#f3f5f8",
          50: "#ffffff",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
    },
  },
  plugins: [],
};

export default config;
