import {
  Camera,
  type CameraRef,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MAP_STYLE_URL } from "@/constants/map";
import { mockHotels } from "@/data/mockHotels";
import { boundsForHotels, hotelToLngLat } from "@/utils/geo";

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

export default function MapScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const cameraRef = useRef<CameraRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [zoom, setZoom] = useState(12);

  const selectedHotel = mockHotels.find((hotel) => hotel.id === hotelId);

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    cameraRef.current?.zoomTo(nextZoom, { duration: 200 });
  };

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

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
  }, [selectedHotel, isMapReady]);

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE_URL}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onRegionDidChange={(event) => setZoom(event.nativeEvent.zoom)}
      >
        <Camera
          ref={cameraRef}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
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
      <View style={styles.zoomControls}>
        <Pressable
          style={styles.zoomButton}
          onPress={() => handleZoom(1)}
          hitSlop={8}
        >
          <Text style={styles.zoomButtonLabel}>+</Text>
        </Pressable>
        <View style={styles.zoomButtonDivider} />
        <Pressable
          style={styles.zoomButton}
          onPress={() => handleZoom(-1)}
          hitSlop={8}
        >
          <Text style={styles.zoomButtonLabel}>−</Text>
        </Pressable>
      </View>
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
  zoomControls: {
    position: "absolute",
    right: 16,
    bottom: 40,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomButtonDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
  },
  zoomButtonLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
});
