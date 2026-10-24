import { BookingStatus } from "@/api/bookings";

export function isInactiveStatus(status: BookingStatus): boolean {
  return (
    status === "cancelled" || status === "completed" || status === "no_show"
  );
}
