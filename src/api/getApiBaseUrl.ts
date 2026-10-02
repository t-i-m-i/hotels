import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  // In dev, derive the host from the address Metro told the device to connect
  // through (works for iOS sim, Android emulator, and physical devices on the
  // same network) instead of hardcoding localhost/10.0.2.2 per platform.
  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];

  const baseUrl = __DEV__
    ? `http://${devHost ?? "localhost"}:3000`
    : process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not set — check your .env.local");
  }

  return baseUrl;
}
