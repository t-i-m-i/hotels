import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentBookingsByHotel, submitBooking } from "@/api/bookings";

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

export function useCreateBooking(hotelId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bookingKeys.currentByHotel(hotelId),
      });
    },
    onError: (error) => {
      console.error(error.message);
    },
  });
}
