import type { Hotel } from "@/api/hotels";
import { formatDistance } from "@/utils/geo";
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
        <View style={styles.locationRow}>
          <Text style={styles.location}>{hotel.location}</Text>
          {hotel.distanceMeters != null && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {formatDistance(hotel.distanceMeters)} away
              </Text>
            </View>
          )}
        </View>
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
  description: {
    fontSize: 14,
    color: theme.colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  distanceBadge: {
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  distanceText: {
    color: theme.colors.surface,
    fontSize: 12,
  },
}));
