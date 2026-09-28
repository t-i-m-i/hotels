import * as Notifications from "expo-notifications";

// Show alerts even while the app is in the foreground (default behavior is
// to suppress them), so the demo notification is visible no matter what
// state the app is in when it fires.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissionsAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/**
 * Schedules a local notification acknowledging the booking was made. The
 * booking starts out "pending" on the backend — the real "host confirmed"
 * notification now arrives as an actual push (see pushRegistration.ts and
 * FirebasePushService in hotels-api) once the host confirms it.
 * see: docs/guides/notifications.md
 */
export async function scheduleBookingConfirmedNotification(bookingId: string) {
  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Booking received",
      body: "Your bookings has been made.",
      data: {
        url: `hotels://booking/${bookingId}`,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
    },
  });
}
