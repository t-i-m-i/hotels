import type { Hotel } from "@/api/hotels";
import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HotelListItem from "./HotelListItem";

import * as Location from "expo-location";

type HotelListPaginatedProps = {
  hotels: Hotel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  showMapLink?: boolean;
};

export default function HotelList({
  hotels,
  isLoading,
  isError,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  showMapLink = true,
}: HotelListPaginatedProps) {
  // State for location
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => <HotelListItem hotel={item} />,
    [],
  );

  const keyExtractor = useCallback((hotel: Hotel) => hotel.id, []);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationMsg("Permission to access location was denied.");
      return;
    }

    // catch if permission is granted but location cannot be fetched (e.g., GPS off)
    setIsLocating(true);
    const currentLocation = await Location.getCurrentPositionAsync({}).catch(
      () => {
        setLocationMsg("Failed to get current location.");
        return null;
      },
    );
    setIsLocating(false);

    if (!currentLocation) {
      return;
    }

    setLocation(currentLocation);
  }

  const headerComponent = showMapLink ? (
    <View>
      <View
        style={{
          gap: 8,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Link href="/map" asChild>
          <Pressable style={StyleSheet.flatten([styles.mapLink, { flex: 1 }])}>
            <Text style={styles.mapLinkText}>View all on map</Text>
          </Pressable>
        </Link>

        <Pressable
          style={styles.mapLink}
          onPress={() => getCurrentLocation()}
          disabled={isLocating}
        >
          <Text style={[styles.mapLinkText, isLocating && { opacity: 0 }]}>
            Locate me
          </Text>
          {isLocating ? (
            <ActivityIndicator style={StyleSheet.absoluteFill} color="white" />
          ) : null}
        </Pressable>
      </View>
      {locationMsg && <Text>{locationMsg}</Text>}
    </View>
  ) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={hotels ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        contentContainerStyle={styles.list}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.emptyState} />
          ) : (
            <Text style={styles.emptyState}>
              {isError ? "Couldn't load hotels." : "No hotels found."}
            </Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerSpinner} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 40,
    textAlign: "center",
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  mapLink: {
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  mapLinkText: {
    color: colors.onPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
});
