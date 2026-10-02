import {
  getBooking,
  getBookingsByUser,
  getCurrentBookingsByHotel,
  submitBooking,
} from "@/api/bookings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const bookingKeys = {
  currentByHotel: (hotelId: string | undefined) =>
    ["current-bookings-by-hotel", hotelId] as const,
  bookingsByUser: (userId: string | undefined) =>
    ["bookings-by-user", userId] as const,
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

export function useMyBookings(userId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.bookingsByUser(userId),
    queryFn: () => getBookingsByUser(userId as string),
    enabled: !!userId,
    retry: false,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id as string),
    enabled: !!id,
  });
}
