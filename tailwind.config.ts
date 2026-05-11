import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem", xl: "2.5rem", "2xl": "3rem" },
    },
    extend: {
      colors: {
        primary:       "#c8a97e",
        "primary-d":   "#a8895e",
        "primary-l":   "#e8d5b8",
        secondary:     "#2c2c2c",
        muted:         "#888888",
        border:        "#e5e5e5",
        surface:       "#f9f9f9",
      },
      fontFamily: {
        baskerville: ["var(--font-libre-baskerville)", "serif"],
        serif:       ["var(--font-pt-serif)", "serif"],
      },
      maxWidth: { "8xl": "88rem" },
      keyframes: {
        "fade-up":  { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-in": { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
      },
      animation: {
        "fade-up":  "fade-up 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
