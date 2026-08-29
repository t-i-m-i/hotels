import { useQuery } from "@tanstack/react-query";
import { getCurrentBookingsByHotel } from "@/api/bookings";

export const bookingKeys = {
  currentByHotel: (hotelId: string | undefined) =>
    ["current-bookings-by-hotel", hotelId] as const,
};

export function useCurrentBookingsByHotel(hotelId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.currentByHotel(hotelId),
    queryFn: () => getCurrentBookingsByHotel(hotelId as string),
    enabled: !!hotelId,
  });
}
