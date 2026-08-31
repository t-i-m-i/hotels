import type { BookingDetails } from "@/api/bookings";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

export function BookingListItem({
  bookingDetails,
}: {
  bookingDetails: BookingDetails;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.hotelName}>{bookingDetails.hotel.name}</Text>
      <Text style={styles.dates}>
        {bookingDetails.checkIn} – {bookingDetails.checkOut}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    gap: 4,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: "600",
  },
  dates: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
