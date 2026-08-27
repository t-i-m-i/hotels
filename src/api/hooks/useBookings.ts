import { useQuery } from "@tanstack/react-query";
import { getCurrentBookingsByHotel } from "@/api/bookings";

export function useCurrentBookingsByHotel(hotelId: string | undefined) {
  return useQuery({
    queryKey: ["current-bookings-by-hotel", hotelId],
    queryFn: () => getCurrentBookingsByHotel(hotelId as string),
    enabled: !!hotelId,
  });
}
