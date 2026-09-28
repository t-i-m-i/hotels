# Authentication (BetterAuth)

`hotels-api` already runs [BetterAuth](https://www.better-auth.com/)
(email/password + GitHub social sign-in, session data in Postgres) and has
one protected route (`GET /me`) proving the flow works from a browser-style
client. Every other route (`hotels`, `bookings`) is still `@AllowAnonymous()`
on purpose — protection is being added incrementally, starting with the UI
entry points, not the API.

This doc has two parts: how BetterAuth is meant to plug into this Expo
Router app conceptually, and the concrete plan for the first milestone —
gating the Book button and the Bookings tab behind login.

## Part 1 — How BetterAuth fits into an Expo Router client

### The problem: cookie sessions don't survive plain RN `fetch`

BetterAuth's default session model is a `Set-Cookie` on sign-in, then the
browser's cookie jar re-attaches it automatically on every later request.
That's invisible and free in a browser. React Native's `fetch` has **no
cookie jar** — nothing persists or resends a `Set-Cookie` for you. Point a
bare RN client at `hotels-api` today and sign-in would "succeed" but every
following request would be anonymous again, because nothing carries the
session forward.

### The fix: BetterAuth's own Expo integration, not a hand-rolled token

BetterAuth ships a first-party answer to exactly this: the **`expo()`**
server plugin (`better-auth/plugins`) paired with the **`expoClient()`**
client plugin (`@better-auth/expo/client`). Reach for this pair rather than
inventing a bearer/JWT scheme by hand — session lifecycle, expiry, and
revocation stay BetterAuth's problem, not this app's.

What each half does:

- **Server (`hotels-api`)**: `expo()` teaches BetterAuth to also surface the
  session value in a way a non-browser client can read (instead of relying
  solely on `Set-Cookie`), and to accept `trustedOrigins` for a custom
  scheme so the OAuth redirect (GitHub sign-in) can round-trip back into
  the app.
- **Client (`hotels`)**: `expoClient()` stores that session value in
  `expo-secure-store` on sign-in/sign-up, and automatically re-attaches it
  as a header on every later request made through BetterAuth's own
  `authClient`. No manual "read the token, add the header" code in app
  screens.

### End-to-end flow

1. User submits the login form → `authClient.signIn.email(...)`.
2. `hotels-api` validates credentials, creates a session.
3. The `expo()` server plugin surfaces that session in the response.
4. `expoClient()` writes it to `expo-secure-store` on-device.
5. Any later call through `authClient` (or anything reading the same
   storage — see below) reads it back and attaches it automatically.
6. `hotels-api` resolves the session on protected routes exactly like it
   already does for `/me`.

### Where login state lives — not Redux

`authClient.useSession()` is a reactive hook and is the single source of
truth for "is someone logged in, and who." Don't mirror that into Redux.
This app's Redux store already has a clear scope — `favorites`
(`src/store/favoritesSlice.ts`) holds app-only client state that has
nothing to do with the server. Auth session state belongs to BetterAuth's
client, the same way server data belongs to TanStack Query, not Redux.
Adding an `authSlice` would just create a second, easily-stale copy of
state BetterAuth already tracks for you.

### Integrating with this app's existing API layer

This app already has two relevant seams:

- `src/api/client.ts` — an `openapi-fetch` client typed against the
  generated OpenAPI schema, used for every hotel/booking call. It runs
  `getAuthHeaders()` (from `src/api/auth.ts`) in an `onRequest` middleware
  on every request.
- `src/api/auth.ts` — currently a no-op stub:
  ```ts
  // No auth in this demo. Kept as a seam for future JWT/token headers so
  // callers never need to change once real auth is wired up.
  export function getAuthHeaders(): Record<string, string> {
    return {};
  }
  ```

Recommended split:

- **Keep `apiClient` (openapi-fetch) for all hotel/booking calls.** Don't
  reroute those through `authClient` — you'd lose the generated response
  typing for no benefit.
- **Add a separate, small `authClient`** (via `createAuthClient` from
  `better-auth/react`, with the `expoClient()` plugin) used only for
  `signIn`, `signUp`, `signOut`, and `useSession`.
- **Update `getAuthHeaders()` to read the same `expo-secure-store` value
  `expoClient()` writes**, and return it as a header. That's the one line
  that connects the two: `apiClient`'s existing middleware then starts
  attaching the session to hotel/booking calls too, without either
  duplicating a fetch client or forking two separate auth mechanisms.

  Tradeoff worth naming: this couples `getAuthHeaders()` to
  `@better-auth/expo`'s internal storage key, which could change across
  package versions. That's a minor, worth-it coupling — re-check it when
  bumping `@better-auth/expo`, rather than avoiding the approach.

### Dev host resolution has to match

`src/api/client.ts` resolves the API host from Metro's `hostUri` in dev
(`Constants.expoConfig?.hostUri`), falling back to `EXPO_PUBLIC_API_URL` in
production — see `docs/logs/` for why (hardcoding `localhost` breaks on
physical devices/simulators pointed at a LAN IP). `authClient`'s `baseURL`
must resolve the exact same way, or sign-in will quietly hit the wrong
host. Extract that resolution into a small shared helper (e.g.
`src/api/getApiBaseUrl.ts`) so both clients agree by construction instead
of by copy-pasted convention.

### Backend prerequisite (a separate repo, not covered by this doc)

`hotels-api`'s BetterAuth config (`src/auth/auth.ts`) currently only
enables `plugins: [openAPI()]`, with no `trustedOrigins`. Before the Expo
client work above can talk to it, `hotels-api` needs:

- The `expo()` server plugin added to that `plugins` array.
- `trustedOrigins` including this app's scheme, `hotels://` (see
  `app.json`), so the GitHub OAuth redirect can round-trip back into the
  app.

