import { authClient } from "@/api/authClient";
import { useHostBookings } from "@/api/hooks/useBookings";
import { BookingsHotel } from "@/components/host/BookingsHotel";
import { themeStyles } from "@/styles/themeStyles";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

export default function Index() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const {
    data: bookings,
    isLoading,
    isError,
  } = useHostBookings(session?.user.id);

  if (isSessionPending || isLoading) {
    return <ActivityIndicator style={styles.center} />;
  }

  if (isError || !bookings) {
    return (
      <View style={styles.center}>
        <Text style={themeStyles.text}>Couldn&apos;t load your bookings.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <Text style={themeStyles.text}>{JSON.stringify(bookings, null, 2)}</Text> */}
      <FlatList
        data={bookings}
        renderItem={({ item }) => <BookingsHotel hotel={item} />}
        keyExtractor={(item) => item.hotelId}
        contentContainerStyle={styles.list}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
}));
