import { Hotel } from "@/api/hotels";
import HotelListItem from "@/components/HotelListItem";
import { useAppSelector } from "@/store/hooks";
import { useCallback } from "react";
import { Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favorites() {
  const favorites = useAppSelector((state) => state.favorites);

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => <HotelListItem hotel={item} />,
    [],
  );
  const keyExtractor = useCallback((hotel: Hotel) => hotel.id, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={favorites ?? []}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyState}>No favorites yet.</Text>
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
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  location: {
    fontSize: 13,
    color: "#6B6B70",
  },
});
