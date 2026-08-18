/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        border: "var(--color-border)",
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent-light)",
        },
        risk: {
          low: "var(--color-risk-low)",
          "low-bg": "var(--color-risk-low-bg)",
          medium: "var(--color-risk-medium)",
          "medium-bg": "var(--color-risk-medium-bg)",
          high: "var(--color-risk-high)",
          "high-bg": "var(--color-risk-high-bg)",
          unknown: "var(--color-risk-unknown)",
          "unknown-bg": "var(--color-risk-unknown-bg)",
        },
        base: {
          a: "var(--color-base-a)",
          t: "var(--color-base-t)",
          c: "var(--color-base-c)",
          g: "var(--color-base-g)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(20, 33, 27, 0.05), 0 8px 24px rgba(20, 33, 27, 0.04)",
        "card-hover": "0 4px 12px rgba(20, 33, 27, 0.06), 0 16px 32px rgba(20, 33, 27, 0.08)",
        "nav-active": "inset 3px 0 0 var(--color-primary)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
