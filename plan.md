# Hotels App: Plan

## Decisions (answers to open questions)

**Maps: MapLibre GL Native, not react-native-maps / Google Maps**

- Google Maps requires a billed API key even for light demo traffic (free tier still needs billing enabled), so it's out.
- `react-native-maps` can point at raw OSM XYZ tiles via a custom tile overlay, but there's no official free vector-tile source for it, and Android OSM tile loading is informally discouraged by OSM (they've rate-limited/blocked abusive apps before).
- **MapLibre GL Native** (`@maplibre/maplibre-react-native`) renders vector tiles from _any_ style URL. Free vector tile sources built on OSM data:
  - [OpenFreeMap](https://openfreemap.org/): fully free, no key, no rate limit, self-hostable if needed later.
  - [MapTiler](https://www.maptiler.com/) free tier: generous free quota, needs an API key.
  - Start with OpenFreeMap since it's demo-friendly with zero setup; can swap the style URL later.
  - Requires an Expo config plugin (`@maplibre/maplibre-react-native/plugin`) added to `app.json`, which needs a dev build/prebuild and won't run in plain Expo Go.
- MapLibre's camera API (`camera.setCamera({ centerCoordinate, zoomLevel, animationDuration, animationMode })`) handles animated recentering/zooming natively, so no custom animation code is needed.

**Geocoding (city name to lat/lon): free, works with mocked or real data**

- Use **Nominatim** (OSM's official geocoder, `nominatim.openstreetmap.org/search`): free, no key. Usage policy: max ~1 req/sec, must set a `User-Agent`/referer, no heavy/commercial bulk use. Fine for a demo, and calls should be proxied through our own backend later so we can cache and respect the rate limit centrally.
- Alternative if we outgrow Nominatim's rate limit: **Photon** (komoot, also OSM-data-based, free, no key, more lenient fair-use policy).
- This works today even against the mocked array: geocode the typed city to get `{lat, lon}`, compute haversine distance to each mocked hotel client-side, then sort. Same shape of call will later hit our backend instead of doing the distance math client-side.

**Nearest-hotel queries in PostgreSQL: yes, via PostGIS**

- Add the `postgis` extension, store hotel location as `geography(Point, 4326)`, add a GiST index on it.
- "Nearest N hotels to point" becomes a KNN query: `ORDER BY location <-> ST_MakePoint(:lon, :lat)::geography LIMIT :n`, which is index-accelerated with no need to compute distances in app code.
- "Hotels within radius" becomes `WHERE ST_DWithin(location, ST_MakePoint(:lon,:lat)::geography, :meters)`.
- This is a standard, well-supported pattern.

## Phased roadmap

### Phase 1: Mocked hotel list (done)

- `Hotel` type: `id`, `name`, `description`, `location` (display string, e.g. "Barcelona, Spain"), `geo: { latitude, longitude }`.
- 5 mocked hotels at the city centers of Barcelona, Málaga, Rome, Verona, Salzburg.
- Single list screen (`src/app/index.tsx`) rendering the mocked hotels, no map yet.

### Phase 2: Map screen (done)

- Add `@maplibre/maplibre-react-native` + config plugin, point at an OpenFreeMap style, prebuild a dev client (won't run in Expo Go).
- Tapping a hotel in the list animates the map camera to that hotel's geo point.

### Phase 3: Real backend (done, moved up ahead of the original order)

- Stood up `hotels-api` (NestJS) backed by real Postgres, replacing the mocked hotel array.
- `hotels`, `users`, and `bookings` tables (plain `latitude`/`longitude` columns; PostGIS not added yet, see Phase 5).
- Client-side data-fetching shape stayed the same, so the mocked → real swap was a data-layer change only, not a UI change (per `AGENTS.md` conventions).

### Phase 4: Search and bookings (done, added ahead of the original plan)

- Text search (`GET /hotels?search=`) filtering by name/location, wired to a debounced search tab.
- Bookings: create a booking for a hotel + date range, view current bookings for a hotel (overlap/validation checks), and a "My Bookings" tab listing a user's own bookings (`GET /bookings/user/:userId`, joined with hotel/user info).
- No auth yet: booking endpoints use a hardcoded demo `userId` (see `TODO(auth)` in `hotels-api`'s `BookingsService`).

### Phase 5: Geolocation and PostGIS ("find hotels near me")

- Add the `postgis` extension to `hotels-api`'s Postgres, store hotel location as `geography(Point, 4326)`, add a GiST index, and expose `GET /hotels/nearby?lat=&lon=&limit=` as a KNN query.
- Client: `expo-location` requests foreground permission, `getCurrentPositionAsync()`, then calls `/hotels/nearby` and animates/zooms the map to fit the results.

### Phase 6: City search via geocoding

- Text input to Nominatim/Photon geocode: the resulting point drives the same "nearest hotels" and camera-fit logic as Phase 5, proxied through `hotels-api` for caching/rate-limit control. (Distinct from the name/location text search already shipped in Phase 4.)

### Phase 7: Authentication

- Wire up real auth (BetterAuth) so bookings are tied to the authenticated user instead of the hardcoded demo `userId`.
