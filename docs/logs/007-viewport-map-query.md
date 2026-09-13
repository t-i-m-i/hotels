# 007 — Viewport-driven map query

Cross-repo change (`hotels-api`, `hotels-web-next`, `hotels`): the map tab no
longer drains every page of `/hotels` on mount. It now calls a new
`GET /hotels/within-bounds` endpoint scoped to the visible viewport, refetched
on pan/zoom.

## What changed

- `src/api/hotels.ts`: added `getHotelsInBounds(bounds, search?)`.
- `src/utils/geo.ts`: added the `Bounds` tuple type (`[west, south, east,
north]`, matches `@maplibre/maplibre-react-native`'s `LngLatBounds`) and
  `bboxAround(center, radiusKm)` for seeding a bbox around a single hotel.
- `src/api/hooks/useHotels.ts`: added `useHotelsInBounds(bounds, search?)`
  (debounced/rounded query key, `keepPreviousData` so pins don't flash empty
  between viewports). **Removed `useAllHotels`** — the drain-every-page
  stopgap it replaced.
- `src/components/HotelMap.tsx`: added an optional `onBoundsChange` prop,
  fired 350ms after `onRegionDidChange` settles. When it's passed, the
  `fitBounds`-to-hotel-set camera effect is skipped (would fight the user's
  own pan) — the `flyTo(selectedHotel)` branch is unaffected.
- `(tabs)/map.tsx`: now `useHotelsInBounds(bounds)` with `bounds` seeded
  `null` and set from `onBoundsChange`.
- `hotel/[hotelId].tsx`: **diverges from the old single-hotel-only map** —
  adopted the web app's "nearby" behaviour. Seeds a 25km bbox around the
  selected hotel via `bboxAround`, then behaves like the map tab once the
  user pans (`onBoundsChange` swaps the seed bbox for the live viewport).
  The selected hotel is force-included in the pin set if the bbox/cap ever
  drops it.

## Gotchas

- `boundsForHotels` now returns `undefined` for an empty hotel array (used to
  throw via `Math.max()` on an empty array → `-Infinity`/`NaN`). Both the
  camera's `initialViewState` and the `fitBounds` effect had to handle that —
  the map tab starts with zero hotels until the first viewport is known.
- `useHotelsInBounds`'s query key rounds bounds to 3 decimal places so
  sub-pixel pans (fired on every animation frame in some gesture cases) don't
  spawn a new cache entry/request per frame.

## UX change to note

`/map` no longer shows a blocking spinner while every page drains — it now
renders the map immediately and pins stream in once the first viewport
settles.
