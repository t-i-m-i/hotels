# 005 — Maestro flow now cleans up the booking it creates

## Why

`.maestro/booking-flow.yaml` creates a real booking against the shared
Postgres instance (same DB `hotels-alt-api`/`hotels-api` read from) every
run, on the same next-month 10th–13th range each time, and never removed
it. Left alone, repeat runs would eventually fill that range on the
targeted hotel and start failing for an unrelated reason (dates already
booked, not a real regression). `hotels-web-next` picked up the
equivalent gap when adding its own Playwright happy-path flow — see that
repo's `docs/logs/005-playwright-booking-e2e.md` — and cleans up via the
API's own `DELETE /bookings/:id`. Did the same here.

## Maestro can make real HTTP calls from a script — `http.get/post/put/delete`

Not obvious from the docs used so far, but confirmed by decompiling
`~/.maestro/lib/maestro-client.jar`: `maestro/js/GraalJsHttp.class`
exposes exactly those methods, bound into every `runScript`/`evalScript`
JS context as the global `http` object (`GraalJsEngine.class` binds it
alongside `output` and every `env:` variable, which are bound directly
by name — e.g. `SEARCH` and `API_URL` below are just global JS
variables in scripts, no special lookup needed). Response objects carry
`body` (a string — needs `JSON.parse`), `headers`, and `status`.

## What was added

```
.maestro/cleanup-booking.js   # finds and deletes the booking this run created
```

```yaml
env:
  SEARCH: "Barcelona"
  API_URL: "http://localhost:3000"   # new
---
...
- assertVisible: "Booking confirmed!"
- assertVisible: ".*${SEARCH}.*"
- runScript: cleanup-booking.js       # new, last step
```

`cleanup-booking.js` doesn't have the booking id (the UI never surfaces
it), so it finds the same way a human reviewing the list would: `GET
/bookings`, then the entry whose hotel name contains `SEARCH` and whose
`checkIn`/`checkOut` match what `compute-dates.js` picked for this run,
then `DELETE /bookings/:id` on it. Runs as the very last step, after the
confirmation assertions — if an earlier step fails, the flow stops there
and cleanup never runs, which is correct: a failed run's booking (if it
even got that far) is exactly the kind of evidence you don't want
auto-deleted while debugging.

## Verified

Ran the match/delete logic directly against the real `hotels-api` dev
server (not through the Maestro JS engine itself, but the same
`GET`/`DELETE` calls it makes) — correctly found and deleted a real
leftover booking on "Alpine Barcelona Boutique" for 2026-10-10 to
2026-10-13 (a stray from `hotels-web-next`'s own Playwright test
development), confirmed gone via a second `GET`. Did not run the full
Maestro flow end-to-end against the simulator in this session (no
booted simulator/dev build at hand) — the new step is a single
`runScript` call exercising the same `http` API already verified
working, so the remaining risk is narrow (mainly: syntax-checked clean
via `maestro check-syntax`).

## Known limitation, shared with the pre-existing flow

Both this flow and `hotels-web-next`'s Playwright suite target the same
search term and the same next-month 10–13 range, and both pick "the
first result" for that search — which, given `HotelsService.findAll`'s
`ORDER BY name`, is almost certainly the same hotel row. Running both
suites around the same time against the same shared database is a real
(if narrow) collision risk; a Postgres constraint or the app's own
overlap check would surface it as a `409` on `create`, not a silent
double-booking, but it would still fail one of the two runs. Not fixed
here — would mean giving each suite its own hotel or date offset, which
is a small design decision worth making deliberately rather than as a
side effect of a cleanup script.
