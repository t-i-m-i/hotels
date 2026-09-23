import type { Hotel } from "@/api/hotels";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text,
  },
  location: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
  },
}));
