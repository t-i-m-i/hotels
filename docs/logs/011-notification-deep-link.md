# 011 — Deep link from booking-confirmed notification to booking/[bookingId]

Wanted the "Booking confirmed" local notification
(`scheduleBookingConfirmedNotification`) to open `booking/[bookingId]`
directly when tapped, instead of just landing on whatever screen the app
happened to resume on.

## Why this needed code, not just a link in the message body

The notification `body` is plain text — not a clickable link. And even if it
were, a real link tap (from Mail, a website, etc.) reaches the app through
the OS's "open this URL" mechanism, which Expo Router already listens to out
of the box via React Navigation's `linking` config (built from `scheme` in
`app.json`, already `"hotels"`, plus the file tree in `src/app/`).

A notification tap does **not** go through that mechanism. `expo-notifications`
delivers taps through its own separate event
(`addNotificationResponseReceivedListener`), not a URL-open event, so Expo
Router's router has nothing to catch. The fix is to manually bridge the two:
carry a URL in the notification's `data`, and on tap, explicitly hand that
URL to the same URL-open pathway Expo Router listens to.

## Changes

- `src/utils/notifications.ts`: `scheduleBookingConfirmedNotification` now
  takes a `bookingId` and attaches `data: { url: `hotels://booking/${bookingId}` }`
  to the scheduled notification content.
- `src/app/_layout.tsx`: `RootLayout` registers
  `Notifications.addNotificationResponseReceivedListener` in a `useEffect`,
  pulls `response.notification.request.content.data.url` out of the tap, and
  calls `Linking.openURL(url)` from **`expo-linking`** (not React Native's
  `Linking`, and not `expo-router`'s `router.push`).

## Gotchas

- `expo-linking`, not React Native's `Linking`: RN's `Linking.openURL` hands
  the URL to the OS as if it were external and expects some app (possibly
  not this one) to claim it. `expo-linking`'s is scheme-aware of this app and
  is what Expo Router's own listener responds to. Already a transitive dep
  of `expo-router` (`expo-linking ~57.0.4` in `package.json`) — nothing to
  install.

## Not done / notes for later

- No universal-link (`https://...`) support — custom scheme (`hotels://`) is
  sufficient here since a notification can only be tapped by someone who
  already has the app installed. Universal links matter for links shared
  outside the app (email, social) that need to work with or without the app
  installed; they need a verified domain (`apple-app-site-association` /
  `assetlinks.json`), not just `scheme` in `app.json`.
- Custom schemes are not exclusive/verified the way universal-link domains
  are — iOS doesn't stop two installed apps from registering the same
  scheme, and which one wins a collision is undefined. Not a real risk for
  this app today, but worth remembering if a scheme ever carries something
  sensitive (e.g. an OAuth redirect).
  This is actually a known category of vulnerability ("scheme hijacking") — a malicious app registers the same scheme as a legitimate one to intercept its deep links (e.g., an OAuth redirect containing a token). It's one of the real reasons universal links exist: `https://hotels-app.com/...` can only ever route to *your* app, because the OS checks the `apple-app-site-association` file hosted at that exact domain, which lists your specific Team ID + bundle identifier — something an attacker can't fake without controlling your DNS. A custom scheme has no equivalent proof of ownership.
  For this app this isn't a live risk (a hotel-browsing demo app isn't handling auth callbacks or sensitive tokens), but it's the actual answer: scheme collision is possible and unpoliced, universal links exist partly to solve that.