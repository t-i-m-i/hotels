# 009 — Drop unused `search` param from `useHotelsInBounds`

Same cleanup as `hotels-web-next`'s `008-drop-map-search-param.md`: the map
tab and hotel detail map never had a search box, so `search` on
`getHotelsInBounds`/`useHotelsInBounds` was unused plumbing. Removed.

## What changed

- `src/api/hotels.ts#getHotelsInBounds`: dropped the `search` param.
- `src/api/hooks/useHotels.ts#useHotelsInBounds`: dropped `search`, the
  `normalized` trim, and it from the query key.
- `src/api/generated/schema.d.ts` regenerated (`/hotels/within-bounds` no
  longer accepts `search` server-side, see `hotels-api`'s
  `009-drop-within-bounds-search.md`).

`useHotels(search)` (the home tab's real, working list search) is untouched.
