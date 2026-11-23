import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm restaurant-inspired color palette (Karaikudi Chettinad heritage theme)
        brand: {
          50: "#fdf8f5",
          100: "#faefe8",
          200: "#f5ddcf",
          300: "#ecc2ab",
          400: "#df9b76",
          500: "#d37449", // Rich Terracotta / Saffron Orange
          600: "#c45a33",
          700: "#9f4326",
          800: "#7c3521",
          900: "#441a0e", // Deep Chettinad Dark Brown
          950: "#270d07",
        },
        cream: {
          50: "#fffefb",
          100: "#fefcf6",
          200: "#fbf6e8",
          300: "#f6edd4",
          400: "#ecdbb0",
        },
        amberGold: {
          500: "#e58e26",
          600: "#c77519",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};
export default config;
