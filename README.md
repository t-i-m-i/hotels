# Hotels

A mobile app for discovering hotels on an interactive map, built as a
portfolio project to demonstrate mobile app development end to end, from UI
to geolocation.

**What it does:** browse a list of hotels, tap one to fly to it on the map,
search by name or location, and book a stay (with a My Bookings tab), and
(planned) find hotels near your current location.

<video
  src="https://github.com/user-attachments/assets/19dc83d6-8dda-4b36-923a-f9beb7385714"
  controls
  muted
  playsinline
  width="332"
  height="720">
</video>

## Why this project

This is a hands-on sample of my mobile development work, a real, runnable
app rather than a slide deck. It's built the way I'd approach a production
feature: a phased roadmap, working software at every step, and decisions
documented as they're made (see `plan.md` and `docs/`).

## Tech stack

- **React Native + Expo (SDK 57)**: cross-platform app (iOS, Android)
  from a single TypeScript codebase.
- **Expo Router**: file-based navigation, with a native (Liquid Glass on
  iOS) bottom tab bar and a search tab.
- **MapLibre GL**: open-source, vector-tile maps (via
  [OpenFreeMap](https://openfreemap.org/)), no paid API keys required.
- **[`hotels-api`](https://github.com/t-i-m-i/hotels-api)** (a sibling repo): a NestJS backend
  with an OpenAPI-documented REST API, backed by a real Postgres database
  (hotels, users, and bookings), with routes to list/search hotels and to
  create and list bookings. No auth wired up yet.
- **openapi-typescript + openapi-fetch + TanStack Query**: the app
  consumes the backend through a fully typed pipeline: OpenAPI spec to
  generated TS types to typed fetch client to domain wrappers to query
  hooks. Nothing hand-duplicates the API's shape.
- **ESLint + Prettier** for code quality/style.
- **bun** as the package manager and script runner in both repos.
- Planned: geolocation ("find hotels near me") and geospatial queries via
  **PostGIS** behind `hotels-api`, plus authentication (see `plan.md`).

## Project status

Actively in progress. Current phase: hotel list, map, search, and hotel
bookings (Explore / Map / Search / My Bookings tabs), all backed by a real
NestJS + Postgres API. Next up: authentication, and "find hotels near me"
via geolocation + PostGIS. See `plan.md` for the full roadmap and
`docs/logs/` for a running log of design decisions.

## Testing

| Command | What it does |
|---|---|
| `bun run test` | Unit tests (Jest + `jest-expo` preset + `@testing-library/react-native`). |
| `bun run test:watch` | Unit tests in watch mode. |
| `bun run test:e2e` | Maestro happy-path e2e (`.maestro/booking-flow.yaml`): search, open a hotel, book a date range, confirm on My Bookings. |

`test:e2e` needs, in order: `hotels-api` running locally with the demo seed data, a dev build installed
on a booted simulator (`bun run ios`, once), and Maestro + idb-companion installed — see
`docs/logs/004-testing-setup.md` for the full setup.

**To get cleanup working, Metro has to be started with an extra env var:**

```bash
EXPO_PUBLIC_E2E_TEST_MODE=true bun start
```

The flow books a real hotel in the shared database. `EXPO_PUBLIC_E2E_TEST_MODE=true` makes the app tag
that booking (`X-Synthetic-Booking: true`, see `src/api/client.ts`) so the flow's last step can delete it
in bulk via `hotels-api`'s `DELETE /bookings/synthetic`, instead of guessing which row it created by
hotel name and dates. `EXPO_PUBLIC_*` vars are baked into the JS bundle when Metro serves it — plain
`bun start` (no env var) is what you want for everyday manual dev/QA, since that never tags bookings as
synthetic. Forgetting the env var before running Maestro doesn't fail the flow — it just leaves the
booking behind, tagged as a real one. See `docs/logs/005-maestro-booking-cleanup.md` and
`docs/logs/006-synthetic-booking-tag.md` for how this evolved, and `hotels-api`'s
`docs/guides/testing-against-production-patterns.md` for the reasoning behind tagging synthetic data
instead of matching on hotel name/dates.

## About me

Hi, I'm Tymoteusz.
I'm a full-stack developer working across frontend, backend, and user experience.
I build native mobile apps, backend APIs, and work with databases.
I'm looking for an opportunity to keep growing as a software engineer.
