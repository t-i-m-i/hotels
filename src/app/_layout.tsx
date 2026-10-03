import "@/unistyles";

import useActiveRolePersistence from "@/hooks/useActiveRolePersistence";
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
import { authClient, type SessionUser } from "@/api/authClient";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
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

  useEffect(() => {
    if (!session?.user.id) return;
    registerForPushNotificationsAsync(session.user.id).catch((err: unknown) =>
      console.error("Failed to register for push notifications", err),
    );
  }, [session?.user.id]);

  return (
    <StoreProvider store={store}>
      <AppContent />
    </StoreProvider>
  );
}

const AppContent = () => {
  useFavoritesPersistence();
  const { theme, rt } = useUnistyles();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as SessionUser | undefined;
  const { activeRole, isReady: isActiveRoleReady } = useActiveRolePersistence(
    user?.roles,
  );

  // Hold off rendering the Stack until both the session and the stored
  // active-role preference have resolved. Rendering early (session still
  // `undefined` mid-fetch) would momentarily evaluate every guard below as
  // "logged out" — an already-logged-in host/admin would flash the guest
  // tree, or the auth screens, before snapping to their real one.
  if (isPending || !isActiveRoleReady) {
    return null;
  }

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

              <Stack.Protected guard={activeRole === "admin"}>
                <Stack.Screen name="(admin)/(tabs)" />
              </Stack.Protected>

              <Stack.Protected guard={activeRole === "host"}>
                <Stack.Screen name="(host)/(tabs)" />
              </Stack.Protected>

              <Stack.Protected guard={!session || activeRole === "guest"}>
                <Stack.Screen
                  name="(guest)/(tabs)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="map" options={{ title: "Map" }} />
                <Stack.Screen
                  name="hotel/[hotelId]"
                  options={{ title: "Hotel Details" }}
                />
                <Stack.Screen
                  name="booking/[bookingId]"
                  options={{ title: "Booking Details" }}
                />
              </Stack.Protected>

              <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
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
