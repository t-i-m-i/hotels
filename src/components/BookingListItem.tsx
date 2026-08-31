import type { BookingDetails } from "@/api/bookings";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

function isPastBooking(checkOut: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return checkOut < today;
}

export function BookingListItem({
  bookingDetails,
}: {
  bookingDetails: BookingDetails;
}) {
  const isPast = isPastBooking(bookingDetails.checkOut);

  return (
    <View style={[styles.card, isPast && styles.cardPast]}>
      <Text style={[styles.hotelName, isPast && styles.textPast]}>
        {bookingDetails.hotel.name}
      </Text>
      <Text style={[styles.dates, isPast && styles.textPast]}>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D1D1D6",
    gap: 4,
  },
  cardPast: {
    backgroundColor: "#FAFAFA",
    borderColor: "#E5E5EA",
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
  textPast: {
    color: "#9A9A9E",
  },
});
