import { apiClient } from "@/api/client";
import type { components } from "@/api/generated/schema";

export type Booking = components["schemas"]["BookingDto"];

export async function getCurrentBookingsByHotel(
  hotelId: string,
): Promise<Booking[]> {
  const { data, error } = await apiClient.GET("/bookings/hotel/{hotelId}", {
    params: { path: { hotelId } },
  });
  if (error || !data) {
    throw (
      error ?? new Error(`Bookings for hotel with id "${hotelId}" not found`)
    );
  }
  return data;
}
