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
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        success: "hsl(var(--success))",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },

      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-primary": "var(--gradient-primary)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
