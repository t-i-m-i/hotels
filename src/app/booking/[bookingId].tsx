import { useBooking } from "@/api/hooks/useBookings";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

export default function BookingScreen() {
  const { theme } = useUnistyles();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { data: booking, isLoading, isError } = useBooking(bookingId);

  if (isLoading) {
    return <ActivityIndicator color={theme.colors.primary} />;
  }

  if (isError || !booking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.flexView}>
      <Stack.Screen
        options={{
          title: "Booking Details",
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text>{booking.id}</Text>
        <Text>{booking.hotelId}</Text>
        <Text>{booking.checkIn}</Text>
        <Text>{booking.checkOut}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flexView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
