/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "rgb(var(--c-bg) / <alpha-value>)",
                "bg-secondary": "rgb(var(--c-bg-secondary) / <alpha-value>)",
                panel: "rgb(var(--c-panel) / <alpha-value>)",
                "panel-secondary": "rgb(var(--c-panel-secondary) / <alpha-value>)",
                border: "rgb(var(--c-border) / <alpha-value>)",
                ink: "rgb(var(--c-ink) / <alpha-value>)",
                "ink-muted": "rgb(var(--c-ink-muted) / <alpha-value>)",
                accent: "rgb(var(--c-accent-rgb) / <alpha-value>)",
                "accent-dim": "rgb(var(--c-accent-dim-rgb) / <alpha-value>)",
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                ],
                display: [
                    "Source Serif 4",
                    "Georgia",
                    "serif",
                ],
            },
        },
    },
    plugins: [],
};