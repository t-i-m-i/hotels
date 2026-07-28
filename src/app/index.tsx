import { FlatList, StyleSheet, Text, View } from "react-native";

import { mockHotels } from "@/data/mockHotels";
import type { Hotel } from "@/types/hotel";

function HotelListItem({ hotel }: { hotel: Hotel }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.location}>{hotel.location}</Text>
      <Text style={styles.description}>{hotel.description}</Text>
    </View>
  );
}

export default function Index() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockHotels}
        keyExtractor={(hotel) => hotel.id}
        renderItem={({ item }) => <HotelListItem hotel={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
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
