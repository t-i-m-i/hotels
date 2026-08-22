import { useHotels } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";

export default function Index() {
  const { data: hotels, isLoading, isError } = useHotels();

  return <HotelList hotels={hotels} isLoading={isLoading} isError={isError} />;
}
