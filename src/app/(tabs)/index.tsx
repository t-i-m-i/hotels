import { useHotels } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";

export default function Index() {
  const {
    hotels,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useHotels();
  return (
    <HotelList
      hotels={hotels}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isError={isError}
    />
  );
}
