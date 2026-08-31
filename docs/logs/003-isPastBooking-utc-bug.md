# 003 — `isPastBooking` UTC-vs-local bug in `BookingListItem`

## The bug

`BookingListItem` dims past bookings based on:

```ts
function isPastBooking(checkOut: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return checkOut < today;
}
```

`checkOut` is a bare `"YYYY-MM-DD"` calendar day (matches the backend's
`date` columns). `.toISOString()` always renders the UTC equivalent of an
instant, so `today` here is "today, in UTC," not "today, on this device."
This is the exact anti-pattern `hotels-api/docs/logs/004-date-formatting-considerations.md`
documents for `assertCheckInNotInPast` — same root cause, never fixed on
this side of the codebase.

Unlike the equivalent bug found in the web app (`hotels-web-next`, where
it was a server-vs-viewer timezone mismatch), this one runs client-side on
the guest's own device, so it isn't an occasional cross-timezone
divergence — it's a several-hour window that hits **every device, every
day**, direction and length depending on the device's UTC offset:

- **Positive offset (e.g. `UTC+2`):** for the first ~2 hours after local
  midnight, UTC's calendar date still lags a day behind. `today` resolves
  to *yesterday*, so a booking that ended yesterday reads
  `checkOut < today` → `false` and stays undimmed for up to 2 hours past
  when it should have flipped.
- **Negative offset (e.g. `UTC-8`):** UTC crosses into tomorrow's date up
  to 8 hours before local midnight. `today` resolves to *tomorrow* for
  most of the evening, so a booking checking out *today* gets flagged as
  already past while it's still ongoing.

## The fix

Build `today` from local `Date` getters instead of `toISOString()`, and
compare `YYYY-MM-DD` strings lexically (lexical order matches chronological
order for that format), same fix already applied on the web side:

```ts
function isPastBooking(checkOut: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return checkOut < today;
}
```

## Worth remembering

Any `.toISOString()` (or other UTC-flavored conversion) touching a value
that's meant to represent a bare calendar day — no time-of-day, no zone —
is a signal to stop and check whether "which day" is being silently
conflated with "which instant." This is now the third place this exact
mistake has shown up across the two client repos and the backend
(`hotels-api`'s `assertCheckInNotInPast`/`toBookingDto`, `hotels-web-next`'s
`isPastBooking`, and this one) — worth grepping for `toISOString()` next
time a date-only value is touched anywhere in this stack.
