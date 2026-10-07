# Zod added, favorites validation

Added `zod` (v4) ahead of the forms phase (React Hook Form + Zod), and replaced
the hand-written `isHotelArray` guard in `useFavoritesPersistence` with a
schema.

## What changed

- `src/schemas/hotel.ts` (new): `hotelSchema` / `hotelArraySchema`. They check
  the fields the UI reads, including geo ranges and image dimensions.
- `useFavoritesPersistence`: `safeParse` instead of `isHotelArray`; the
  warning now prints `z.prettifyError(...)` instead of the raw value.
- `src/schemas/hotel.test.ts`: valid, empty, malformed cases.
- `docs/guides/zod-validation.md`: when to use Zod and when not to.

## Gotchas

- `z.object` strips unknown keys; stored hotels use `z.looseObject` so
  fields like `distanceMeters` survive a round trip.
- The first draft of the schema omitted image `width`/`height`; `tsc` caught it
  because `setFavorites` expects `Hotel[]`. The schema is deliberately
  checked against `Hotel` this way rather than redefining the type.
- API responses are intentionally not validated: types are generated from
  OpenAPI (see the guide).
