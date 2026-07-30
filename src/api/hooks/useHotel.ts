import { useQuery } from "@tanstack/react-query";
import { getHotel } from "@/api/hotels";

export function useHotel(id: string | undefined) {
  return useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getHotel(id as string),
    enabled: !!id,
  });
}
