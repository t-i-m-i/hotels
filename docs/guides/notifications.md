# Push notifications: from demo to real backend

## Current state

Booking a hotel still schedules a **local** notification 60 seconds later
via `src/utils/notifications.ts` ("Booking received" / "Your bookings has
been made.") — a stand-in acknowledgment that the booking was made, no
backend involved.

What's now real: the booking starts out with `status: 'pending'` in
`hotels-api` (see the `booking_status` enum added by
`migrations/1790605132324_add-status-to-bookings.sql`). When the host
confirms it — currently done by calling `PATCH /bookings/:id/status` with
`{ "status": "confirmed" }` from Swagger, since there's no host UI or auth
yet — `BookingsService.updateStatus` sends an actual Firebase Cloud
Messaging push ("Booking confirmed by host") to the guest's device via
`FirebasePushService`. This is **Option B** below, implemented directly
(no Expo relay). See `docs/logs/013-firebase-push-notifications.md` for the
full implementation notes and what's still missing (real auth, a host-side
UI to trigger the status change).

## What a real "host confirmed" push needs

The trigger moves from a client-side timer to a real backend event (the host
confirming the booking). That changes the shape of the flow:

1. Client registers for push notifications and gets a push token.
2. Client sends that token to the backend, associated with the user.
3. Backend persists the token.
4. When the host confirms a booking, the backend sends a push to the guest's
   stored token.
5. Client has a listener running to react to the incoming push (foreground
   update, or navigate on tap).

There are two ways to implement step 4, depending on how much you want to
own vs. delegate.

---

## Option A: Expo Push service (relay)

Uses `expo-server-sdk` on the backend and `expo-notifications` on the
client (same package already in use for local notifications). Expo's push
service sits between your backend and APNs/FCM — you send one push format,
Expo delivers it to the right platform.

**Cost note:** this is free. `getExpoPushTokenAsync` requires an EAS project
ID to identify the app, but that's just project registration — it doesn't
require a paid EAS plan (Build/Submit/Update are the paid parts).

### 1. Client: register for push and send the token to the backend

```ts
// src/utils/pushRegistration.ts
import * as Notifications from "expo-notifications";
import { ensureNotificationPermissionsAsync } from "./notifications";
import { api } from "../api"; // existing API client

export async function registerForPushNotificationsAsync() {
  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) return;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
    projectId: "your-eas-project-id",
  });

  await api.post("/users/me/push-token", { token: expoPushToken });
}
```

### 2. Backend: store the token, then push on host confirmation

```ts
// bookings.service.ts (NestJS-style, using expo-server-sdk)
import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

async function confirmBooking(bookingId: string) {
  const booking = await this.bookingsRepo.confirm(bookingId);
  const guestPushToken = await this.usersRepo.getPushToken(booking.guestId);

  if (guestPushToken && Expo.isExpoPushToken(guestPushToken)) {
    const message: ExpoPushMessage = {
      to: guestPushToken,
      title: "Booking confirmed",
      body: "Your host has just confirmed your booking. Have a nice stay!",
      data: { bookingId, type: "booking-confirmed" },
    };
    const tickets = await expo.sendPushNotificationsAsync([message]);
    // check tickets (and later receipts) for delivery errors
  }

  return booking;
}
```

### 3. Client: listen instead of scheduling

```ts
// app init (e.g. root layout)
import * as Notifications from "expo-notifications";

Notifications.addNotificationReceivedListener((notification) => {
  // update UI / cache when a push arrives in foreground
});

Notifications.addNotificationResponseReceivedListener((response) => {
  const { bookingId, type } = response.notification.request.content.data;
  if (type === "booking-confirmed") {
    // navigate to the booking, e.g. router.push(`/bookings/${bookingId}`)
  }
});
```

---

## Option B: Own backend, direct to FCM/APNs (no Expo relay)

Fully self-owned — no dependency on Expo's push infrastructure. More setup,
more you're responsible for:

- Requires the app to use FCM for both Android *and* iOS (Expo's
  `expo-notifications` supports this via `expo-notifications` + Firebase
  config, or a bare/dev-client workflow), **or** talk to APNs directly for
  iOS and FCM for Android as two separate integrations.
- You manage native config yourself: `google-services.json` /
  `GoogleService-Info.plist`, Firebase project setup, and (if going direct
  to APNs instead of via FCM) APNs auth keys/certs.
