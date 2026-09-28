# Firebase push notifications for "booking confirmed"

Wired up real push notifications for the host-confirms-a-booking event,
replacing the plan sketched in `docs/guides/notifications.md`'s Option B
(direct FCM, not the Expo relay) — see that doc for the full setup steps
and what changed structurally, and `hotels-api`'s
`docs/logs/012-firebase-push-notifications.md` for the backend side.

## What changed here

- `src/utils/notifications.ts`: the local "booking made" notification's
  copy changed to title "Booking received" / body "Your bookings has been
  made." — it no longer claims the host confirmed anything, since that's
  now a real, separate push.
- `src/utils/pushRegistration.ts` (new): on app start, gets a raw FCM
  device token via `Notifications.getDevicePushTokenAsync()` (not
  `getExpoPushTokenAsync()` — this app talks to Firebase directly, no Expo
  relay) and registers it with the backend.
- `src/api/pushTokens.ts` (new): `POST /push-tokens`, same
  `apiClient`/`toError` pattern as `src/api/bookings.ts`.
- `src/constants/user.ts` (new): pulled the previously-inline hardcoded
  demo user id out of `useBookings.ts` so `pushRegistration.ts` could use
  the same one without duplicating the literal.
- `src/app/_layout.tsx`: calls `registerForPushNotificationsAsync()` in the
  existing root `useEffect`. Deliberately reused the **existing**
  `addNotificationResponseReceivedListener` (added for local notifications
  in `docs/logs/011-notification-deep-link.md`) instead of adding a new
  one — the backend's push payload includes the same `data: { url:
  "hotels://..." } }` shape, so a tap on a real push deep-links exactly
  like a tap on the local one already did.
- `app.json`: added `ios.googleServicesFile` /
  `android.googleServicesFile`, pointing at `GoogleService-Info.plist` /
  `google-services.json` at the repo root — both gitignored (per-developer
  Firebase artifacts, downloaded during the manual setup in
  `docs/guides/notifications.md`).

## Gotchas / non-obvious things

- **This requires a native rebuild.** Adding `googleServicesFile` to
  `app.json` is a native config change like the MapLibre plugin (see
  `docs/logs/001-maplibre-map-screen.md`) — `bunx expo prebuild` +
  `expo run:ios`/`expo run:android` needed, plain `expo start` won't pick
  it up. Untestable end-to-end until the Firebase project + those two
  files exist (see the guide).
- **No auth yet**, so the push token is registered against the same
  hardcoded demo user id every booking already uses
  (`src/constants/user.ts`) — same `TODO(auth)` shape as the rest of the
  app.
- Regenerated `src/api/generated/schema.d.ts` via `bun run
  generate:api-types` after the backend's `docs/openapi.json` picked up
  the new `/push-tokens` route and `bookings`' new `status` field —
  required any time the sibling repo's OpenAPI spec changes.
