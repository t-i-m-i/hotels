# Nearest hotels screen

The guest hotel list now has a "Find nearest" link to a dedicated
`/nearest` screen. It asks for the device location, fetches hotels within
300 km from the API (paginated, nearest first) and shows how far each one
is. See `hotels-api`'s own log entry (014) for the endpoint changes behind
it.

## What changed

- `src/app/nearest.tsx` (new): root-level screen (like `map` and
  `hotel/[hotelId]`), pushed on top of the tabs. Locates on mount, then
  renders the shared `HotelList` with its own header (a "Refresh location"
  button with a spinner, plus the permission/GPS error message).
- `src/hooks/useCurrentLocation.ts` (new): wraps
  `expo-location` in `useQuery` (`retry: false`, `gcTime: 0`, no refetch on
  focus/reconnect). `isLocating` is `isFetching`, the error message comes
  from the query error, and `getCurrentLocation` is `() => refetch()`.
- `src/components/HotelList.tsx`: no longer knows anything about location.
  The "Locate me" state and button moved out; it now takes an optional
  `headerComponent` (a `ReactElement`, passed as `ListHeaderComponent`) and
  `safeAreaEdges` (default `["top"]`, `/nearest` passes `[]` because the
  stack header already covers the top). `src/app/(guest)/(tabs)/index.tsx`
  supplies its own header with "View all on map" and "Find nearest".
- `src/styles/themeStyles.ts`: `headerView` / `headerLink` /
  `headerLinkText`, shared by both headers.
- `src/api/hotels.ts` + `src/api/hooks/useHotels.ts`: `getNearestHotels`
  and `useNearestHotels` (infinite query, same `getNextPageParam` as
  `useHotels`). The query key rounds coordinates to 3 decimals (~100 m) so
  GPS jitter between refreshes doesn't create a new cache entry per
  refresh; `placeholderData: keepPreviousData` keeps the old list on screen
  while a refresh loads.
- `src/api/generated/schema.d.ts`: regenerated
  (`bun run generate:api-types`) — `/hotels/nearest` now takes `page` /
  `pageSize`, returns `PaginatedHotelsDto`, and `HotelDto` has an optional
  `distanceMeters`.
- `src/utils/geo.ts`: `formatDistance(meters)` ("850 m", "1.2 km", "12 km").
  `HotelListItem` appends ` · 12 km away` to the location line when
  `hotel.distanceMeters` is present — only nearest results carry it, so the
  other lists look unchanged.
- `src/api/client.ts`: a dev-only (`__DEV__`) `openapi-fetch` middleware
  that logs one line per request (`[api] GET <url>`) to Metro. Method and
  URL only — no headers (auth) or bodies.

## Gotchas

- **`enabled: lng !== null` is wrong for an `undefined` coordinate.** While
  locating, `location?.coords.longitude` is `undefined`, not `null`, so the
  first version fired a request with no coordinates (a 400 and a flash of
  "Couldn't load hotels."). The request log made this obvious. It's
  `lng !== undefined && lat !== undefined` now, and `queryFn` is the only
  place that asserts the values are numbers.
- **Don't use `useState` + `useEffect` for the location.** The first
  version did and tripped `react-hooks/set-state-in-effect`; it also left
  `isLocating` stuck on `true` after a denied permission (an early
  `return` skipped the reset). A query has no such states to get wrong.
- **Wrap `refetch` before handing it to `onPress`.** `onPress` calls its
  handler with the press event, and `refetch`'s first parameter is an
  options object — hence `() => refetch()`.
- **Keep the list mounted when location fails.** An early version swapped
  the whole `HotelList` for an error message, which also removed the
  "Refresh location" button (it lives in the list header) — no way to
  retry. The message now renders inside the header instead. With no
  location the empty state still says "No hotels found." under the
  permission message; left as is, since the message above explains it.
- **The API server must be rebuilt/restarted** to see `distanceMeters`: it
  was running a stale `dist/` build and the field silently never appeared.
  Check with `curl` before debugging the app.
