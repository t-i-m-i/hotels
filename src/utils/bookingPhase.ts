import { getLocalDateString } from "./dateRange";

export const BookingPhase = {
  ACTIVE: "ACTIVE",
  UPCOMING: "UPCOMING",
  PAST: "PAST",
} as const;

export type BookingPhaseType = (typeof BookingPhase)[keyof typeof BookingPhase];

// checkIn / checkOut are plain "YYYY-MM-DD" strings, so compare them directly
// against the local day - going through `new Date(...)` would parse as UTC and
// can shift the day (see docs/logs/003-isPastBooking-utc-bug.md).
export function getBookingPhase(
  checkIn: string,
  checkOut: string,
): BookingPhaseType {
  const today = getLocalDateString();

  if (today < checkIn) return BookingPhase.UPCOMING;
  if (today > checkOut) return BookingPhase.PAST;
  return BookingPhase.ACTIVE;
}
