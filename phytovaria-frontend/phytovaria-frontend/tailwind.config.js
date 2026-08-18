/** @type {import('tailwindcss').Config} */
export default {
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
        card: "0 1px 2px rgba(20, 33, 27, 0.04), 0 4px 16px rgba(20, 33, 27, 0.05)",
        "card-hover": "0 4px 10px rgba(20, 33, 27, 0.07), 0 12px 28px rgba(20, 33, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
