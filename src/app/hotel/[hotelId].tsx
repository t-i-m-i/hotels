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
import { Calendar } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHotels } from "@/api/hooks/useHotels";
import HotelMap from "@/components/HotelMap";

export default function HotelScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const { data: hotels, isLoading, isError } = useHotels();
  const hotel = hotels?.find((h) => h.id === hotelId);

  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !hotels) {
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

        <Pressable
          style={styles.selectDatesButton}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Text>Select dates</Text>
        </Pressable>
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <Pressable onPress={() => {}}>
          <Text>Book</Text>
        </Pressable>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["60%"]}
        enableDynamicSizing={false}
        enablePanDownToClose
      >
        <Calendar />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flexView: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    borderWidth: 2,
    borderColor: "tomato",
  },
  contentContainer: {
    borderWidth: 2,
    borderColor: "hotpink",
  },
  mapContainer: {
    height: Dimensions.get("window").height * 0.35,
  },
  selectDatesButton: {
    padding: 16,
  },
  bottomBar: {
    borderWidth: 1,
    borderColor: "lime",
  },
});
