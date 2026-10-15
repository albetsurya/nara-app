import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm paper base, ink softened to match Pip outlines
        canvas: "#F7F5F0",
        surface: "#FFFFFF",
        pine: { DEFAULT: "#2F3B54", deep: "#243044", soft: "#E8EDF4" },
        ink: {
          DEFAULT: "#2F3B54",
          soft: "#6B7280",
          faint: "#9CA3AF",
          muted: "#E4E4E7",
        },
        butter: { DEFAULT: "#FDE68A", soft: "#FEF3C7", deep: "#F5CF5B" },
        mint: { DEFAULT: "#6EE7B7", soft: "#D1FAE5", deep: "#34C98F" },
        pebble: { DEFAULT: "#A9B9CE", light: "#D5E3F3", dark: "#5B6B85" },
        peach: "#FDE0D7",
        coral: "#E05D44",
        lavender: "#E8E5F8",
        cyanSoft: "#E0F2FE",
        cyanAccent: "#38BDF8",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"],
      },
      borderRadius: { "3xl": "1.5rem", "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        sticker: "0 2px 8px -2px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        card: "0 4px 16px -4px rgba(0,0,0,0.05), 0 2px 6px -2px rgba(0,0,0,0.03)",
        float: "0 20px 40px -15px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
