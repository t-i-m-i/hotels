import { useHotels, useHotelsInfinite } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";
import HotelListPaginated from "@/components/HotelListPaginated";

export default function Index() {
  // const { data: hotels, isLoading, isError } = useHotels();
  // return <HotelList hotels={hotels} isLoading={isLoading} isError={isError} />;

  const {
    hotels,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useHotelsInfinite();
  return (
    <HotelListPaginated
      hotels={hotels}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isError={isError}
    />
  );
}
