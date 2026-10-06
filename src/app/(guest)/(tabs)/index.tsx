import { useHotels } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";
import { themeStyles } from "@/styles/themeStyles";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const headerComponent = (
    <View style={themeStyles.headerView}>
      <Link href="/map" asChild>
        <Pressable style={themeStyles.headerLink}>
          <Text style={themeStyles.headerLinkText}>View all on map</Text>
        </Pressable>
      </Link>

      <Link href="/nearest" asChild>
        <Pressable style={themeStyles.headerLink}>
          <Text style={themeStyles.headerLinkText}>Find nearest</Text>
        </Pressable>
      </Link>
    </View>
  );

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
      headerComponent={headerComponent}
    />
  );
}
