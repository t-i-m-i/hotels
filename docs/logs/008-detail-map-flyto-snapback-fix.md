# 008 — Fix detail map camera snapping back during zoom/pan

Follow-up to `007-viewport-map-query.md`: `hotel/[hotelId].tsx`'s map made
`onBoundsChange` interactive (nearby pins refetch as you pan/zoom), but
`HotelMap`'s `flyTo(selectedHotel)` effect depended on `hotels` directly. Any
time a viewport refetch changed the `hotels` prop — which now happens on
every zoom/pan once `onBoundsChange` fires — the effect re-ran and called
`flyTo` again, snapping the camera back to the selected hotel at zoom 14 a
moment after the user zoomed or panned. Same bug `hotels-web-next` hit and
fixed for the same reason (`HotelMap.tsx`'s flyTo effect there).

## Fix

Same pattern as web: split the one effect into two, and stop keying the
flyTo effect on the hotel list.

- `flyTo` effect now depends only on `selectedHotelId` + `isMapReady`; it
  reads the current hotel list from a ref (`hotelsRef`, kept in sync in its
  own effect) instead of the `hotels` prop, so a list update alone can't
  re-trigger it.
- `fitBounds` effect (the non-interactive, no-selection case) kept its
  `hotels` dependency — it's meant to refit when the set changes — but now
  also bails when `onBoundsChange` is set, which was already true logically
  but is now explicit per-effect rather than shared with the flyTo branch.

## Why this didn't show up in section 6's testing

The original section 6 work (`007-viewport-map-query.md`) validated `tsc`/
lint/build but not gesture behavior — the snapback only shows up interacting
with the map on a device/simulator, not in type or lint checks.
