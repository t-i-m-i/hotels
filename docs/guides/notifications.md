# Push notifications

## Current state

Booking confirmation pushes are fully set up and working end to end, direct
to Firebase Cloud Messaging (no Expo push relay).

Flow: the client registers for push on app start and sends its device token
to `hotels-api`, which stores it per user. When a host confirms a booking
(`PATCH /bookings/:id/status` with `{ "status": "confirmed" }`), the backend
sends an FCM push ("Booking confirmed by host") to the guest's device. The
push payload reuses the same deep-link shape as the app's local
notifications, so it's handled by the existing tap listener with no separate
code path.

See `docs/logs/013-firebase-push-notifications.md` for the original
implementation notes.

## Manual Firebase setup (one-time, per developer/environment)

Each developer needs their own Firebase project and config files — these are
gitignored and not shared.

1. **Create a Firebase project**: [console.firebase.google.com](https://console.firebase.google.com) → Add project. Google Analytics is optional, not needed here.
2. **Register the Android app**: in the project → Add app → Android.
   - Package name: put the package name from `app.json`'s `android.package`.
   - Download the generated **`google-services.json`**, place it at the repo
     root (already referenced by `app.json`'s `android.googleServicesFile`
     and gitignored).
3. **Register the iOS app**: Add app → iOS.
   - Bundle ID: put the bundle identifier from `app.json`'s
     `ios.bundleIdentifier`.
   - Download **`GoogleService-Info.plist`**, place it at the repo root
     (referenced by `app.json`'s `ios.googleServicesFile`, also gitignored).
   - iOS push additionally needs an **APNs Auth Key** uploaded to Firebase:
     Apple Developer account → Certificates, IDs & Profiles → Keys → create
     a key with the "Apple Push Notifications service (APNs)" capability,
     download the `.p8` file, then in Firebase console → Project settings →
     Cloud Messaging → Apple app configuration → upload that `.p8` + your
     Key ID + Team ID. Without this, Android pushes will work but iOS
     pushes will silently fail.
4. **Generate a service account key** (this is what the *backend* uses):
   Firebase console → Project settings (gear icon) → Service accounts →
   "Generate new private key". This downloads one JSON file containing
   `project_id`, `client_email`, and `private_key`.
5. **Set the backend env vars** in `hotels-api/.env` (see `.env.example`
   for the exact keys/comments):
   - `FIREBASE_PROJECT_ID` — the JSON's `project_id`.
   - `FIREBASE_CLIENT_EMAIL` — the JSON's `client_email`.
   - `FIREBASE_PRIVATE_KEY` — the JSON's `private_key`, pasted with its
     `\n` escape sequences intact (don't convert them to real newlines in
     the `.env` file — the code does that conversion at runtime).
6. **Rebuild the native app** — `google-services.json` /
   `GoogleService-Info.plist` are native config, so per this repo's usual
   rule for native module changes: run `bunx expo prebuild` then
   `expo run:ios` / `expo run:android`. A plain `expo start` JS reload will
   not pick this up, and a physical device or an emulator/simulator with
   push capability is needed — plain iOS Simulators cannot receive real
   APNs pushes (Android emulators with Google Play services can receive
   FCM).