This is prerequisite work for a session in the `hotels-api` repo — it's
called out here for completeness, not something this doc's own repo
changes.

### Social login (GitHub)

`hotels-api` already has GitHub social sign-in configured. On the client,
the redirect flow needs `expo-web-browser` (already a dependency here,
currently unused) to open the OAuth page and catch the redirect back into
the app via the `hotels://` scheme already registered in `app.json`.

## Part 2 — Implementation plan: gate the Book button and Bookings tab

First milestone: unauthenticated users get redirected to login/register
instead of booking or viewing bookings. The backend stays as-is —
`hotels`/`bookings` routes remain `@AllowAnonymous()` for now; this
milestone is UI-only gating, not server-side enforcement.

**Explicitly out of scope for this milestone** (future work, don't do yet):

- Enforcing auth server-side on the bookings endpoints.
- Replacing the hardcoded demo `userId` in
  `src/api/hooks/useBookings.ts::useMyBookings()` with the real session
  user id. `CreateBookingDto` (see `src/api/generated/schema.d.ts`) also has
  no `userId` field today — the backend attaches a hardcoded demo user on
  booking creation. Swapping that for the real session user is a necessary
  follow-up once sessions are real, but it's backend + wiring work beyond
  "redirect logged-out users away from these two actions," so it's tracked
  separately, not bundled into this milestone.

### Steps

1. **Install dependencies**
   ```
   bun add better-auth @better-auth/expo expo-secure-store
   ```
   (`expo-web-browser` is already present.)

2. **Extract dev-host resolution** into `src/api/getApiBaseUrl.ts`, and
   update `src/api/client.ts` to use it instead of inlining the logic —
   needed so `authClient` (next step) can reuse the identical resolution.

3. **Add `src/api/authClient.ts`** — `createAuthClient` from
   `better-auth/react`, with `expoClient()` configured with
   `scheme: "hotels"`, `expo-secure-store` as storage, and
   `baseURL: getApiBaseUrl()`.

4. **Add minimal login/register screens** — a new route group
   `src/app/(auth)/login.tsx` and `src/app/(auth)/register.tsx`, matching
   this repo's existing `(tabs)` grouping convention. Functional, not
   styled: an email/password form plus a "Continue with GitHub" button,
   calling `authClient.signIn.email(...)`, `authClient.signUp.email(...)`,
   and `authClient.signIn.social({ provider: "github" })` respectively.

5. **Gate the Bookings tab** — `src/app/(tabs)/_layout.tsx` currently
   renders all five tabs unconditionally (no existing `isLoggedIn`
   placeholder to wire up). Add a real check via `authClient.useSession()`
   and hide the `my-bookings` `NativeTabs.Trigger` when logged out.

6. **Gate the Book button** — `src/app/hotel/[hotelId].tsx`'s
   `handleBooking()` currently calls `book(...)` unconditionally. Check
   `authClient.useSession()` first; if there's no session, `router.push`
   to the login screen instead of calling `book(...)`.

7. **Wire `getAuthHeaders()`** (`src/api/auth.ts`) to read the session
   value from the same `expo-secure-store` key `expoClient()` writes, and
   return it as a header — proves the plumbing end-to-end even though the
   backend doesn't check it on `hotels`/`bookings` routes yet (per Part 1).

8. **Log the work** — once implemented, add a `docs/logs/013-*.md` entry
   per this repo's append-only logging convention (`AGENTS.md`); don't
   edit older log entries.

### Verification

- `bun run lint` and `bun run format:check` after adding the new files.
- Manually exercise both paths on a simulator/device: log out → tap Book →
  land on the login screen instead of booking; log out → confirm the
  Bookings tab is hidden; log in → confirm both come back.
- Confirm `authClient`'s requests hit the same host as `apiClient`'s by
  checking the Metro/dev-host log output matches for both.
- Re-check `@better-auth/expo`'s actual exported option names (`scheme`,
  `storage`, `storagePrefix`, etc.) against the installed package's types
  when implementing — BetterAuth's API surface shifts across versions, so
  this doc's names should be treated as "verify against the version you
  install," not gospel.
