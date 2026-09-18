import type { Hotel } from "@/api/hotels";
import { Link } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import FavoriteButton from "./FavoriteButton";

export default function HotelListItem({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={{ pathname: "/hotel/[hotelId]", params: { hotelId: hotel.id } }}
      asChild
    >
      <Pressable style={styles.card} testID="hotel-card">
        <View style={styles.header}>
          <Text style={styles.name}>{hotel.name}</Text>
          <FavoriteButton hotel={hotel} />
        </View>
        <Text style={styles.location}>{hotel.location}</Text>
        <Text style={styles.description}>{hotel.description}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    flex: 1,
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
