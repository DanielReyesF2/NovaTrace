import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          // Light theme — crema base
          bg: "#FAF8F4",
          "bg-warm": "#F5F1EB",
          surface: "#FFFFFF",
          "surface-2": "#F0ECE4",
          border: "rgba(39,57,73,0.1)",
          "border-strong": "rgba(39,57,73,0.2)",
          // Brand
          green: "#b5e951",
          "green-dim": "rgba(181,233,81,0.12)",
          navy: "#273949",
          "navy-light": "#3a5468",
          // Accents
          orange: "#E8700A",
          purple: "#7C5CFC",
          blue: "#2D8CF0",
          red: "#DC2626",
          // Text
          ink: "#273949",
          "ink-light": "#4A6274",
          muted: "rgba(39,57,73,0.5)",
          "muted-2": "rgba(39,57,73,0.3)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Newsreader", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
