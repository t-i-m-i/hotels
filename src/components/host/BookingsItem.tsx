import type { HostBookingDto, UpdateBookingStatusDto } from "@/api/bookings";
import { useUpdateStatus } from "@/api/hooks/useBookings";
import { Button } from "@/components/ui/Button";
import { useSessionUser } from "@/hooks/useSessionUser";
import { BookingPhase, getBookingPhase } from "@/utils/bookingPhase";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function BookingsItem({ booking }: { booking: HostBookingDto }) {
  const phase = getBookingPhase(booking.checkIn, booking.checkOut);
  const isPast = phase === BookingPhase.PAST;
  const isActive = phase === BookingPhase.ACTIVE;
  const isUpcoming = phase === BookingPhase.UPCOMING;

  // Update booking status
  const user = useSessionUser();
  const {
    mutate: mutateStatus,
    isPending: isUpdatingStatus,
    error: updateStatusError,
  } = useUpdateStatus(user?.id);

  const handleUpdateStatus = (status: UpdateBookingStatusDto["status"]) => {
    mutateStatus({ id: booking.id, status });
  };

  return (
    <View
      style={[
        styles.card,
        isPast && styles.cardPast,
        isActive && styles.cardActive,
      ]}
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

      {updateStatusError && (
        <Text style={styles.errorMessageText}>
          {updateStatusError.message}
        </Text>
      )}

      {booking.status === "pending" && (isUpcoming || isActive) && (
        <>
          <View style={styles.buttonContainer}>
            <Button
              title={isUpdatingStatus ? "Updating..." : "Confirm Booking"}
              onPress={() => handleUpdateStatus("confirmed")}
              isPending={isUpdatingStatus}
              fontSize={14}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={isUpdatingStatus ? "Updating..." : "Cancel Booking"}
              onPress={() => handleUpdateStatus("cancelled")}
              isPending={isUpdatingStatus}
              fontSize={14}
            />
          </View>
        </>
      )}
      {booking.status === "confirmed" && (isActive || isUpcoming) && (
        <View style={styles.buttonContainer}>
          <Button
            title={isUpdatingStatus ? "Updating..." : "Cancel Booking"}
            onPress={() => handleUpdateStatus("cancelled")}
            isPending={isUpdatingStatus}
            fontSize={14}
          />
        </View>
      )}
      {booking.status === "confirmed" && (isActive || isPast) && (
        <View style={styles.buttonContainer}>
          <Button
            title={isUpdatingStatus ? "Updating..." : "Set as No Show"}
            onPress={() => handleUpdateStatus("no_show")}
            isPending={isUpdatingStatus}
            fontSize={14}
          />
        </View>
      )}
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
  buttonContainer: {
    marginTop: 16,
  },
  errorMessageText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
}));
