import { useNearestHotels } from "@/api/hooks/useHotels";
import HotelList from "@/components/HotelList";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { themeStyles } from "@/styles/themeStyles";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

export default function Nearest() {
  const { theme } = useUnistyles();
  const { location, isLocating, locationMsg, getCurrentLocation } =
    useCurrentLocation();

  const {
    hotels,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useNearestHotels(location?.coords.longitude, location?.coords.latitude);

  const headerComponent = (
    <View>
      <View style={[themeStyles.headerView, { justifyContent: "flex-end" }]}>
        <Pressable
          style={themeStyles.headerLink}
          onPress={getCurrentLocation}
          disabled={isLocating}
        >
          <Text
            style={[themeStyles.headerLinkText, isLocating && { opacity: 0 }]}
          >
            Refresh location
          </Text>
          {isLocating && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              color={theme.colors.text}
            />
          )}
        </Pressable>
      </View>
      {locationMsg && <Text style={themeStyles.text}>{locationMsg}</Text>}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nearest Hotels",
        }}
      />
      <HotelList
        hotels={hotels}
        isLoading={isLoading || isLocating}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isError={isError}
        headerComponent={headerComponent}
        safeAreaEdges={[]}
      />
    </>
  );
}
