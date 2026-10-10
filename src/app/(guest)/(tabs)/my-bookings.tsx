import { useMyBookings } from "@/api/hooks/useBookings";
import { BookingListItem } from "@/components/BookingListItem";
import LoginPrompt from "@/components/LoginPrompt";
import { useSessionUser } from "@/hooks/useSessionUser";
import { themeStyles } from "@/styles/themeStyles";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function MyBookings() {
  const user = useSessionUser();
  const { data: bookings, isLoading, isError } = useMyBookings(user?.id);
  const { newBookingId } = useLocalSearchParams<{ newBookingId?: string }>();

  if (!user) {
    return (
      <LoginPrompt
        message="Please login to manage your bookings"
        redirectTo="/(guest)/(tabs)/my-bookings"
      />
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
