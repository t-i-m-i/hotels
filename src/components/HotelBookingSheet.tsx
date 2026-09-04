import BottomSheet from "@gorhom/bottom-sheet";
import { getLocalDateString } from "@/utils/dateRange";
import { Calendar, DateData } from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";

export default function HotelBookingSheet({
  bottomSheetRef,
  markedDates,
  onDayPress,
}: {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  markedDates: MarkedDates;
  onDayPress: (day: DateData) => void;
}) {
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["60%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
    >
      <Calendar
        testID="booking-calendar"
        minDate={getLocalDateString()}
        markingType="period"
        markedDates={markedDates}
        onDayPress={onDayPress}
      />
    </BottomSheet>
  );
}
