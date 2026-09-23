/**
 * Color scheme — swap these hex values to try a different generated
 * palette without touching any component.
 */
export const palette = {
  vibrantCoral: "#EE6055",
  emerald: "#60D394",
  lightGreen: "#AAF683",
  jasmine: "#FFD97D",
  sweetSalmon: "#FF9B85",
} as const;

/** Semantic aliases used throughout the app — point these at the palette above. */
// brand colors mostly stay the same in dark/light mode
const brand = {
  primary: palette.vibrantCoral,
  primaryPressed: palette.sweetSalmon,
  accent: palette.emerald,
  highlight: palette.lightGreen,
  warning: palette.jasmine,
  onPrimary: "#FFFFFF",
};

export const lightColors = {
  ...brand,
  primaryDisabled: "#F7B8B2",
  background: "#F2F2F7",
  surface: "#F6F6F6",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E5E5E5",
};

export type Colors = { [K in keyof typeof lightColors]: string };

// typing darkColors as Colors means TypeScript will complain if we add a key to one list and forget the other.
export const darkColors: Colors = {
  ...brand,
  primaryDisabled: "#7A3A35",
  background: "#0E0E0E",
  surface: "#1A1A1A",
  text: "#F2F2F2",
  textMuted: "#A0A0A0",
  border: "#2A2A2A",
};
