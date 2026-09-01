# 003 — `toISOString()` UTC-vs-local bugs in `BookingListItem` and `HotelBookingSheet`

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
order for that format), same fix already applied on the web side. Extracted
as a shared helper since the same fragile logic was about to appear twice:

```ts
// src/utils/dateRange.ts
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

`BookingListItem.tsx` now calls `checkOut < getLocalDateString()`.

## A second occurrence, found by grepping for `toISOString()`

Grepping both client repos and `hotels-api` for other `toISOString()` uses
after fixing the above turned up a second live instance of the identical
bug, in `HotelBookingSheet.tsx`:

```ts
minDate={new Date().toISOString().slice(0, 10)}
```

Same mechanism, different symptom: this feeds the check-in calendar's
`minDate`, so instead of mis-dimming a list item it mis-computes which
dates are selectable as check-in.

- **Positive offset (e.g. `UTC+2`):** for ~2 hours after local midnight,
  `minDate` resolves to *yesterday* — the calendar lets the guest select a
  check-in date that's already passed locally.
- **Negative offset (e.g. `UTC-8`):** for hours before local midnight,
  `minDate` resolves to *tomorrow* — the guest can't select today as
  check-in even though it's still today on their device.

Fixed the same way: `minDate={getLocalDateString()}`.

A third `toISOString()` hit, in `src/utils/dateRange.ts`'s
`getDatesInRange`, was checked and is **not** a bug — it parses dates via
`Date.UTC(...)`, increments via `setUTCDate`, and formats via
`toISOString()`, so every step stays in UTC space consistently. The bug
pattern specifically requires mixing a real instant (`new Date()`, tied to
the device's local wall-clock) with a UTC-only render step; a function
that never touches the local clock at all has no such asymmetry to trip
over.

## Worth remembering

Any `.toISOString()` (or other UTC-flavored conversion) touching a value
that's meant to represent a bare calendar day — no time-of-day, no zone —
is a signal to stop and check whether "which day" is being silently
conflated with "which instant." This is now the fourth occurrence of this
exact mistake across the two client repos and the backend
(`hotels-api`'s `assertCheckInNotInPast`/`toBookingDto`,
`hotels-web-next`'s `isPastBooking`, and this file's `isPastBooking` and
`HotelBookingSheet`'s `minDate`) — grep for `toISOString()` first, every
time, whenever a date-only value is touched anywhere in this stack, rather
than trusting the specific call site looks safe.
