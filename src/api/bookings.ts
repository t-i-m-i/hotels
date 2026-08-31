import { apiClient } from "@/api/client";
import type { components } from "@/api/generated/schema";

export type Booking = components["schemas"]["BookingDto"];
export type BookingDetails = components["schemas"]["BookingDetailsDto"];
export type CreateBookingDto = components["schemas"]["CreateBookingDto"];

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    const { message } = error as { message: unknown };
    return new Error(
      Array.isArray(message) ? message.join(", ") : String(message),
    );
  }
  return new Error(fallbackMessage);
}

export async function getCurrentBookingsByHotel(
  hotelId: string,
): Promise<Booking[]> {
  const { data, error } = await apiClient.GET("/bookings/hotel/{hotelId}", {
    params: { path: { hotelId } },
  });
  if (error || !data) {
    throw toError(error, `Bookings for hotel with id "${hotelId}" not found`);
  }
  return data;
}

export async function submitBooking(body: CreateBookingDto): Promise<Booking> {
  const { data, error } = await apiClient.POST("/bookings", { body });
  if (error || !data) {
    throw toError(error, "Failed to create booking");
  }
  return data;
}

export async function getBookingsByUser(
  userId: string,
): Promise<BookingDetails[]> {
  const { data, error } = await apiClient.GET("/bookings/user/{userId}", {
    params: { path: { userId } },
  });
  if (error || !data) {
    throw toError(error, `Bookings for user with id "${userId}" not found`);
  }
  return data;
}
