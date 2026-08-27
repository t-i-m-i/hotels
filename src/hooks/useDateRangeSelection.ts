import { Booking } from "@/api/bookings";
import { getDatesInRange } from "@/utils/dateRange";
import { useMemo, useState } from "react";
import { DateData, MarkedDates } from "react-native-calendars/src/types";

export type SelectedRange = { start?: string; end?: string };
const SELECTED_RANGE_COLOR = "#0a84ff";

export default function useDateRangeSelection({
  bookings,
}: {
  bookings?: Booking[];
}) {
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({});

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings?.forEach((booking) => {
      getDatesInRange(booking.checkIn, booking.checkOut).forEach((date) =>
        dates.add(date),
      );
    });
    return dates;
  }, [bookings]);

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    bookedDates.forEach((date) => {
      marks[date] = { disabled: true, disableTouchEvent: true };
    });

    const { start, end } = selectedRange;
    if (start && end) {
      const rangeDates = getDatesInRange(start, end);
      rangeDates.forEach((date, index) => {
        marks[date] = {
          color: SELECTED_RANGE_COLOR,
          textColor: "white",
          startingDay: index === 0,
          endingDay: index === rangeDates.length - 1,
        };
      });
    } else if (start) {
      marks[start] = {
        color: SELECTED_RANGE_COLOR,
        textColor: "white",
        startingDay: true,
        endingDay: true,
      };
    }

    return marks;
  }, [bookedDates, selectedRange]);

  const handleDayPress = (day: DateData) => {
    const { dateString } = day;
    if (bookedDates.has(dateString)) {
      return;
    }

    const { start, end } = selectedRange;
    if (!start || end) {
      setSelectedRange({ start: dateString });
      return;
    }

    if (dateString < start) {
      setSelectedRange({ start: dateString });
      return;
    }

    const spansBookedDate = getDatesInRange(start, dateString).some((date) =>
      bookedDates.has(date),
    );
    setSelectedRange(
      spansBookedDate ? { start: dateString } : { start, end: dateString },
    );
  };

  return { markedDates, selectedRange, handleDayPress };
}
