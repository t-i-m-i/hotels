import { Stack, useLocalSearchParams } from "expo-router";
import HotelMap from "@/components/HotelMap";
import { mockHotels } from "@/data/mockHotels";

export default function HotelScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const hotel = mockHotels.find((h) => h.id === hotelId);

  return (
    <>
      <Stack.Screen
        options={{
          title: hotel?.name ?? "Hotel Details",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <HotelMap selectedHotelId={hotelId} />
    </>
  );
}
