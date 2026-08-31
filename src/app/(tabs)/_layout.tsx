import { NativeTabs } from "expo-router/unstable-native-tabs";

import { colors } from "@/constants/colors";

export default function RootLayout() {
  return (
    <NativeTabs iconColor={{ selected: colors.primary }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "safari", selected: "safari.fill" }}
          md={{ default: "explore", selected: "explore" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "map", selected: "map.fill" }}
          md={{ default: "map", selected: "map" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-bookings">
        <NativeTabs.Trigger.Label>My Bookings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "ticket", selected: "ticket.fill" }}
          md={{
            default: "confirmation_number",
            selected: "confirmation_number",
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "magnifyingglass", selected: "magnifyingglass" }}
          md={{ default: "search", selected: "search" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
