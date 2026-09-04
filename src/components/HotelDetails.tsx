import { Hotel } from "@/api/hotels";
import { colors } from "@/constants/colors";
import { SelectedRange } from "@/hooks/useDateRangeSelection";
import BottomSheet from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HotelDetails({
  hotel,
  bottomSheetRef,
  selectedRange,
}: {
  hotel: Hotel;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  selectedRange: SelectedRange;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.location}>{hotel.location}</Text>
      <Text style={styles.description}>{hotel.description}</Text>

      <Pressable
        testID="select-dates-button"
        style={({ pressed }) => [
          styles.selectDatesButton,
          pressed && styles.selectDatesButtonPressed,
        ]}
        onPress={() => bottomSheetRef.current?.expand()}
      >
        <Text style={styles.selectDatesText}>
          {selectedRange.start && selectedRange.end
            ? `${selectedRange.start} – ${selectedRange.end}`
            : selectedRange.start
              ? `${selectedRange.start} – select checkout`
              : "Select dates"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  location: {
    fontSize: 14,
    color: "#6B6B70",
  },
  description: {
    fontSize: 15,
    color: "#3A3A3C",
    marginTop: 8,
    lineHeight: 20,
  },
  selectDatesButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D1D1D6",
    alignItems: "center",
  },
  selectDatesButtonPressed: {
    backgroundColor: "#E5E5EA",
  },
  selectDatesText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
});
