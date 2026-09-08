import { useEffect } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { getHotel, getHotels } from "@/api/hotels";

type UseHotelsOptions = {
  pageSize?: number;
  /**
   * Whether the query should run. Omit (or `true`) for a browse-all list;
   * pass `false` to park the query until it's actually wanted (e.g. the
   * search screen before the user has typed anything).
   */
  enabled?: boolean;
};

export function useHotels(search?: string, options?: UseHotelsOptions) {
  /**
   * Collapse "" to undefined so an empty search shares the browse-all cache
   * entry instead of firing an identical request under a different key.
   *
   * The caller trims into `trimmedSearch`, but when the box is empty that value
   * is "", not undefined, and `useHotels(trimmedSearch)` is still called (hooks
   * can't be conditional). Without this:
   *   - the queryKey becomes ["hotels", "", 20], a separate cache entry from the
   *     home tab's ["hotels", undefined, 20], so the full list is fetched twice;
   *   - getHotels("") sends `?search=`, and the backend does `'' ?? null` → ''
   *     (an empty string isn't nullish) → `ILIKE '%%'`. It works, but it's a
   *     needless round trip on a different key.
   *
   * `"" || undefined` folds empty search back onto the browse-all key.
   */
  const normalized = search?.trim() || undefined;
  const pageSize = options?.pageSize;

  const {
    data: hotels,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["hotels", normalized, pageSize],
    queryFn: ({ pageParam }) => getHotels(normalized, pageParam, pageSize),
    /**
     * `enabled: true` (or undefined, the default) fetches as soon as the hook
     * mounts. `enabled: false` parks the query: no request until it flips true.
     *
     * It matters on the search screen. While the box is empty we don't want to
     * fetch the entire hotel table, so that screen passes
     * `{ enabled: hasSearchQuery }` — "don't run until the user has typed
     * something". The home tab passes nothing, defaults to true, and always
     * loads, which is what a browse-all list wants. Home is always on; search
     * is on-demand.
     */
    enabled: options?.enabled,
    initialPageParam: 1,
    // staleTime: 1000 * 60 * 5, // turn on for prod
    /**
     * On the search screen every debounced keystroke changes the queryKey.
     * Without this the list blanks to a spinner between terms; keepPreviousData
     * holds the old results on screen until the new search resolves. It's a
     * no-op on the home tab, whose key never changes.
     */
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((p) => p.data),
  });

  return {
    hotels,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  };
}

/**
 * The Map tab needs every hotel, not one page — this drains all pages on mount.
 * Fine at the current scale (~2 requests). TODO: replace with a viewport query,
 * e.g. GET /hotels?swLat=&swLng=&neLat=&neLng= driven by the map's
 * onRegionChangeComplete. Hotels already carry geo, so the API only needs the
 * bounds params — no new data.
 */
export function useAllHotels() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["hotels", "all"],
    queryFn: ({ pageParam }) => getHotels(undefined, pageParam, 80),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((p) => p.data),
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    hotels: data ?? [],
    /**
     * Stay "loading" until every page is in, so the map doesn't pop pins in
     * one batch at a time. Drop the spinner if a fetch errored mid-drain
     * (hasNextPage can still be true then), otherwise the map would hang on
     * the loader forever.
     */
    isLoading: (isLoading || !!hasNextPage) && !isError,
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
