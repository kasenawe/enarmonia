/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        action: {
          DEFAULT: "rgb(var(--color-action) / <alpha-value>)",
          hover: "rgb(var(--color-action-hover) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          dark: "rgb(var(--color-brand-dark) / <alpha-value>)",
          accent: "rgb(var(--color-brand-accent) / <alpha-value>)",
          ink: "rgb(var(--color-brand-ink) / <alpha-value>)",
          muted: "rgb(var(--color-brand-muted) / <alpha-value>)",
        },
        app: {
          text: "rgb(var(--color-app-text) / <alpha-value>)",
          background: "rgb(var(--color-app-background) / <alpha-value>)",
        },
        shell: {
          DEFAULT: "rgb(var(--color-shell) / <alpha-value>)",
          subtle: "rgb(var(--color-shell-subtle) / <alpha-value>)",
          soft: "rgb(var(--color-shell-soft) / <alpha-value>)",
        },
        ink: {
          strong: "rgb(var(--color-ink-strong) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-ink-subtle) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--color-line) / <alpha-value>)",
          subtle: "rgb(var(--color-line-subtle) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          alt: "rgb(var(--color-surface-alt) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
          highlight: "rgb(var(--color-surface-highlight) / <alpha-value>)",
          deep: "rgb(var(--color-surface-deep) / <alpha-value>)",
        },
        outline: {
          DEFAULT: "rgb(var(--color-outline) / <alpha-value>)",
          soft: "rgb(var(--color-outline-soft) / <alpha-value>)",
          strong: "rgb(var(--color-outline-strong) / <alpha-value>)",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
