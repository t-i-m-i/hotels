# 019 — iOS device builds without push entitlement

`expo run:ios --device` failed: personal teams can't provision Push
Notifications. Added `app.config.ts` (filters out `expo-notifications` and
sets `extra.pushEnabled` when `PUSH=0`), `ios:device` script, and a
`pushEnabled` guard in `registerForPushNotificationsAsync`. `ios` and
`ios:device` both run `prebuild --clean` since they share the gitignored
`ios/` folder and the entitlement is baked in at prebuild.

Correction: filtering `expo-notifications` out of `plugins` did nothing —
prebuild-config applies it automatically when the package is installed, so
the entitlement still appeared. `app.config.ts` now deletes `aps-environment`
via `withEntitlementsPlist` when `PUSH=0` (verified: empty entitlements).
Also: `prebuild --clean` fails with ENOTEMPTY if Xcode has `ios/` open — quit
Xcode first.
