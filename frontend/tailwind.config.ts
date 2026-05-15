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
      colors: {
        /* 🌑 Mode sombre premium */
        background: "#0B0B0D",          // Noir profond
        surface: "#111113",             // Surface sombre
        "surface-elevated": "#1A1A1D",  // Cartes / panels
        foreground: "#FFFFFF",          // Texte blanc

        /* 🎨 Neutres modernes */
        muted: {
          DEFAULT: "#2A2A2E",
          foreground: "#A1A1AA",
        },

        /* 🔵 Couleur principale (bleu néon premium) */
        primary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
          glow: "#3B82F6",
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

      /* 🎞 Animations modernes */
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.25)" },
          "50%": { boxShadow: "0 0 35px rgba(59,130,246,0.45)" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
