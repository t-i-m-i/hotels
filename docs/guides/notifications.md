# Push notifications: from demo to real backend

## Current state (demo)

`src/utils/notifications.ts` schedules a **local** notification 60 seconds
after booking, to simulate a host confirming the booking. It's a stand-in —
no backend or network involved, the device just notifies itself on a timer.

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

- **Option A (Expo relay)** is the default fit here: it's free, reuses the
  `expo-notifications` package already in the codebase, and needs no native
  Firebase/APNs config as long as the app stays in the Expo managed
  workflow.
- **Option B (direct FCM/APNs)** only pays off if there's a reason to avoid
  the Expo relay specifically (e.g. leaving the managed workflow for other
  reasons, or an existing Firebase setup to reuse) — otherwise it's more
  integration work for the same end result.
