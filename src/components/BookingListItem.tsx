import type { BookingDetails } from "@/api/bookings";
import { BookingPhase, getBookingPhase } from "@/utils/bookingPhase";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function BookingListItem({
  bookingDetails,
  newBookingId,
}: {
  bookingDetails: BookingDetails;
  newBookingId: string | undefined;
}) {
  const router = useRouter();
  const isPast =
    getBookingPhase(bookingDetails.checkIn, bookingDetails.checkOut) ===
    BookingPhase.PAST;

  return (
    <Pressable
      // Not <Link asChild>: Slot rejects array styles, and flattening breaks Unistyles.
      // see: https://unistyl.es/v3/guides/merging-styles
      onPress={() =>
        router.push({
          pathname: "/booking/[bookingId]",
          params: { bookingId: bookingDetails.id },
        })
      }
      style={[
        styles.card,
        isPast && styles.cardPast,
        newBookingId === bookingDetails.id && styles.cardNew,
      ]}
    >
      {newBookingId === bookingDetails.id && (
        <Text style={styles.bookingMadeText}>Booking made successfully!</Text>
      )}
      <Text style={[styles.hotelName, isPast && styles.textPast]}>
        {bookingDetails.hotel.name}
      </Text>
      <Text style={[styles.dates, isPast && styles.textPast]}>
        {bookingDetails.checkIn} – {bookingDetails.checkOut}
      </Text>
      <Text style={styles.status}>{bookingDetails.status}</Text>
    </Pressable>
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
  bookingMadeText: {
    color: theme.colors.accent,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    color: theme.colors.accent,
  },
}));
