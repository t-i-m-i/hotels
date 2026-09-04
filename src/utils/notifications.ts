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
 * Schedules a local notification confirming the booking, arriving a minute
 * later to simulate the host confirming it. Demo-only stand-in for a real
 * "host confirmed" push that would come from the backend.
 */
export async function scheduleBookingConfirmedNotification() {
  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Booking confirmed",
      body: "Your host has just confirmed your booking. Have a nice stay!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
    },
  });
}
