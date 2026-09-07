import type { Hotel } from "@/api/hotels";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import HotelListItem from "./HotelListItem";
import { useCallback } from "react";

type HotelListPaginatedProps = {
  hotels: Hotel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  showMapLink?: boolean;
};

export default function HotelListPaginated({
  hotels,
  isLoading,
  isError,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  showMapLink = true,
}: HotelListPaginatedProps) {
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.emptyState}>
          {isError ? "Couldn't load hotels." : "No hotels found."}
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={hotels ?? []}
        keyExtractor={(hotel) => hotel.id}
        renderItem={({ item }) => <HotelListItem hotel={item} />}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          showMapLink ? (
            <Link href="/map" asChild>
              <Pressable style={styles.mapLink}>
                <Text style={styles.mapLinkText}>View all on map</Text>
              </Pressable>
            </Link>
          ) : undefined
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
