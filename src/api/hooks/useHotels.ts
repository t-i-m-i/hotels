import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { getHotel, getHotels, getHotelsPaginated } from "@/api/hotels";

export function useHotels(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["hotels", search],
    queryFn: () => getHotels(search),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useHotelsInfinite() {
  // todo: learn each param
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["hotels-infinite"],
    queryFn: ({ pageParam }) => getHotelsPaginated(pageParam),
    initialPageParam: 1,
    // staleTime: 1000 * 60 * 5, // turn on for prod
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });

  // todo: this is always need for infinite query -> doesn't tanstack have an useIQ option to flaten data itself?
  const hotels = data?.pages.flatMap((p) => p.data) ?? [];

  return {
    hotels,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  };
}

export function useHotel(id: string | undefined) {
  return useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getHotel(id as string),
    enabled: !!id,
  });
}
