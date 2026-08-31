import BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  bookingKeys,
  useCurrentBookingsByHotel,
} from "@/api/hooks/useBookings";
import { useHotels } from "@/api/hooks/useHotels";
import useDateRangeSelection from "@/hooks/useDateRangeSelection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import HotelBookingSheet from "@/components/HotelBookingSheet";
import HotelDetails from "@/components/HotelDetails";
import HotelMap from "@/components/HotelMap";
import { submitBooking } from "@/api/bookings";

export default function HotelScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const { data: hotels, isLoading, isError } = useHotels();
  const { data: bookings } = useCurrentBookingsByHotel(hotelId);
  const hotel = hotels?.find((h) => h.id === hotelId);

  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();

  const { markedDates, selectedRange, handleDayPress, resetSelection } =
    useDateRangeSelection({ bookings });

  const {
    mutate: book,
    isPending: isBooking,
    isSuccess: isBooked,
    error: bookingError,
  } = useMutation({
    mutationFn: submitBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bookingKeys.currentByHotel(hotelId),
      });
      resetSelection();
      bottomSheetRef.current?.close();
    },
    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleBooking = () => {
    if (!hotel || !selectedRange.start || !selectedRange.end) {
      return;
    }
    book({
      hotelId: hotel.id,
      checkIn: selectedRange.start,
      checkOut: selectedRange.end,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !hotels || !hotel) {
    return (
      <View style={styles.center}>
        <Text>Couldn&apos;t load hotel.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flexView}>
      <Stack.Screen
        options={{
          title: hotel?.name ?? "Hotel Details",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.mapContainer}>
          <HotelMap hotels={hotels} selectedHotelId={hotelId} />
        </View>

        <HotelDetails
          hotel={hotel}
          bottomSheetRef={bottomSheetRef}
          selectedRange={selectedRange}
        />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        {isBooked && <Text>Booking confirmed!</Text>}
        {bookingError && <Text>{bookingError.message}</Text>}
        <Pressable
          disabled={!selectedRange.start || !selectedRange.end || isBooking}
          onPress={handleBooking}
          style={({ pressed }) => [
            styles.bookButton,
            (!selectedRange.start || !selectedRange.end || isBooking) &&
              styles.bookButtonDisabled,
            pressed && styles.bookButtonPressed,
          ]}
        >
          <Text style={styles.bookButtonText}>
            {isBooking ? "Booking…" : "Book"}
          </Text>
        </Pressable>
      </View>

      <HotelBookingSheet
        bottomSheetRef={bottomSheetRef}
        markedDates={markedDates}
        onDayPress={handleDayPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flexView: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: "tomato",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: "tomato",
  },
  contentContainer: {
    // borderWidth: 2,
    // borderColor: "hotpink",
  },
  mapContainer: {
    height: Dimensions.get("window").height * 0.35,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#D1D1D6",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  bookButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonPressed: {
    backgroundColor: "#0062CC",
  },
  bookButtonDisabled: {
    backgroundColor: "#B0D2FF",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
