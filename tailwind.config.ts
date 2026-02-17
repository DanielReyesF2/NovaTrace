import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          bg: "#FAFAFA",
          "bg-warm": "#F5F5F7",
          surface: "#FFFFFF",
          "surface-2": "#F2F2F7",
          border: "rgba(0,0,0,0.06)",
          "border-strong": "rgba(0,0,0,0.12)",
          // Brand
          green: "#b5e951",
          "green-dim": "rgba(181,233,81,0.10)",
          navy: "#1d2b36",
          "navy-light": "#2e4050",
          // Accents
          orange: "#E8700A",
          purple: "#7C5CFC",
          blue: "#2D8CF0",
          red: "#DC2626",
          // Text
          ink: "#1d1d1f",
          "ink-light": "#424245",
          muted: "rgba(0,0,0,0.45)",
          "muted-2": "rgba(0,0,0,0.25)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        "soft": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card": "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "elevated": "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        shimmer: "shimmer 1.5s infinite",
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
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
