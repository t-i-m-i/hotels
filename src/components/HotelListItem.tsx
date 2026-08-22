import type { Hotel } from "@/api/hotels";
import { Link } from "expo-router";
import { Pressable, Text, StyleSheet } from "react-native";

export default function HotelListItem({ hotel }: { hotel: Hotel }) {
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

const styles = StyleSheet.create({
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
