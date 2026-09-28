import { registerPushToken } from "@/api/pushTokens";
import { DEMO_USER_ID } from "@/constants/user";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ensureNotificationPermissionsAsync } from "./notifications";

/**
 * Registers this device for real (Firebase-delivered) push notifications:
 * gets a raw FCM device token via expo-notifications and sends it to the
 * backend, associated with the demo user (see DEMO_USER_ID). Requires the
 * native Firebase config (google-services.json / GoogleService-Info.plist)
 * to be present and the app to be prebuilt — see docs/guides/notifications.md.
 */
export async function registerForPushNotificationsAsync(): Promise<void> {
  if (!Device.isDevice) {
    // Push tokens are unreliable/unavailable on most simulators.
    return;
  }

  const hasPermission = await ensureNotificationPermissionsAsync();
  if (!hasPermission) {
    return;
  }

  const platform = Platform.OS === "ios" ? "ios" : "android";
  const { data: token } = await Notifications.getDevicePushTokenAsync();

  await registerPushToken({ userId: DEMO_USER_ID, token, platform });
}
