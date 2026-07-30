import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useHotels } from "@/api/hooks/useHotels";
import HotelMap from "@/components/HotelMap";

export default function MapScreen() {
  const { data: hotels, isLoading, isError } = useHotels();

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
        <Text>Couldn&apos;t load hotels.</Text>
      </View>
    );
  }

  return <HotelMap hotels={hotels} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
