import { useBooking } from "@/api/hooks/useBookings";
import { themeStyles } from "@/styles/themeStyles";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useUnistyles, StyleSheet } from "react-native-unistyles";

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
        <Text style={themeStyles.text}>{booking.id}</Text>
        <Text style={themeStyles.text}>{booking.hotelId}</Text>
        <Text style={themeStyles.text}>{booking.checkIn}</Text>
        <Text style={themeStyles.text}>{booking.checkOut}</Text>
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
