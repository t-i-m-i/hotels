- Offset pagination + infinite scroll has a known flaw: if rows are inserted/deleted between page fetches you get duplicates or gaps. Your data is static and ORDER BY name so it's fine here — but the robust pattern for infinite scroll is keyset/cursor: WHERE name > $cursor ORDER BY name LIMIT $n, and getNextPageParam returns the last item's name.

-  pageSize is hardcoded LIMIT = 20. A real paginated endpoint takes pageSize/limit as an optional query param with a @Max(...) cap so a client can't ask for 10⁶ rows. Add it to the DTO when you merge.
