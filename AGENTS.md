# Agent instructions

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## What this project is

A React Native (Expo Router) app for browsing hotels and viewing them on a
map. See `README.md` for the pitch and `plan.md` for the phased roadmap
(mocked list → map → geolocation → city search → real backend).

## Stack

- Expo SDK 57, Expo Router (file-based routing, typed routes), React 19,
  React Native 0.86.
- `@maplibre/maplibre-react-native` for maps — vector tiles from
  [OpenFreeMap](https://openfreemap.org/) (free, keyless). This is a native
  module: after adding/upgrading it, you must `npx expo prebuild` and
  `expo run:ios` / `expo run:android` to rebuild the native binary. Plain
  `expo start` JS reloads will not pick up native module changes — see
  `docs/logs/001-maplibre-map-screen.md` for the exact failure mode.
- TypeScript, strict mode, `@/*` path alias to `src/`.
- ESLint via `eslint-config-expo` (flat config, `eslint.config.js`). Run
  `npm run lint`.

## Structure

- `src/app/` — Expo Router screens (`index.tsx` list, `map.tsx` map).
- `src/data/` — mocked data (`mockHotels.ts`); will be replaced by real API
  calls in a later phase.
- `src/types/` — shared types (`Hotel`).
- `src/utils/`, `src/constants/` — geo helpers, map config.
- `docs/` — reference docs (current-state, edited in place) plus
  `docs/logs/` (append-only, dated work-session notes — never edit old
  entries, correct in a new one instead). See `docs/README.md`.
- `plan.md` — the living roadmap/phase plan at the repo root.

## Conventions

- Keep the mocked-data → real-backend swap a data-layer-only change; don't
  let UI code assume mocked data shape beyond the `Hotel` type.
- When you finish a non-trivial chunk of work, add a `docs/logs/NNN-*.md`
  entry (what was done, why, anything non-obvious/gotchas) rather than
  editing an old log entry.
