import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        orbit: {
          dark: "#1a1a1a",
          darker: "#121212",
          panel: "#242424",
          sidebar: "#242424",
          card: "#2b2b2b",
          "card-hover": "#363636",
          border: "#333333",
          green: "#3dbb61",
          blue: "#0e72ed",
          orange: "#ff742e",
          yellow: "#C1C35E",
          red: "#dd2e44",
          "text-primary": "#ffffff",
          "text-secondary": "#e0e0e0",
          "text-muted": "#a5a5a5",
          "text-dim": "#9ca3af",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "float-up": "floatUp 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatUp: {
          "0%": {
            transform: "translateY(0) scale(0.5) rotate(0deg)",
            opacity: "0",
          },
          "20%": {
            transform: "translateY(-20px) scale(1.2) rotate(-10deg)",
            opacity: "1",
          },
          "80%": {
            transform: "translateY(-80px) scale(1) rotate(10deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-120px) scale(0.8) rotate(0deg)",
            opacity: "0",
          },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGreen: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
