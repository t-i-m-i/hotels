# Hotels App — Plan

## Decisions (answers to open questions)

**Maps: MapLibre GL Native, not react-native-maps / Google Maps**

- Google Maps requires a billed API key even for light demo traffic (free tier still needs billing enabled) — avoid.
- `react-native-maps` can point at raw OSM XYZ tiles via a custom tile overlay, but there's no official free vector-tile source for it and Android OSM tile loading is informally discouraged by OSM (they've rate-limited/blocked abusive apps before).
- **MapLibre GL Native** (`@maplibre/maplibre-react-native`) renders vector tiles from _any_ style URL. Free vector tile sources built on OSM data:
  - [OpenFreeMap](https://openfreemap.org/) — fully free, no key, no rate limit, self-hostable if needed later.
  - [MapTiler](https://www.maptiler.com/) free tier — generous free quota, needs an API key.
  - Start with OpenFreeMap since it's demo-friendly with zero setup; can swap the style URL later.
  - Requires an Expo config plugin (`@maplibre/maplibre-react-native/plugin`) added to `app.json` — needs a dev build / prebuild, won't run in plain Expo Go.
- MapLibre's camera API (`camera.setCamera({ centerCoordinate, zoomLevel, animationDuration, animationMode })`) handles animated recentering/zooming natively — no custom animation code needed.

**Geocoding (city name → lat/lon): free, works with mocked or real data**

- Use **Nominatim** (OSM's official geocoder, `nominatim.openstreetmap.org/search`) — free, no key. Usage policy: max ~1 req/sec, must set a `User-Agent`/referer, no heavy/commercial bulk use. Fine for a demo, and calls should be proxied through our own backend later so we can cache + respect the rate limit centrally.
- Alternative if we outgrow Nominatim's rate limit: **Photon** (komoot, also OSM-data-based, free, no key, more lenient fair-use policy).
- Yes — this works today even against the mocked array: geocode the typed city → get `{lat, lon}` → compute haversine distance to each mocked hotel client-side → sort. Same shape of call will later hit our backend instead of doing the distance math client-side.

**Nearest-hotel queries in PostgreSQL: yes, via PostGIS**

- Add the `postgis` extension, store hotel location as `geography(Point, 4326)`, add a GiST index on it.
- "Nearest N hotels to point" becomes a KNN query: `ORDER BY location <-> ST_MakePoint(:lon, :lat)::geography LIMIT :n` — index-accelerated, no need to compute distances in app code.
- "Hotels within radius" becomes `WHERE ST_DWithin(location, ST_MakePoint(:lon,:lat)::geography, :meters)`.
- This is a very standard, well-supported pattern — no concerns there.

## Phased roadmap

### Phase 1 — Mocked hotel list (THIS STEP)

- `Hotel` type: `id`, `name`, `description`, `location` (display string, e.g. "Barcelona, Spain"), `geo: { latitude, longitude }`.
- 5 mocked hotels at the city centers of Barcelona, Málaga, Rome, Verona, Salzburg.
- Single list screen (`src/app/index.tsx`) rendering the mocked hotels — no map yet.

### Phase 2 — Map screen

- Add `@maplibre/maplibre-react-native` + config plugin, point at an OpenFreeMap style, prebuild a dev client (won't run in Expo Go).
- Tapping a hotel in the list animates the map camera to that hotel's geo point.

### Phase 3 — "Locate me"

- `expo-location`: request foreground permission, `getCurrentPositionAsync()`.
- Compute nearest mocked hotels client-side (haversine) and animate/zoom the map to fit them.

### Phase 4 — City search

- Text input → Nominatim/Photon geocode → resulting point drives the same "nearest hotels" + camera-fit logic as Phase 3.

### Phase 5 — Real backend

- Stand up the API (framework TBD) backed by PostgreSQL + PostGIS.
- Replace the mocked hotel array and client-side haversine sorting with real endpoints (`GET /hotels`, `GET /hotels/nearby?lat=&lon=&limit=`), proxy Nominatim/Photon calls through the backend for caching/rate-limit control.
- Client-side data-fetching shape should stay the same so swapping mocked → real is a data-layer change only, not a UI change.
