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
          925: "#08050e",
          900: "#0a0712",
          850: "#0e0918",
          800: "#120b1f",
          750: "#160e26",
          700: "#1b1229",
        },
        violet: {
          50: "#f4f0ff",
          100: "#e6dcff",
          200: "#cfbcff",
          300: "#b294fc",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        gold: {
          300: "#f3e0a8",
          400: "#e8c877",
          500: "#d4a94f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 20% -10%, rgba(139,92,246,0.25), transparent 45%), radial-gradient(circle at 100% 0%, rgba(245,158,11,0.12), transparent 40%)",
        "radial-glow-soft":
          "radial-gradient(circle at 15% -10%, rgba(139,92,246,0.16), transparent 40%), radial-gradient(circle at 90% 10%, rgba(212,169,79,0.08), transparent 35%), radial-gradient(circle at 50% 120%, rgba(139,92,246,0.10), transparent 45%)",
        "grid-lines":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "sheen-sweep":
          "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.22) 52%, transparent 70%)",
        "border-glow": "linear-gradient(135deg, rgba(167,139,250,0.6), rgba(212,169,79,0.35), rgba(167,139,250,0.15))",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.15), 0 8px 30px -8px rgba(139,92,246,0.35)",
        "glow-amber": "0 0 0 1px rgba(245,158,11,0.2), 0 8px 30px -8px rgba(245,158,11,0.35)",
        "glow-lg": "0 0 0 1px rgba(139,92,246,0.18), 0 20px 60px -15px rgba(139,92,246,0.5)",
        elevate: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 12px 32px -12px rgba(0,0,0,0.65)",
        "elevate-lg": "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 30px 70px -20px rgba(0,0,0,0.75)",
        "elevate-hover":
          "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(139,92,246,0.25), 0 24px 55px -18px rgba(139,92,246,0.45)",
        premium:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 25px 60px -20px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        sheen: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "250% 0" },
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
        borderFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 3s linear infinite",
        sheen: "sheen 2.8s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow": "spinSlow 4s linear infinite",
        float: "floatY 3s ease-in-out infinite",
        sparkle: "sparkle 1.8s ease-in-out infinite",
        fall: "fall 4s linear infinite",
        "fade-trail": "fadeTrail 0.6s ease-out forwards",
        "border-flow": "borderFlow 6s ease infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