- Client obtains a device push token via the native FCM/APNs SDK instead of
  `getExpoPushTokenAsync`.
- Backend calls the Firebase Admin SDK (`firebase-admin` npm package) or
  APNs HTTP/2 API directly instead of `expo-server-sdk`.

```ts
// backend, using firebase-admin instead of expo-server-sdk
import { getMessaging } from "firebase-admin/messaging";

async function confirmBooking(bookingId: string) {
  const booking = await this.bookingsRepo.confirm(bookingId);
  const guestFcmToken = await this.usersRepo.getPushToken(booking.guestId);

  if (guestFcmToken) {
    await getMessaging().send({
      token: guestFcmToken,
      notification: {
        title: "Booking confirmed",
        body: "Your host has just confirmed your booking. Have a nice stay!",
      },
      data: { bookingId, type: "booking-confirmed" },
    });
  }

  return booking;
}
```

Everything else (register token → send to backend → store → listen on
client) stays structurally the same as Option A — only the transport and
SDKs on both ends change.

## Which to pick

- **Option A (Expo relay)** is the simpler default if you don't specifically
  want to touch Firebase: free, reuses `expo-notifications`, no native
  Firebase/APNs config needed while in the managed workflow.
- **Option B (direct FCM/APNs)** is what's actually implemented here — the
  goal was learning real Firebase push setup, not avoiding it. See below for
  the exact client/backend shape and setup steps.

## What's actually implemented (Option B)

- **Client** (`src/utils/pushRegistration.ts`): on app start
  (`src/app/_layout.tsx`), calls `Notifications.getDevicePushTokenAsync()` —
  this returns the **raw FCM registration token** (Android) / raw APNs
  device token (iOS), not an Expo push token — and POSTs it to
  `hotels-api`'s `POST /push-tokens` via `src/api/pushTokens.ts`, tagged
  with the demo user id (`src/constants/user.ts`) since there's no auth yet.
- **Backend** (`hotels-api/src/push-notifications/`):
  - `push-tokens.service.ts` / `.controller.ts`: upserts `{ userId, token,
    platform }` into the `device_push_tokens` table (one row per device;
    `ON CONFLICT (token)` re-associates a re-registered device with
    whichever user sent it, rather than erroring).
  - `firebase-push.service.ts`: wraps `firebase-admin`'s `messaging()`.
    Reads `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` /
    `FIREBASE_PRIVATE_KEY` from env; if any are unset it logs a warning and
    no-ops (same "log-and-skip in dev" pattern as `ResendEmailService`).
    On send, a dead/uninstalled-app token (`messaging/registration-token-
    not-registered` or `messaging/invalid-registration-token`) is deleted
    from `device_push_tokens` automatically.
  - `BookingsService.updateStatus`: on `PATCH /bookings/:id/status` with
    `status: 'confirmed'`, fire-and-forgets a push via
    `FirebasePushService.sendToUser`, payload includes
    `data: { url: "hotels://booking/<id>" }` so it reuses the **same**
    notification-tap deep-link listener already in `_layout.tsx` (no new
    client-side listener needed — a real push and a local one look
    identical to that handler).

### Manual Firebase setup (one-time, per developer/environment)

1. **Create a Firebase project**: [console.firebase.google.com](https://console.firebase.google.com) → Add project. Google Analytics is optional, not needed here.
2. **Register the Android app**: in the project → Add app → Android.
   - Package name: `com.timi.hotels` (from `app.json`'s `android.package`).
   - Download the generated **`google-services.json`**, place it at the
     repo root (`hotels/google-services.json` — already referenced by
     `app.json`'s `android.googleServicesFile` and gitignored).
3. **Register the iOS app**: Add app → iOS.
   - Bundle ID: `com.t-i-m-i.hotels` (from `app.json`'s
     `ios.bundleIdentifier`).
   - Download **`GoogleService-Info.plist`**, place it at the repo root
     (`hotels/GoogleService-Info.plist` — referenced by `app.json`'s
     `ios.googleServicesFile`, also gitignored).
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
5. **Set the backend env vars** in `hotels-api/.env` (see
   `.env.example` for the exact keys/comments):
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
7. **Apply the DB migrations**: `cd hotels-api && bun run migrate:up`
   (adds the `booking_status` enum/column and the `device_push_tokens`
   table).
