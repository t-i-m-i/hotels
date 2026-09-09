const storageUrl = process.env.EXPO_PUBLIC_STORAGE_URL;

if (!storageUrl) {
  throw new Error(
    "EXPO_PUBLIC_STORAGE_URL is not set — check your .env.local",
  );
}

/**
 * Resolve a storage key returned by the API (`HotelImageDto.path`, e.g.
 * "hotels/shared/01.jpg") to an absolute URL on the storage/CDN host.
 *
 * The API only ever returns keys — where the bytes actually live is
 * environment config, so it stays on the client.
 */
export function storageAsset(path: string): string {
  return `${storageUrl}/${path}`;
}
