import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";

async function fetchLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied.");
  }
  try {
    return await Location.getCurrentPositionAsync({});
  } catch {
    throw new Error("Failed to get current location."); // e.g. GPS off
  }
}

export function useCurrentLocation() {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["currentLocation"],
    queryFn: fetchLocation,
    retry: false, // don't re-prompt the user on failure
    gcTime: 0, // forget the position when the screen closes
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    location: data ?? null,
    isLocating: isFetching,
    locationMsg: isFetching ? null : (error?.message ?? null),
    getCurrentLocation: () => refetch(), // wrapper: don't pass the press event in
  };
}
