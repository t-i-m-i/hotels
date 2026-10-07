# Hotels

A mobile app for discovering hotels, built as a portfolio project to demonstrate mobile app development in **React Native with Expo**.

<img width="270" alt="Image" src="https://github.com/user-attachments/assets/1a813f37-b3c2-4fd3-99ee-2f6e8d28b2ae" />
<img width="270" alt="Image" src="https://github.com/user-attachments/assets/3620e546-a52f-47e1-88fb-33a748cc510d" />
<img width="270" alt="Image" src="https://github.com/user-attachments/assets/51701083-dbe7-4e95-a964-3da48dbf3212" />

## Features

As of now, it is not production-ready yet, but once it reaches v1.0.0, you will be able to:

### Guests

- discover hotels on an interactive map, browse them, and search by name or location
- find hotels near their current location 🚧
- register
- book a stay
- pay online 🚧
- receive booking confirmations from hosts via push notifications (i.e. even when the app is closed)

### Hosts

- add and manage their own properties (hotels/apartments/rooms) 🚧
- configure properties by rooms, number of guests, and seasonal pricing 🚧
- automatically track room availability (booked/free)
- manage booking statuses (pending, confirmed, cancelled, completed, no_show)
- multiple roles for the same identity (no need for separate guest and host accounts)

### Admin

- manage properties, hosts, guests, and bookings 🚧

## Tech stack

- React Native with Expo
- Expo Router file-based navigation with role guards [[src/app/_layout.tsx](src/app/_layout.tsx)]
- Authentication via BetterAuth
- Tab navigation with native tabs [[src/app/(tabs)/_layout.tsx](<src/app/(tabs)/_layout.tsx>)]
- Bottom Sheet [[src/app/hotel/[hotelId].tsx](src/app/hotel/[hotelId].tsx)]
- FlatList backed by TanStack Infinite Query [[src/components/HotelList.tsx](src/components/HotelList.tsx)]
- Native search with debouncing and shared list rendering [[src/app/(tabs)/search/index.tsx](<src/app/(tabs)/search/index.tsx>)]
- Redux Toolkit [[src/store/favoritesSlice.ts](src/store/favoritesSlice.ts)]
- AsyncStorage [[src/hooks/useFavoritesPersistence.ts](src/hooks/useFavoritesPersistence.ts)]
- Unit Testing with Jest [[src/hooks/useDateRangeSelection.test.ts](src/hooks/useDateRangeSelection.test.ts)]
- E2E happy path testing with Maestro [[.maestro/booking-flow.yaml](.maestro/booking-flow.yaml)]
- Location [[src/components/HotelList.tsx](src/components/HotelList.tsx)]
- Geolocation ("find hotels near me") and geospatial queries via
  PostGIS behind `hotels-api` (🚧 WIP)
- Local notifications [[src/utils/notifications.ts](src/utils/notifications.ts)]
- Push notifications via Firebase FCM [[src/utils/pushRegistration.ts](src/utils/pushRegistration.ts)]
- Deep linking [[src/app/_layout.tsx](src/app/_layout.tsx)]
- Reanimated - Animated: FlatList, View, Image, Style, ScrollHandler [[src/components/CarouselItem.tsx](src/components/CarouselItem.tsx)]
- Themes via Unistyles and ThemeProvider [[src/unistyles.ts](src/unistyles.ts)]
- MapLibre GL: open-source, vector-tile maps (via
  [OpenFreeMap](https://openfreemap.org/)), no paid API keys required.
- openapi-typescript + openapi-fetch + TanStack Query: the app
  consumes the backend through a fully typed pipeline: OpenAPI spec to
  generated TS types to typed fetch client to domain wrappers to query
  hooks. Nothing hand-duplicates the API's shape.
- ESLint + Prettier

## Requirements

- **[`hotels-api`](https://github.com/t-i-m-i/hotels-api)** (a sibling repo): a NestJS backend with an OpenAPI-documented REST API, backed by a Postgres database.

## Running it locally

```bash
bun run generate:api-types
bun run start
```

## Testing

| Command              | What it does                                                              |
| -------------------- | ------------------------------------------------------------------------- |
| `bun run test`       | Unit tests (Jest + `jest-expo` preset + `@testing-library/react-native`). |
| `bun run test:watch` | Unit tests in watch mode.                                                 |
| `bun run test:e2e`   | Maestro happy-path e2e (`.maestro/booking-flow.yaml`)                     |

`test:e2e` needs, in order:

- `hotels-api` running locally
- a dev build installed on a booted simulator (`bun run ios`, once), and Maestro + idb-companion installed - see
  `docs/logs/004-testing-setup.md` for the full setup.

**To get cleanup working, Metro has to be started with an extra env var:**

```bash
EXPO_PUBLIC_E2E_TEST_MODE=true bun start
```

**Why**: The flow books a real hotel in the shared database. `EXPO_PUBLIC_E2E_TEST_MODE=true` makes the app tag
that booking (`X-Synthetic-Booking: true`, see `src/api/client.ts`) so the flow's last step can delete it
in bulk via `hotels-api`'s `DELETE /bookings/synthetic`, instead of guessing which row it created by
hotel name and dates. `EXPO_PUBLIC_*` vars are baked into the JS bundle when Metro serves it - plain
`bun start` (no env var) is what you want for everyday manual dev/QA, since that never tags bookings as
synthetic. Forgetting the env var before running Maestro doesn't fail the flow - it just leaves the
booking behind, tagged as a real one. See `docs/logs/005-maestro-booking-cleanup.md` and
`docs/logs/006-synthetic-booking-tag.md` for how this evolved, and `hotels-api`'s
`docs/guides/testing-against-production-patterns.md` for the reasoning behind tagging synthetic data
instead of matching on hotel name/dates.

## About me

Hi, I'm Tymoteusz.
I'm a full-stack developer working across frontend, backend, and user experience.
I build native mobile apps, backend APIs, and work with databases.
I'm looking for an opportunity to keep growing as a software engineer.
