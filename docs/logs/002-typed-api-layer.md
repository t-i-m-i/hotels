# 002 — Type-safe API layer against the new `hotels-api` backend

## What we did

Stood up a sibling NestJS backend (`hotels-api`, separate repo at
`../hotels-api`) and wired this app to consume it through a fully typed
pipeline instead of the local `mockHotels.ts` array:

```
Components → TanStack Query hooks → API wrapper functions
           → openapi-fetch typed client → NestJS REST API
```

This is a demo project with no real auth and no real database yet — both
got a deliberate, obvious seam for later instead of being implemented.

### Backend side (see `hotels-api/docs/logs/`)

The 5 mock hotels moved server-side into `HotelsService` as `HotelDto[]`,
exposed via `GET /hotels?search=` and `GET /hotels/:id`. `@nestjs/swagger`
generates an OpenAPI document (`bun run generate:openapi` →
`hotels-api/docs/openapi.json`, committed) from explicit `@ApiProperty()`
decorators on the DTOs — not the Swagger CLI plugin's auto-inference, kept
explicit on purpose for a small demo.

### Frontend side (this repo)

New `src/api/` directory, generated code kept separate from handwritten:

- `src/api/generated/schema.d.ts` — `openapi-typescript` output, committed,
  regenerated via `bun run generate:api-types` (reads
  `../hotels-api/docs/openapi.json` directly — a relative path across the
  two sibling repos, not a live server call, so codegen works offline and
  doesn't require the backend to be running).
- `src/api/client.ts` — a single shared `openapi-fetch` client, typed
  against the generated `paths`. Base URL comes from
  `EXPO_PUBLIC_API_URL` (new env var — Expo inlines `EXPO_PUBLIC_*`
  automatically, no `expo-constants` needed even though that package was
  already an unused dependency in this repo). A request middleware calls
  `getAuthHeaders()` and merges the result into every outgoing request.
- `src/api/auth.ts` — `getAuthHeaders()` returns `{}` today. This is the
  entire auth "system": a no-op function that's already wired into the
  request path, so adding real JWT/token headers later is a one-function
  change, not a client rewrite.
- `src/api/hotels.ts` — hand-written domain wrappers (`getHotels(search?)`,
  `getHotel(id)`) built on the generated types
  (`components["schemas"]["HotelDto"]`) — no manually duplicated `Hotel`
  interface. The old `src/types/hotel.ts` was deleted; `Hotel` is now
  re-exported from `src/api/hotels.ts`.
- `src/api/hooks/useHotels.ts` / `useHotel.ts` — thin TanStack Query
  wrappers around the above. Components only ever call these, never the
  client or wrappers directly.
- `src/app/_layout.tsx` now wraps the root `Stack` in a single shared
  `QueryClientProvider` — required for any hook to work at all.

### Consumer rewiring

Three places imported `mockHotels` directly; all three now go through
`useHotels()`/`useHotel()`:

- `(tabs)/index.tsx` — the hotel list. This is also where `isLoading`/
  `isError` states got added for the first time; the old static-array
  version had no loading/error handling because there was nothing to wait
  on or fail.
- `hotel/[hotelId].tsx` and `(tabs)/map.tsx` — both call `useHotels()` for
  the full list (needed for bounds-fitting and rendering all markers) and
  pass it down as a prop.
- `src/components/HotelMap.tsx` — changed from importing `mockHotels`
  itself to accepting a `hotels: Hotel[]` prop. This was a deliberate
  consistency fix: `HotelMap` had already been made prop-driven for
  `selectedHotelId` in an earlier session specifically so it wouldn't need
  route/data awareness of its own (see 001's spirit, or just: dumb
  components shouldn't reach into global data). Importing `mockHotels`
  directly broke that pattern the moment it needed to become the *fetched*
  array instead of a static one — now both `selectedHotelId` and `hotels`
  come in as props, and `HotelMap` has zero fetching or routing knowledge.

`src/data/mockHotels.ts` and `src/types/hotel.ts` are deleted — nothing
references them anymore.

## Non-obvious things / gotchas

- **`openapi-fetch`'s success-response type can still be `undefined`.**
  `GET /hotels/{id}` returning `{ data, error }` has `data` typed as
  possibly `undefined` even when `error` is falsy (the generated types
  don't encode "200 always has a body" as a guarantee). `getHotel()` in
  `src/api/hotels.ts` has to check `error || !data` and throw either the
  real error or a synthesized one — a plain `if (error) throw error;
  return data;` fails to typecheck.
- **Pure-JS deps, no native rebuild needed.** `openapi-fetch`,
  `openapi-typescript`, `@tanstack/react-query` are all JS/TS-only, so
  unlike MapLibre (see 001) this didn't need `expo run:ios` — a plain
  Metro/JS reload picked everything up.
- **Verifying against a real network round-trip, not just types passing.**
  To confirm the app was actually hitting the backend and not some cached
  bundle, we killed the Nest dev server mid-session, force-relaunched the
  installed dev-client app, and confirmed the list flipped to "Couldn't
  load hotels." (react-query's default retries visibly delay this by a
  few seconds before the error state renders) — then brought the backend
  back and confirmed it recovered. Worth doing this kind of check whenever
  "it typechecks" is the only evidence a network layer works.
- **Known pre-existing UI gap, unrelated to this work:** the "View all on
  map" button that used to render above the hotel list (`ListHeaderComponent`
  in `(tabs)/index.tsx`) isn't showing up on screen. Confirmed via `git
  diff` that this JSX is byte-for-byte unchanged from before this session
  — likely a layout/safe-area regression from the native-tabs migration,
  not something introduced here. Not fixed as part of this log entry;
  flagged for a follow-up.

## Env / setup

New file: `.env.example` (`EXPO_PUBLIC_API_URL=http://localhost:3000`).
Local value lives in `.env.local` (already covered by this repo's existing
`.gitignore` pattern for `.env*.local` — no gitignore change needed).
Requires `hotels-api` running locally (see its own `docs/logs/`) for the
app to load any data at all; there's no offline/mock fallback anymore.
