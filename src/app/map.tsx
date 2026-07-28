import {
  Camera,
  type CameraRef,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import { MAP_STYLE_URL } from "@/constants/map";
import { mockHotels } from "@/data/mockHotels";
import { boundsForHotels, hotelToLngLat } from "@/utils/geo";

export default function MapScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const cameraRef = useRef<CameraRef>(null);

  const selectedHotel = mockHotels.find((hotel) => hotel.id === hotelId);

  useEffect(() => {
    if (selectedHotel) {
      cameraRef.current?.flyTo({
        center: hotelToLngLat(selectedHotel),
        zoom: 14,
        duration: 1200,
      });
    } else {
      cameraRef.current?.fitBounds(boundsForHotels(mockHotels), {
        padding: { top: 60, right: 60, bottom: 60, left: 60 },
        duration: 1200,
      });
    }
  }, [selectedHotel]);

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={MAP_STYLE_URL}>
        <Camera
          ref={cameraRef}
          initialViewState={{
            bounds: boundsForHotels(mockHotels),
            padding: { top: 60, right: 60, bottom: 60, left: 60 },
          }}
        />
        {mockHotels.map((hotel) => (
          <Marker key={hotel.id} lngLat={hotelToLngLat(hotel)}>
            <View
              style={[
                styles.pin,
                hotel.id === selectedHotel?.id && styles.pinSelected,
              ]}
            >
              <Text style={styles.pinLabel}>{hotel.name.charAt(0)}</Text>
            </View>
          </Marker>
        ))}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  pinSelected: {
    backgroundColor: "#E0432B",
  },
  pinLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
});
