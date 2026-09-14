import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useHotelsInBounds } from "@/api/hooks/useHotels";
import HotelMap from "@/components/HotelMap";
import { DEFAULT_MAP_BOUNDS } from "@/constants/map";
import type { Bounds } from "@/utils/geo";

export default function MapScreen() {
  const [bounds, setBounds] = useState<Bounds>(DEFAULT_MAP_BOUNDS);
  const { hotels, isError } = useHotelsInBounds(bounds);

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Couldn&apos;t load hotels.</Text>
      </View>
    );
  }

  return <HotelMap hotels={hotels} onBoundsChange={setBounds} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
