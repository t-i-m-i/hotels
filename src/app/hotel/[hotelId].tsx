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

import { useCurrentBookingsByHotel } from "@/api/hooks/useBookings";
import { useHotels } from "@/api/hooks/useHotels";
import useDateRangeSelection from "@/hooks/useDateRangeSelection";
import HotelBookingSheet from "@/components/HotelBookingSheet";
import HotelDetails from "@/components/HotelDetails";
import HotelMap from "@/components/HotelMap";

export default function HotelScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const { data: hotels, isLoading, isError } = useHotels();
  const { data: bookings } = useCurrentBookingsByHotel(hotelId);
  const hotel = hotels?.find((h) => h.id === hotelId);

  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { markedDates, selectedRange, handleDayPress } = useDateRangeSelection({
    bookings,
  });

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
        <Pressable
          disabled={!selectedRange.start || !selectedRange.end}
          onPress={() => {}}
        >
          <Text>Book</Text>
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
    // borderWidth: 1,
    // borderColor: "lime",
  },
});
