import type { Hotel } from "@/api/hotels";
import { ReactElement, useCallback } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import HotelListItem from "./HotelListItem";

type HotelListPaginatedProps = {
  hotels: Hotel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  headerComponent?: ReactElement;
  safeAreaEdges?: ("top" | "bottom" | "left" | "right")[];
};

export default function HotelList({
  hotels,
  isLoading,
  isError,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  headerComponent,
  safeAreaEdges = ["top"],
}: HotelListPaginatedProps) {
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

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 40,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  mapLink: {
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  mapLinkText: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
}));
