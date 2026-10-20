import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-overlay": "var(--surface-overlay)",
        "surface-hover": "var(--surface-hover)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        "control-border": "var(--control-border)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          text: "var(--on-accent)",
        },
        obsidian: {
          bg: "#0C0B0A",
          surface: "#141211",
          surface2: "#1C1A17",
          overlay: "#26231F",
          hover: "#1E1C19",
          line: "#2C2824",
          lineStrong: "#3A352F",
          text: "#EFE9DD",
          text2: "#B5AC9C",
          text3: "#9A9183",
          gold: "#D4B26E",
          sidebar: "#11100E",
        },
        pearl: {
          bg: "#F4F4F2",
          surface: "#FFFFFF",
          surface2: "#EDECE8",
          line: "#DDDAD3",
          lineStrong: "#C4C0B6",
          text: "#1B1915",
          text2: "#5A5348",
          bronze: "#7A5818",
        },
        slate: {
          850: "#181614",
          925: "#12100E",
          950: "#0C0B0A",
        },
      },
      boxShadow: {
        "tactile-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "tactile-md": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        "tactile-card": "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        "tactile-card-dark": "0 4px 14px -2px rgba(0, 0, 0, 0.6)",
      },
      fontFamily: {
        display: ["'Fraunces'", "'Amiri'", "serif"],
        sans: [
          "'Instrument Sans'",
          "'IBM Plex Sans Arabic'",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        arabic: [
          "'IBM Plex Sans Arabic'",
          "'Amiri'",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Liberation Mono'",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
