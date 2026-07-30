import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useHotels } from "@/api/hooks/useHotels";
import HotelMap from "@/components/HotelMap";

export default function HotelScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const { data: hotels, isLoading, isError } = useHotels();
  const hotel = hotels?.find((h) => h.id === hotelId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !hotels) {
    return (
      <View style={styles.center}>
        <Text>Couldn&apos;t load hotel.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: hotel?.name ?? "Hotel Details",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <HotelMap hotels={hotels} selectedHotelId={hotelId} />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
