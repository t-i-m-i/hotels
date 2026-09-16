import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.rootView}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="hotel/[hotelId]"
              options={{ title: "Hotel Details" }}
            />
            <Stack.Screen
              name="booking/[bookingId]"
              options={{ title: "Booking Details" }}
            />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
