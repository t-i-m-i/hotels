# 006 — Tagging the Maestro flow's booking instead of matching name/dates

## Why

`docs/logs/005-maestro-booking-cleanup.md` added `cleanup-booking.js`,
which found the booking to delete by `GET`ting `/bookings` and matching
on hotel name (`SEARCH`) + the exact `checkIn`/`checkOut` dates
`compute-dates.js` picked. That log entry already flagged the risk: this
flow and `hotels-web-next`'s Playwright suite target the same search
term and the same next-month 10–13 range, so the match wasn't actually
unique to *this* flow's booking — just the first one found matching
those criteria. `hotels-api` gained a real fix for this:
`docs/logs/007-synthetic-booking-tag.md` over there adds
`bookings.is_synthetic`, settable via an `X-Synthetic-Booking: true`
request header, cleanable in bulk via `DELETE /bookings/synthetic`.

## The wrinkle: Maestro doesn't make the create request

Playwright drives a browser, but the actual `POST /bookings` call in
`hotels-web-next` happens in that app's own server-side code — trivial
to add a header there. This app is different: `HotelBookingSheet`'s
"Book" button triggers `submitBooking` inside the *installed native
app*, not inside Maestro's script. Maestro has no way to inject a header
into a request it never sees. So the tag has to be set by the app
itself, conditionally, only when it's the build Maestro is exercising.

## What was added

`src/api/client.ts`:

```ts
// EXPO_PUBLIC_* vars are inlined at bundle time by Metro, not read from
// the device at runtime — so this is only ever true for a JS bundle
// actually served by `EXPO_PUBLIC_E2E_TEST_MODE=true bun start`, never
// for a normal dev/prod build.
const isE2eTestMode = process.env.EXPO_PUBLIC_E2E_TEST_MODE === "true";

apiClient.use({
  onRequest({ request }) {
    for (const [key, value] of Object.entries(getAuthHeaders())) {
      request.headers.set(key, value);
    }
    if (isE2eTestMode) {
      request.headers.set("X-Synthetic-Booking", "true");
    }
    return request;
  },
});
```

Reused the existing `getAuthHeaders()` request-middleware seam
(`src/api/auth.ts`) rather than adding a second `apiClient.use()` call.

`compute-dates.js`/the date-selection steps in `booking-flow.yaml` are
unchanged — the tag doesn't replace picking a specific date range, it
just makes cleanup unambiguous regardless of which range was picked.

`cleanup-booking.js` collapsed from a `GET` + `find()` + `DELETE :id`
down to one line:

```js
http.delete(`${API_URL}/bookings/synthetic`);
```

## Why `EXPO_PUBLIC_*`, and what that costs

Expo inlines `EXPO_PUBLIC_*` variables into the JS bundle at the point
Metro transforms the code — not read from the OS environment on the
device at runtime. That means the flag can't be toggled by, say, an app
setting or a Maestro-launched deep link; it has to be baked in when the
bundle is built/served. Concretely: the *native* dev-client binary
doesn't need rebuilding (same one `bun run ios` installed), but Metro
does need to be (re)started with the var set —
`EXPO_PUBLIC_E2E_TEST_MODE=true bun start` — before running the Maestro
suite. Documented directly in `booking-flow.yaml`'s prerequisites
comment. Forgetting this doesn't fail the flow; it just means
`cleanup-booking.js` finds nothing to delete (`is_synthetic` stays
`false` on the booking it created), which is a quiet failure mode worth
knowing about rather than a loud one.

## Verified

Confirmed the backend side of this independently (creating a booking
with `curl -H "X-Synthetic-Booking: true"`, then
`DELETE /bookings/synthetic`, only removes tagged rows) — see
`hotels-api`'s log for that. Did not run the full Maestro flow against a
booted simulator in this session (none at hand); the app-side change is
a small, isolated addition to an existing, already-verified middleware
pattern (`getAuthHeaders`), so the remaining risk is mainly "did Metro
actually get started with the env var set," which is an operator step,
not a code path.
