import { Hotel } from "@/api/hotels";
import { SelectedRange } from "@/hooks/useDateRangeSelection";
import BottomSheet from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text } from "react-native";

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
    <>
      <Text>{hotel.name}</Text>
      <Text>{hotel.location}</Text>
      <Text>{hotel.description}</Text>

      <Pressable
        style={styles.selectDatesButton}
        onPress={() => bottomSheetRef.current?.expand()}
      >
        <Text>
          {selectedRange.start && selectedRange.end
            ? `${selectedRange.start} – ${selectedRange.end}`
            : selectedRange.start
              ? `${selectedRange.start} – select checkout`
              : "Select dates"}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  selectDatesButton: {
    padding: 16,
  },
});
