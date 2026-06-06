import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/config/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-heading)", "var(--font-body)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"]
      },
      colors: {
        clinical: {
          50: "#f2faff",
          100: "#dff4ff",
          200: "#b8eaff",
          300: "#77dcff",
          400: "#16d4ff",
          500: "#0aaee8",
          600: "#0b7cff",
          700: "#075fd1",
          800: "#0a4fa8",
          900: "#062a55"
        },
        slateInk: "#0b1830",
        medNavy: "#061124"
      },
      boxShadow: {
        clinical: "0 24px 70px rgba(11, 124, 255, 0.14)",
        glow: "0 18px 50px rgba(22, 212, 255, 0.20)"
      }
    }
  },
  plugins: []
};

export default config;
