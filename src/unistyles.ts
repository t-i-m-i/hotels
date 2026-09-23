// Import this before anything else in the app — before any StyleSheet.create
// call — so Unistyles is configured before styles are registered. See
// src/app/_layout.tsx.
import { StyleSheet } from "react-native-unistyles";

import { Colors, darkColors, lightColors } from "@/constants/colors";

type AppTheme = { colors: Colors };

const appThemes = {
  light: { colors: lightColors },
  dark: { colors: darkColors },
} satisfies Record<string, AppTheme>;

StyleSheet.configure({
  themes: appThemes,
  settings: { adaptiveThemes: true },
});

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: AppTheme;
    dark: AppTheme;
  }
}
