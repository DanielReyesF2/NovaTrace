import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: "#0A0A0A",
          surface: "#141414",
          "surface-2": "#1A1A1A",
          border: "rgba(255,255,255,0.06)",
          green: "#00C853",
          "green-dim": "rgba(0,200,83,0.15)",
          orange: "#F97316",
          purple: "#A78BFA",
          blue: "#60A5FA",
          red: "#EF4444",
          muted: "rgba(255,255,255,0.3)",
          "muted-2": "rgba(255,255,255,0.15)",
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
