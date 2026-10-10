# Host bookings list hidden under tab bar

The last item of the host bookings `FlatList` stayed under the iOS tab bar,
while the guest `HotelList` scrolled clear. Both used `SafeAreaView
edges={["top"]}` and near-identical list styles, and neither had explicit
bottom padding.

## Cause

The host screen returned a spinner/error `View` early and mounted the
`FlatList` only after loading. The guest list is mounted from the first frame
(spinner is its `ListEmptyComponent`). A list mounted late doesn't get the
native tab bar's bottom inset.

## Fix

Always render `SafeAreaView` + `FlatList`; move loading/error into
`ListEmptyComponent`. Verified on iOS. Rule written up in
`docs/guides/tab-bar-scroll-inset.md`.

## Gotchas

- Not a bug in our styling, and nothing in the code points at it.
- Cause found by experiment; the exact library mechanism wasn't traced.
