import { Stack } from "expo-router";

// Nested Stack so index.tsx can use Stack.Title/Stack.SearchBar — the
// (tabs) root is a NativeTabs navigator, not a Stack, so those APIs need
// this wrapper to attach to.
export default function SearchLayout() {
  return <Stack />;
}
