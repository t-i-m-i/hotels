import type { HostBookingDto, UpdateBookingStatusDto } from "@/api/bookings";
import { useUpdateStatus } from "@/api/hooks/useBookings";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";
import { useSessionUser } from "@/hooks/useSessionUser";
import { isInactiveStatus } from "@/utils/bookingStatus";
import { isTodayInRange } from "@/utils/dateRange";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function BookingsItem({ booking }: { booking: HostBookingDto }) {
  const isInactive = isInactiveStatus(booking.status);
  const stayingNow =
    booking.status === "confirmed" &&
    isTodayInRange(booking.checkIn, booking.checkOut);

  // Update booking status
  const user = useSessionUser();
  const {
    mutate: mutateStatus,
    isPending: isUpdatingStatus,
    variables,
    error: updateStatusError,
  } = useUpdateStatus(user?.id);

  const handleUpdateStatus = (status: UpdateBookingStatusDto["status"]) => {
    mutateStatus({ id: booking.id, status });
  };

  const isUpdating = (status: UpdateBookingStatusDto["status"]) => {
    // variables stays set after the request finishes, so always combine it with isPending
    return isUpdatingStatus && variables?.status === status;
  };

  return (
    <View
      style={[
        styles.card,
        isInactive && styles.cardPast,
        stayingNow && styles.cardActive,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.guest, isInactive && styles.textPast]}>
          {booking.user.firstName} {booking.user.lastName}
        </Text>
        <Text style={[styles.status, isInactive && styles.textPast]}>
          {booking.status.replace("_", " ")}
        </Text>
      </View>
      <Text style={[styles.dates, isInactive && styles.textPast]}>
        {booking.checkIn} – {booking.checkOut}
      </Text>
      {stayingNow && (
        <Text style={styles.phaseLabel}>Guest is staying now!</Text>
      )}
      <Text style={styles.id}>{booking.id}</Text>

      {updateStatusError && <ErrorText message={updateStatusError.message} />}

      {booking.allowedStatusChanges.includes("confirmed") && (
        <View style={styles.buttonContainer}>
          <Button
            title={isUpdating("confirmed") ? "Updating..." : "Confirm Booking"}
            onPress={() => handleUpdateStatus("confirmed")}
            isPending={isUpdatingStatus}
            fontSize={14}
          />
        </View>
      )}

      {booking.allowedStatusChanges.includes("cancelled") && (
        <View style={styles.buttonContainer}>
          <Button
            title={isUpdating("cancelled") ? "Updating..." : "Cancel Booking"}
            onPress={() => handleUpdateStatus("cancelled")}
            isPending={isUpdatingStatus}
            fontSize={14}
          />
        </View>
      )}

      {booking.allowedStatusChanges.includes("no_show") && (
        <View style={styles.buttonContainer}>
          <Button
            title={isUpdating("no_show") ? "Updating..." : "Set as No Show"}
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
}));
