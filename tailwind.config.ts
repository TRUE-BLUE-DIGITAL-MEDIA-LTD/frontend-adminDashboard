import type { Config } from "tailwindcss";
const config: Config = {
  // `dark:` follows the theme toggle (html.light / .theme-light-scope), not the OS.
  darkMode: ["variant", "&:not(.light *):not(.theme-light-scope *)"],
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Poppins: ["Poppins", "sans-serif"],
      },
      transitionProperty: {
        width: "width",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "icon-color": "#62C7D8",
        "supper-main-color": "#FFFFFF",
        "main-color": "#00ABE4",
        "second-color": "#E9F1FA",
        // Theme tokens — values live in styles/globals.css
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: {
          DEFAULT: "rgb(var(--panel) / <alpha-value>)",
          raised: "rgb(var(--panel-raised) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        hover: "var(--hover)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        scrim: "var(--scrim)",
      },
      // Bare `border` / `divide-*` (no color) follow the theme instead of gray-200.
      borderColor: {
        DEFAULT: "var(--line)",
      },
    },
  },
  plugins: [],
};

export default config;
