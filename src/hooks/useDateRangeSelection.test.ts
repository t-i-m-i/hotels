/// <reference types="jest" />
import { act, renderHook } from "@testing-library/react-native";

import type { Booking } from "@/api/bookings";
import useDateRangeSelection from "@/hooks/useDateRangeSelection";

// Minimal DateData shape - handleDayPress only reads `dateString`.
const day = (dateString: string) => ({
  dateString,
  day: Number(dateString.slice(-2)),
  month: Number(dateString.slice(5, 7)),
  year: Number(dateString.slice(0, 4)),
  timestamp: Date.parse(dateString),
});

const booked = [{ checkIn: "2026-02-12", checkOut: "2026-02-15" } as Booking];

describe("useDateRangeSelection", () => {
  it("sets the check-in on the first press", async () => {
    const { result } = await renderHook(() => useDateRangeSelection({}));

    await act(() => result.current.handleDayPress(day("2026-02-10")));

    expect(result.current.selectedRange).toEqual({ start: "2026-02-10" });
  });

  it("completes the range and fires onRangeComplete on the second press", async () => {
    const onRangeComplete = jest.fn();
    const { result } = await renderHook(() =>
      useDateRangeSelection({ onRangeComplete }),
    );

    await act(() => result.current.handleDayPress(day("2026-02-10")));
    await act(() => result.current.handleDayPress(day("2026-02-14")));

    expect(result.current.selectedRange).toEqual({
      start: "2026-02-10",
      end: "2026-02-14",
    });
    expect(onRangeComplete).toHaveBeenCalledTimes(1);
  });

  it("moves the check-in back when the second press is earlier", async () => {
    const onRangeComplete = jest.fn();
    const { result } = await renderHook(() =>
      useDateRangeSelection({ onRangeComplete }),
    );

    await act(() => result.current.handleDayPress(day("2026-02-10")));
    await act(() => result.current.handleDayPress(day("2026-02-05")));

    expect(result.current.selectedRange).toEqual({ start: "2026-02-05" });
    expect(onRangeComplete).not.toHaveBeenCalled();
  });

  it("ignores presses on days already covered by a booking", async () => {
    const { result } = await renderHook(() =>
      useDateRangeSelection({ bookings: booked }),
    );

    await act(() => result.current.handleDayPress(day("2026-02-13")));

    expect(result.current.selectedRange).toEqual({});
  });

  it("restarts the selection instead of spanning a booked day", async () => {
    const onRangeComplete = jest.fn();
    const { result } = await renderHook(() =>
      useDateRangeSelection({ bookings: booked, onRangeComplete }),
    );

    await act(() => result.current.handleDayPress(day("2026-02-10")));
    await act(() => result.current.handleDayPress(day("2026-02-20")));

    expect(result.current.selectedRange).toEqual({ start: "2026-02-20" });
    expect(onRangeComplete).not.toHaveBeenCalled();
  });
});
