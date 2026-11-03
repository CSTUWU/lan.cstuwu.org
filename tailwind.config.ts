import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: "#101820",
        card: "#151E27",
        cyan: {
          DEFAULT: "#00D5FF",
          glow: "rgba(0, 213, 255, 0.4)",
          muted: "rgba(0, 213, 255, 0.15)",
          dark: "#008ba8",
        },
        orange: {
          DEFAULT: "#FF7438",
          glow: "rgba(255, 116, 56, 0.4)",
          muted: "rgba(255, 116, 56, 0.15)",
          dark: "#b84715",
        },
        tactical: {
          border: "#1E2B38",
          borderLight: "#2A3B4D",
          grid: "rgba(255, 255, 255, 0.03)",
          surface2: "#18232E",
          hover: "#1E2B38",
          gold: "#F5A623",
          green: "#00E599",
          red: "#FF3355",
        },
        primaryText: "#F5F7FA",
        secondaryText: "#8996A3",
      },
      fontFamily: {
        sans: [
          "Rajdhani",
          "Montserrat",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Chakra Petch",
          "Rajdhani",
          "Impact",
          "sans-serif",
        ],
        mono: [
          "Consolas",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        "cyan-glow": "0 0 25px rgba(0, 213, 255, 0.35)",
        "orange-glow": "0 0 25px rgba(255, 116, 56, 0.35)",
        "tactical-card": "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
      },
      clipPath: {
        slant: "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
      },
    },
  },
  plugins: [],
};
export default config;
