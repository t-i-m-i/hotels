# 004 — First tests: Jest unit + Maestro E2E

Bootstrapped testing for the app (there was none). Two representative
tests, not filler.

## Tooling

- **Unit / component: `jest-expo` preset + `@testing-library/react-native`.**
  Bare Jest can't transform Expo SDK 57 / RN 0.86 without the preset.
  Config lives in `package.json` under `"jest"` (preset, `@/*`
  `moduleNameMapper` mirroring `tsconfig.json`, and a
  `transformIgnorePatterns` allowlist that adds `react-native-calendars`,
  `@gorhom/*`, `react-native-reanimated`).
- **New `babel.config.js`** — `jest-expo` needs a project Babel config
  (`babel-preset-expo`). It picks up `app.json`'s `reactCompiler`
  experiment, so tests stay consistent with runtime.
- **Functional / E2E: Maestro**, local iOS simulator only. Flow at
  `.maestro/booking-flow.yaml`.
- Scripts: `bun run test`, `bun run test:watch`, `bun run test:e2e`.
  Deps added under `devDependencies`: `jest`, `jest-expo`,
  `@testing-library/react-native`, `react-test-renderer` (pinned to the
  exact React version, `19.2.3`), `@types/jest`.

### Gotchas

- **Run `bun run test`, not `bun test`.** Bun's built-in runner is not
  Jest-compatible and will not use the preset.
- **`@testing-library/react-native` v14 is async-first.** `renderHook`
  and `render` return promises, and `act()` always returns a thenable.
  Tests must `await renderHook(...)` and `await act(() => ...)`. Calling
  them synchronously silently yields `result.current === undefined` (the
  container's `useEffect` hasn't run yet) and floods the console with
  "overlapping act() calls".
- **`@types/jest` globals weren't auto-picked-up by `tsc`** even though
  the package is installed and `expo/tsconfig.base` sets no `types`
  allowlist. Worked around with a single
  `/// <reference types="jest" />` at the top of the test file rather
  than adding a project-wide `compilerOptions.types` (which would then
  have to re-enumerate every other `@types/*` the app relies on).

## Unit test — `src/hooks/useDateRangeSelection.test.ts`

Covers the "select dates" state machine in
`src/hooks/useDateRangeSelection.ts` (`handleDayPress`): first press sets
check-in; second later press sets check-out and fires `onRangeComplete`
once; an earlier second press moves check-in back; presses on days already
covered by a `bookings` prop are ignored; a second press that would make
the range span a booked day restarts the selection instead of completing
it. Transitively exercises `getDatesInRange` from `src/utils/dateRange.ts`.

## E2E test — `.maestro/booking-flow.yaml` (+ `.maestro/compute-dates.js`)

Launch → deep-link to the Metro bundle → assert hotel list → Search tab →
focus the search pill → type "Barcelona" → open first result → Select
dates → next month → tap the 10th and 13th → Book → assert "Booking
confirmed!" + hotel name on My Bookings. Verified green on the iOS 26.5
simulator (iPhone 17).

Added four `testID`s (the app had none): `hotel-card` (`HotelListItem`),
`select-dates-button` (`HotelDetails`), `book-button` (`hotel/[hotelId]`),
`booking-calendar` (the `<Calendar>` in `HotelBookingSheet`).

### Things that bit us / non-obvious selectors

- **expo-dev-client boots to its launcher menu, not the app.** Neither
  `launchApp` nor a plain relaunch auto-connects to Metro. The flow deep-
  links past it:
  `openLink: hotels://expo-development-client/?url=http://localhost:8081`
  (`localhost` works from the simulator; use the Mac's LAN IP for a
  physical device).
- **`testID`s are JS-level** — a Metro reload picks them up, no native
  rebuild needed. But the *installed binary's* bundle must be the updated
  one, so run `bun start` / `bun run ios` after adding them.
- **The search field is the pill in the bottom tab bar** (iOS
  `role="search"` native tab), not a nav-bar search bar. It has no usable
  `resource-id`, so the flow taps it by point (`50%,95%`) after switching
  to the Search tab via the `magnifyingglass` icon id. The point tap is
  the one screen-size-dependent step; adjust if it misses.
- **`react-native-calendars` arrow id is `booking-calendar.header.rightArrow`**
  (not `.rightArrow`). Day cells are `booking-calendar.day_YYYY-MM-DD` —
  fully deterministic. `compute-dates.js` derives the 10th/13th of next
  month so the picks are always in the future (minDate = today) regardless
  of run date; the flow taps `rightArrow` once to land on that month.
- Maestro's run log prints `${VAR}` / `${output.x}` uninterpolated — that's
  cosmetic; interpolation works (downstream asserts would fail otherwise).

### Prerequisites to run it

- Maestro CLI: `curl -fsSL "https://get.maestro.mobile.dev" | bash`
  (needs JDK 17: `brew install openjdk@17`). Installer edits bash/zsh
  rc files only — for fish, `fish_add_path $HOME/.maestro/bin`.
- iOS driver: `brew trust --formula facebook/fb/idb-companion &&
  brew install facebook/fb/idb-companion`.
- `hotels-api` running at `http://localhost:3000` with the demo seed data.
  "My Bookings" uses the hard-coded demo `userId` in
  `src/api/hooks/useBookings.ts`.
- A dev build on a booted simulator + Metro on :8081: `bun run ios`.
- Then: `bun run test:e2e`.
- `ios/.xcode.env.local` (gitignored) pins `NODE_BINARY` to an absolute
  path — refresh it after an nvm/Homebrew node version bump or the Xcode
  build fails in the Hermes script phase.
- `.maestro/**/*.log` and `/coverage` are gitignored.
