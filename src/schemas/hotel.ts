import { z } from "zod";

// Validates hotels read back from AsyncStorage (untrusted: written by an older
// app version, or hand-edited). It checks the fields the UI actually reads, not
// the whole API contract. `looseObject` keeps unknown keys (e.g. a future
// `distanceMeters`) instead of stripping them, so we round-trip what we stored.
export const hotelSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  geo: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  images: z.array(
    z.object({
      path: z.string(),
      alt: z.string(),
      width: z.number(),
      height: z.number(),
    }),
  ),
});

export const hotelArraySchema = z.array(hotelSchema);
