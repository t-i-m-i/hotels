import { Hotel } from "@/api/hotels";
import { SelectedRange } from "@/hooks/useDateRangeSelection";
import BottomSheet from "@gorhom/bottom-sheet";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import ImagesSlider from "./ImagesSlider";

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
      <View style={styles.gallery}>
        <ImagesSlider images={hotel.images} />
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 16,
    gap: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.text,
  },
  location: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  description: {
    fontSize: 15,
    color: theme.colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  selectDatesButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  selectDatesButtonPressed: {
    backgroundColor: theme.colors.background,
  },
  selectDatesText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  gallery: {
    height: 400,
  },
}));
