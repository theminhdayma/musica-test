/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "border-strong": "#cfdfee",
        "border-light": "#e3edf6",
        "text-mute": "#7c8da3",
        "text-soft": "#455a73",
        "bg-soft": "#f6f9fc",
        "bg-mute": "#eef4fa",
        "primary": "#0055c8",
        "secondary": "#006b5f",
        "tertiary": "#006383",
        "background": "#f8f9ff",
        "surface": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dde9ff",
        "surface-container-highest": "#d3e3ff",
        "on-surface": "#0a1c31",
        "on-surface-variant": "#424654",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "primary-fixed": "#d9e2ff",
        "secondary-fixed": "#71f8e4",
        "primary-container": "#1f6df0",
        "secondary-container": "#6df5e1",
        "tertiary-container": "#007da5",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
      },
      borderRadius: {
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        "body-md": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "numeric-data": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "label-caps": ["Plus Jakarta Sans", "Inter", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
