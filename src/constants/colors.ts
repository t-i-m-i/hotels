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
export const colors = {
  primary: palette.vibrantCoral,
  primaryPressed: palette.sweetSalmon,
  primaryDisabled: "#F7B8B2",
  accent: palette.emerald,
  highlight: palette.lightGreen,
  warning: palette.jasmine,
  onPrimary: "#FFFFFF",
} as const;
