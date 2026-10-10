import { useHostBookings } from "@/api/hooks/useBookings";
import { BookingsHotel } from "@/components/host/BookingsHotel";
import { useSessionUser } from "@/hooks/useSessionUser";
import { themeStyles } from "@/styles/themeStyles";
import { ActivityIndicator, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function Index() {
  const user = useSessionUser();
  const { data: bookings, isLoading, isError } = useHostBookings(user?.id);

  // Only the frame after sign-out; the root layout guarantees a session.
  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={bookings ?? []}
        renderItem={({ item }) => <BookingsHotel hotel={item} />}
        keyExtractor={(item) => item.hotelId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.empty} />
          ) : (
            <Text style={[themeStyles.text, styles.empty]}>
              {isError ? "Couldn't load your bookings." : "No bookings yet."}
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
    gap: 24,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
  },
}));
