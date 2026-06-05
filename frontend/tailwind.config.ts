import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },

    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },

      colors: {
        /* Sombre premium */
        background: "#0B0B0D",
        surface: "#111113",
        "surface-elevated": "#1A1A1D",
        foreground: "#FFFFFF",

        /* Sections claires — alternance sombre/clair */
        light: {
          bg: "#F8FAFC",
          surface: "#F1F5F9",
          border: "#E2E8F0",
          muted: "#64748B",
          text: "#1E293B",
        },

        /* Neutres */
        muted: {
          DEFAULT: "#2A2A2E",
          foreground: "#A1A1AA",
        },

        /* Bleu principal */
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
          glow: "#3B82F6",
        },

        /* Orange CTA — Trust & Authority (UIPro recommendation) */
        cta: {
          DEFAULT: "#F97316",
          hover: "#EA6C00",
          foreground: "#FFFFFF",
        },

        /* 🟥 Danger / erreurs */
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },

        /* 🟢 Succès */
        success: "#10B981",

        /* 🧱 Bordures */
        border: "#2D2D31",
        "border-strong": "#3A3A3F",

        /* 🖊 Inputs */
        input: "#1A1A1D",

        /* 🔔 Focus ring */
        ring: "#3B82F6",
      },

      /* 🟦 Radius premium */
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
      },

      /* 🌈 Dégradés modernes */
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #0B0B0D 0%, #111113 50%, #1A1A1D 100%)",
        "gradient-primary":
          "linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)",
      },

      /* ✨ Ombres premium */
      boxShadow: {
        glow: "0 0 25px rgba(59, 130, 246, 0.35)",
        card: "0 4px 20px rgba(0,0,0,0.35)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.25)" },
          "50%": { boxShadow: "0 0 35px rgba(59,130,246,0.45)" },
        },
        "pulse-glow-orange": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(249,115,22,0.3)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "dot-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-orange": "pulse-glow-orange 2s ease-in-out infinite",
        marquee: "marquee 36s linear infinite",
        "dot-pulse": "dot-pulse 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
