import type { HostHotelBookingsDto } from "@/api/bookings";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BookingsItem } from "./BookingsItem";

export function BookingsHotel({ hotel }: { hotel: HostHotelBookingsDto }) {
  return (
    <View style={styles.container}>
      <Text style={styles.hotelName}>{hotel.hotelName}</Text>
      {hotel.bookings.map((booking) => (
        <BookingsItem key={booking.id} booking={booking} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 8,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));
