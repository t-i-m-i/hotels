import { authClient } from "@/api/authClient";
import { useMyBookings } from "@/api/hooks/useBookings";
import { BookingListItem } from "@/components/BookingListItem";
import { themeStyles } from "@/styles/themeStyles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Button, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function MyBookings() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const {
    data: bookings,
    isLoading,
    isError,
  } = useMyBookings(session?.user.id);
  const { newBookingId } = useLocalSearchParams<{ newBookingId?: string }>();
  const router = useRouter();

  if (isSessionPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.loggedOutText}>
          Please login to manage your bookings
        </Text>
        <View style={styles.loggedOutButtons}>
          <Button
            title="Login"
            onPress={() =>
              router.push({
                pathname: "/(auth)/login",
                params: { redirectTo: "/(tabs)/my-bookings" },
              })
            }
          />
          <Button
            title="Register"
            onPress={() =>
              router.push({
                pathname: "/(auth)/register",
                params: { redirectTo: "/(tabs)/my-bookings" },
              })
            }
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !bookings) {
    return (
      <View style={styles.center}>
        <Text style={themeStyles.text}>
          Couldn&apos;t load your bookings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookingListItem bookingDetails={item} newBookingId={newBookingId} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.emptyState} />
          ) : (
            <Text style={[styles.emptyState, themeStyles.text]}>
              {isError ? "Couldn't load your bookings." : "No bookings found."}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  loggedOutText: {
    textAlign: "center",
    fontSize: 16,
    color: theme.colors.text,
  },
  loggedOutButtons: {
    flexDirection: "row",
    gap: 12,
  },
  list: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 40,
    textAlign: "center",
  },
}));
