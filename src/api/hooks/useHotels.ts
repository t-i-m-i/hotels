import { useQuery } from "@tanstack/react-query";
import { getHotels } from "@/api/hotels";

export function useHotels(search?: string) {
  return useQuery({
    queryKey: ["hotels", search],
    queryFn: () => getHotels(search),
  });
}
