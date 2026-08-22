import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHotels } from "@/api/hotels";

export function useHotels(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["hotels", search],
    queryFn: () => getHotels(search),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}
