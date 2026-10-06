import { StyleSheet } from "react-native-unistyles";

/**
 * Shared, theme-aware style snippets for patterns that repeat across
 * screens/components (e.g. `color: theme.colors.text` showing up in every
 * file that renders themed text). Spread or combine these with a
 * component's own `StyleSheet.create` styles via a style array:
 *
 *   <Text style={themeStyles.text} />
 *   <Text style={[styles.emptyState, themeStyles.text]} />
 *
 * Keep this list to things you've actually repeated — not a full design
 * system. Uncomment/add entries as real duplication shows up, following
 * the `<role>` naming pattern (no `themeColors` prefix — the module name
 * already says that).
 *
 * Two things to keep in mind as this file grows:
 * 1. If a *text* callsite keeps needing `[styles.foo, themeStyles.text]`,
 *    consider a small `ThemedText` component instead (applies
 *    `theme.colors.text` as the base, with `style` able to override) —
 *    but only once there are enough callsites to justify it.
 * 2. Resist adding variants (size, weight, spacing, etc.) here — that's
 *    the slide into "a second Tailwind." If a style needs more than a
 *    single color/background property, it belongs in the component's own
 *    `StyleSheet.create`, not here.
 */
export const themeStyles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.text,
  },

  // textMuted: {
  //   color: theme.colors.textMuted,
  // },

  // primary: {
  //   color: theme.colors.primary,
  // },

  // background: {
  //   backgroundColor: theme.colors.background,
  // },

  // surface: {
  //   backgroundColor: theme.colors.surface,
  // },

  // border: {
  //   borderColor: theme.colors.border,
  // },

  headerView: {
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLink: {
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  headerLinkText: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 15,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
