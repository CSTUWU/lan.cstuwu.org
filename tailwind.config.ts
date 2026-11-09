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
        // COD4 Military Base Palette
        background: "#111411", // Military Black
        surface: "#181E18",    // Tactical Dark Green Surface
        card: "#202720",       // Operation Panel Card

        // Specified COD4 Colors
        olive: {
          DEFAULT: "#59634A",  // Military Olive Green
          light: "#707D5D",
          hover: "#667254",
          dark: "#3B4231",
          muted: "rgba(89, 99, 74, 0.2)",
        },
        darkGreen: {
          DEFAULT: "#252C24",  // Tactical Dark Green
          light: "#303A2F",
          dark: "#1A2019",
        },
        sand: {
          DEFAULT: "#C2B28A",  // Desert Sand
          light: "#D5C8A6",
          hover: "#D0C39E",
          dark: "#9E8E68",
          muted: "rgba(194, 178, 138, 0.2)",
        },
        khaki: {
          DEFAULT: "#8C876B",  // Muted Khaki
          light: "#A49F83",
          dark: "#68644E",
          muted: "rgba(140, 135, 107, 0.2)",
        },
        gunmetal: {
          DEFAULT: "#343936",  // Gunmetal Grey
          light: "#4B524E",
          border: "#3F4642",
          dark: "#262A28",
        },
        tacticalWhite: "#E5E5DC", // Tactical White

        // Aliased tokens for backwards compatibility (no neon cyan or orange)
        cyan: {
          DEFAULT: "#59634A",  // Mapped to Military Olive Green
          glow: "rgba(89, 99, 74, 0.35)",
          muted: "rgba(89, 99, 74, 0.18)",
          dark: "#3B4231",
        },
        orange: {
          DEFAULT: "#C2B28A",  // Mapped to Desert Sand
          glow: "rgba(194, 178, 138, 0.35)",
          muted: "rgba(194, 178, 138, 0.18)",
          dark: "#9E8E68",
        },

        tactical: {
          border: "#343936",       // Gunmetal Grey
          borderLight: "#474E4A",
          grid: "rgba(89, 99, 74, 0.05)",
          surface2: "#252C24",     // Tactical Dark Green
          hover: "#2A3229",
          gold: "#C2B28A",         // Desert Sand
          green: "#59634A",        // Military Olive Green
          red: "#8F3434",          // Muted Alert Crimson
        },
        primaryText: "#E5E5DC",    // Tactical White
        secondaryText: "#8C876B",  // Muted Khaki
      },
      fontFamily: {
        sans: [
          "Rajdhani",
          "Inter",
          "Roboto Condensed",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "Rajdhani",
          "Oswald",
          "Chakra Petch",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "olive-glow": "0 0 20px rgba(89, 99, 74, 0.35)",
        "sand-glow": "0 0 20px rgba(194, 178, 138, 0.35)",
        "military-card": "0 10px 30px -10px rgba(0, 0, 0, 0.85)",
      },
      clipPath: {
        slant: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      },
    },
  },
  plugins: [],
};
export default config;
