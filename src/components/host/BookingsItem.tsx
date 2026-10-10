import type { HostBookingDto } from "@/api/bookings";
import { BookingPhase, getBookingPhase } from "@/utils/bookingPhase";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function BookingsItem({ booking }: { booking: HostBookingDto }) {
  const phase = getBookingPhase(booking.checkIn, booking.checkOut);
  const isPast = phase === BookingPhase.PAST;
  const isActive = phase === BookingPhase.ACTIVE;

  return (
    <View
      style={StyleSheet.flatten([
        styles.card,
        isPast && styles.cardPast,
        isActive && styles.cardActive,
      ])}
    >
      <View style={styles.header}>
        <Text style={[styles.guest, isPast && styles.textPast]}>
          {booking.user.firstName} {booking.user.lastName}
        </Text>
        <Text style={[styles.status, isPast && styles.textPast]}>
          {booking.status.replace("_", " ")}
        </Text>
      </View>
      <Text style={[styles.dates, isPast && styles.textPast]}>
        {booking.checkIn} – {booking.checkOut}
      </Text>
      {isActive && <Text style={styles.phaseLabel}>Staying now</Text>}
      <Text style={styles.id}>{booking.id}</Text>
    </View>
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
  },
  cardActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  guest: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.text,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    color: theme.colors.accent,
  },
  dates: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.accent,
  },
  id: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  textPast: {
    color: theme.colors.textMuted,
  },
}));
