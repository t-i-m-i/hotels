import { useMyBookings } from "@/api/hooks/useBookings";
import { BookingListItem } from "@/components/BookingListItem";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyBookings() {
  const { data: bookings, isLoading, isError } = useMyBookings();

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
        <Text>Couldn&apos;t load your bookings.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View>
        <Text>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <BookingListItem bookingDetails={item} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.emptyState} />
          ) : (
            <Text style={styles.emptyState}>
              {isError ? "Couldn't load your bookings." : "No bookings found."}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
});
