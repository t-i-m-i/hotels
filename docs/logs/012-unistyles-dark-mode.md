# 012 — Dark mode via react-native-unistyles, headers via React Navigation ThemeProvider

Wanted light/dark support driven by the OS appearance setting. Started with a
plain `useColorScheme` hook returning a `colors` object, but that only works
where colors are needed as JSX props — `StyleSheet.create` runs once at
module load, outside any hook, so it can't react to theme changes without
extra machinery (a `useMemo`-wrapped `makeStyles(colors)` per screen, or
similar). Went with `react-native-unistyles` instead: its `StyleSheet.create`
accepts a `(theme) => ({...})` function and patches native views directly
when the theme changes, no per-screen boilerplate and no React re-render.

## Changes

- Installed `react-native-unistyles` + its peer deps
  (`react-native-nitro-modules`, `react-native-edge-to-edge`,
  `@react-native/normalize-colors`). It's a native module (Nitro/C++), so
  this needed `bunx expo prebuild` — same category of step as the maplibre
  setup in `docs/logs/001-maplibre-map-screen.md`.
- `babel.config.js`: added `react-native-unistyles/plugin` to `plugins`
  (not `presets`) so it runs before `babel-preset-expo`'s injected React
  Compiler plugin. Needs `{ root: "src" }` explicitly — the plugin embeds
  file-relative metadata per `StyleSheet.create` call and errors without a
  configured root.
- `src/unistyles.ts`: registers `light`/`dark` themes built from the
  existing `lightColors`/`darkColors` in `src/constants/colors.ts`, with
  `adaptiveThemes: true` so Unistyles itself watches OS appearance and
  switches — no app-level `useColorScheme` needed. Imported first in
  `src/app/_layout.tsx`, before anything else, since Unistyles must be
  configured before any `StyleSheet.create` call runs.
- Every screen/component whose `StyleSheet.create` used colors switched to
  importing `StyleSheet` from `react-native-unistyles` and to the
  `(theme) => ({...})` form: `hotel/[hotelId].tsx`, `BookingListItem`,
  `HotelDetails`, `HotelList`, `HotelMap` (only the brand-color styles —
  left the floating zoom-control chrome's literal white/shadow as is, it
  sits over map tiles rather than app background). Two places needed color
  outside a stylesheet (a JSX prop, a `useMemo` dependency) — those use the
  `useUnistyles()` hook instead: `booking/[bookingId].tsx` (spinner color),
  `useDateRangeSelection.ts` (calendar selected-range color).
- `src/hooks/useColors.ts` deleted — fully superseded.
- `src/app/_layout.tsx`: wrapped the root `<Stack>` in `ThemeProvider` (from
  `expo-router`, which re-exports React Navigation's own theming under the
  hood) with a `navigationTheme` built from `theme.colors` via
  `useUnistyles()`. Needed separately from the Unistyles setup above —
  native-stack's header (background/tint/border) reads React Navigation's
  own `Theme` object, not Unistyles state, and without this it kept
  rendering React Navigation's built-in light theme regardless of the
  Unistyles theme.

## Gotchas

- Unistyles theming and React Navigation theming are two unrelated systems
  that happen to both need wiring for a consistent look: Unistyles owns
  anything routed through its `StyleSheet.create`/`useUnistyles`; React
  Navigation's `Theme` (via `ThemeProvider`/`useTheme`) separately owns
  native-stack/tab-bar chrome. `NativeTabs`'s `iconColor` prop is neither —
  it's a plain prop read live from `useUnistyles()` in
  `src/app/(tabs)/_layout.tsx`.
- Prebuild + Babel plugin config changes aren't picked up by an already
  running Metro — needed a full stop/restart (or `--clear`) after editing
  `babel.config.js`, otherwise got a cryptic "Babel plugin requires `root`
  option to be set" even after adding it.
- Screens/components not touched in this pass still have some hardcoded
  literal colors (mostly on `HotelMap`'s floating zoom controls, and a few
  greys) — intentionally left alone since they're either map-chrome sitting
  over tiles (not app background) or out of scope for this pass.
