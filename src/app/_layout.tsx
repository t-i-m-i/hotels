import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="hotel/[hotelId]"
        options={{ title: "Hotel Details" }}
      />
    </Stack>
  );
}
