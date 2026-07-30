import { Link } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Hotel } from "@/api/hotels";
import { useHotels } from "@/api/hooks/useHotels";

function HotelListItem({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={{ pathname: "/hotel/[hotelId]", params: { hotelId: hotel.id } }}
      asChild
    >
      <Pressable style={styles.card}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        <Text style={styles.description}>{hotel.description}</Text>
      </Pressable>
    </Link>
  );
}

export default function Index() {
  const { data: hotels, isLoading, isError } = useHotels();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !hotels) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <Text>Couldn&apos;t load hotels.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={hotels}
        keyExtractor={(hotel) => hotel.id}
        renderItem={({ item }) => <HotelListItem hotel={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Link href="/map" asChild>
            <Pressable style={styles.mapLink}>
              <Text style={styles.mapLinkText}>View all on map</Text>
            </Pressable>
          </Link>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  mapLink: {
    marginBottom: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },
  mapLinkText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
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
  description: {
    fontSize: 14,
    color: "#3A3A3C",
  },
});
