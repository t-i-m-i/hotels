import type { BookingDetails } from "@/api/bookings";
import { getLocalDateString } from "@/utils/dateRange";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

function isPastBooking(checkOut: string): boolean {
  return checkOut < getLocalDateString();
}

export function BookingListItem({
  bookingDetails,
  newBookingId,
}: {
  bookingDetails: BookingDetails;
  newBookingId: string | undefined;
}) {
  const isPast = isPastBooking(bookingDetails.checkOut);

  return (
    <Link
      href={{
        pathname: "/booking/[bookingId]",
        params: { bookingId: bookingDetails.id },
      }}
      asChild
    >
      <Pressable
        style={StyleSheet.flatten([
          styles.card,
          isPast && styles.cardPast,
          newBookingId === bookingDetails.id && styles.cardNew,
        ])}
      >
        {newBookingId === bookingDetails.id && (
          <Text style={styles.bookingConfirmedText}>Booking confirmed!</Text>
        )}
        <Text style={[styles.hotelName, isPast && styles.textPast]}>
          {bookingDetails.hotel.name}
        </Text>
        <Text style={[styles.dates, isPast && styles.textPast]}>
          {bookingDetails.checkIn} – {bookingDetails.checkOut}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    gap: 4,
  },
  cardPast: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  cardNew: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.text,
  },
  dates: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  textPast: {
    color: theme.colors.textMuted,
  },
  bookingConfirmedText: {
    color: theme.colors.accent,
    fontWeight: "600",
  },
}));
