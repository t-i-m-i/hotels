# BetterAuth login/register, gate Book button and Bookings tab

Implemented `docs/guides/authentication.md` Part 2: unauthenticated users
can no longer book a hotel or see their bookings without logging in first.
Backend stays `@AllowAnonymous()` on `hotels`/`bookings` per that doc — this
is UI-only gating.

## What changed here

- `src/api/getApiBaseUrl.ts` (new): dev-host resolution extracted out of
  `src/api/client.ts` so `authClient` can resolve the exact same host.
- `src/api/authClient.ts` (new): `createAuthClient` + `expoClient()`
  (`scheme: "hotels"`, `expo-secure-store`), used only for
  `signIn`/`signUp`/`signOut`/`useSession` — not routed through the
  OpenAPI `apiClient`.
- `src/api/auth.ts`: `getAuthHeaders()` is now async and reads
  `authClient.getCookie()`, returning it as a `Cookie` header.
  `src/api/client.ts`'s `onRequest` middleware is now async and awaits it
  — easy to miss since nothing throws if you forget the `await` (iterating
  a `Promise`'s own properties just silently yields nothing).
- `src/app/(auth)/login.tsx`, `register.tsx` (new): email/password forms
  plus "Continue with GitHub" (`authClient.signIn.social`) on both — social
  sign-in doubles as sign-up for a new GitHub account. Both read a
  `redirectTo` param and `router.replace` to it on success; surface
  failures via `Alert.alert`. Styled with the existing
  `react-native-unistyles` theme tokens so they follow light/dark like the
  rest of the app.
- `src/app/hotel/[hotelId].tsx`: `handleBooking` checks
  `authClient.useSession()` before calling `book(...)`; no session →
  `router.push` to `/(auth)/login` with `redirectTo` back to this hotel.
  Also no-ops while the session is still `isPending` (hydrating from
  SecureStore) instead of treating that transient state as logged-out.
- `src/app/(tabs)/my-bookings.tsx`: deliberately did **not** hide the
  Bookings tab for logged-out users (diverges from the guide's step 5).
  Instead the tab stays visible and renders a "Please login to manage your
  bookings" prompt with Login/Register buttons when there's no session.
  Earlier draft called `router.push` straight from the render body as the
  "redirect" — that's invalid (navigating during another component's
  render) and crashed on device; the inline prompt sidesteps the whole
  class of bug by never navigating on mount.

## Gotchas

- `authClient.useSession()` returns `{ data, isPending, error }` —
  `data` is `undefined` until the SecureStore read resolves, not only when
  logged out. Treat `isPending` and "no session" as separate states or you
  get a false logged-out flash/redirect for real users right after launch.
- `getAuthHeaders()`'s coupling to `@better-auth/expo`'s `getCookie()` is
  the one named in the guide as worth re-checking when `@better-auth/expo`
  is bumped.
