import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHotel, getHotels } from "@/api/hotels";

export function useHotels(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["hotels", search],
    queryFn: () => getHotels(search),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useHotel(id: string | undefined) {
  return useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getHotel(id as string),
    enabled: !!id,
  });
}
