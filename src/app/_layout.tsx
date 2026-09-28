import "@/unistyles";

import useFavoritesPersistence from "@/hooks/useFavoritesPersistence";
import { store } from "@/store/store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerForPushNotificationsAsync } from "@/utils/pushRegistration";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUnistyles } from "react-native-unistyles";
import { Provider as StoreProvider } from "react-redux";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotificationsAsync().catch((err: unknown) =>
      console.error("Failed to register for push notifications", err),
    );

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url as
          string | undefined;
        if (url) {
          Linking.openURL(url);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
}

const AppContent = () => {
  useFavoritesPersistence();
  const { theme, rt } = useUnistyles();

  // React Navigation's own Theme (drives native-stack header colors) — kept
  // in sync with the Unistyles theme so headers match the rest of the app
  // instead of always rendering React Navigation's built-in light theme.
  const navigationTheme = {
    ...DefaultTheme, // spread ALL of DefaultTheme's keys
    dark: rt.themeName === "dark", // overwrite just `dark` (default is `false`)
    // overwrite `colors` entirely, with a new object
    colors: {
      // spread DefaultTheme's 6 color keys in first
      ...DefaultTheme.colors,
      // overwrite every single one of those keys
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.rootView}>
        <BottomSheetModalProvider>
          <ThemeProvider value={navigationTheme}>
            {/*[info] Stack is required.*/}
            <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
              {/*[info] Stack.Screen is optional, but can be used to configure the screen's options.*/}
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
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
