# Lists under the native tab bar

`NativeTabs` gives no explicit bottom padding, so how does the last list item
clear the tab bar? There is no code for it. The native tab bar adjusts the
bottom content inset of the screen's `ScrollView`/`FlatList`, but only when
that list is mounted when the screen first renders.

## Rule

Screens inside a `(tabs)` group must render their `SafeAreaView` + `FlatList`
on the first frame, whatever the data state. Show loading, error and empty
states through `ListEmptyComponent`; don't `return` a spinner or error `View`
before the list.

```tsx
// Good: the list is always mounted
<SafeAreaView edges={["top"]}>
  <FlatList
    data={items ?? []}
    ListEmptyComponent={isLoading ? <ActivityIndicator /> : <Text>…</Text>}
  />
</SafeAreaView>

// Bad: the list mounts later and the last item stays under the tab bar
if (isLoading) return <ActivityIndicator />;
return <FlatList data={items} />;
```

`HotelList` follows this. The host bookings screen
(`src/app/(host)/(tabs)/index.tsx`) didn't, and its last item stayed hidden.

## Notes

- `edges={["top"]}` is correct. The bottom clearance does not come from the
  safe-area view.
- The code that sets the inset isn't ours, and the lazy-mount cause was found
  by experiment, not from the library source. If the last item is hidden under
  the tab bar, check this first. The fallback is
  `contentInsetAdjustmentBehavior="automatic"` on the `FlatList` (iOS).
