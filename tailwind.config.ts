import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050308",
          900: "#0a0712",
          800: "#120b1f",
          700: "#1b1229",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 20% -10%, rgba(139,92,246,0.25), transparent 45%), radial-gradient(circle at 100% 0%, rgba(245,158,11,0.12), transparent 40%)",
        "grid-lines":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.15), 0 8px 30px -8px rgba(139,92,246,0.35)",
        "glow-amber": "0 0 0 1px rgba(245,158,11,0.2), 0 8px 30px -8px rgba(245,158,11,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        fall: {
          "0%": { transform: "translateY(-10%)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(420%)", opacity: "0.15" },
        },
        fadeTrail: {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.2)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow": "spinSlow 4s linear infinite",
        float: "floatY 3s ease-in-out infinite",
        sparkle: "sparkle 1.8s ease-in-out infinite",
        fall: "fall 4s linear infinite",
        "fade-trail": "fadeTrail 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
