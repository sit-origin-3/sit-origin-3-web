import type { Config } from "tailwindcss";

type ColorShades = Record<string, string>;

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

function withOpacityVariants(shades: ColorShades): ColorShades {
  const expanded: ColorShades = {};
  for (const [shade, hex] of Object.entries(shades)) {
    expanded[shade] = hex;
    const [r, g, b] = hexToRgb(hex);
    for (let opacity = 1; opacity <= 9; opacity++) {
      expanded[`${shade}${opacity}0`] = `rgba(${r}, ${g}, ${b}, ${opacity / 10})`;
    }
  }
  return expanded;
}

const zpd: ColorShades = {
  100: "#f0f8f6",
  200: "#c2e4db",
  300: "#95d0bf",
  400: "#67bca4",
  500: "#5da994",
  600: "#529683",
  700: "#3e7162",
  800: "#2e554a",
  900: "#244239",
};

const fox: ColorShades = {
  100: "#ffeae0",
  200: "#fbcab3",
  300: "#f6aa85",
  400: "#f28a57",
  500: "#cc7246",
  600: "#a75a35",
  700: "#814324",
  800: "#5c2b13",
  900: "#361302",
};

const neutral: ColorShades = {
  200: "#d9dbdb",
  300: "#b3b7b7",
  400: "#8e9394",
  500: "#5c6364",
  600: "#2a3435",
  700: "#182324",
  800: "#0e191a",
  900: "#041011",
};

const pawp: ColorShades = {
  400: "#fb7185",
  500: "#f43f5e",
};

const jungle: ColorShades = {
  400: "#5be3b6",
  500: "#10b981",
};

export default {
  theme: {
    extend: {
      colors: {
        zpd: withOpacityVariants(zpd),
        fox: withOpacityVariants(fox),
        neutral: withOpacityVariants(neutral),
        pawp: withOpacityVariants(pawp),
        jungle: withOpacityVariants(jungle),
      },
      fontFamily: {
        sans: ["Lato", "Noto Sans Thai", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        h1: ["2rem", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["1.5rem", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg": ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        cartoon:
          "0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 2px rgba(255, 255, 255, 0.5)",
        hard: "4px 4px 0px rgba(0, 0, 0, 0.15)",
      },
    },
  },
} satisfies Config;
