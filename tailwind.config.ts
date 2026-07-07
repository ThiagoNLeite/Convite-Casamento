import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FCFCFA",
        ink: "#2F342B",
        moss: "#5C6653",
        sage: "#8A987D",
        gold: { DEFAULT: "#B0872F", soft: "#C9A45C", pale: "#EFE6D2" },
        mist: "#F4F4EF",
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      letterSpacing: { widest2: "0.3em" },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
