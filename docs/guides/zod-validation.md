# Zod: when to reach for it

Zod turns "I hope this data has the right shape" into a runtime check, and
gives you the TypeScript type from the same definition (`z.infer`). TypeScript
types disappear at runtime, so they can't check anything that comes from
outside the app. Zod can.

Current usage: `src/schemas/hotel.ts` validates favorites read back from
AsyncStorage (`useFavoritesPersistence`). Forms (React Hook Form +
`@hookform/resolvers/zod`) come in a later phase.

## Common use cases (in general)

1. **Form validation.** Rules beyond "required": email format, min length,
   "password and confirm password match" (`.refine` / `.superRefine`),
   "end date after start date", conditional fields ("VAT number required if
   company"), number ranges. One schema gives you validation and the form's TS
   type. This is the main reason to pair it with React Hook Form.
2. **Parsing `JSON.parse` / storage.** AsyncStorage, localStorage, files: the
   data is `unknown` and may be stale, corrupt or from an older app version.
3. **Environment variables / config.** Check at startup that required
   `EXPO_PUBLIC_*` values exist and look like URLs, instead of failing deep in
   a request.
4. **Untrusted input at a boundary.** Deep links and route params
   (`/hotel/[hotelId]`), push notification payloads, query strings, webhooks,
   anything a user or another system can craft.
5. **API responses you don't control.** Third-party APIs, or an API with no
   contract/types. Here the response really is `unknown`.
6. **Server-side request bodies** (Node/Nest/Next): validate before you touch
   the DB. Lets client and server share one schema.
7. **Transforming data while validating.** Coerce strings to numbers/dates,
   trim, set defaults, rename fields (`.transform`, `z.coerce`).

## Rule of thumb

Validate where **untrusted data enters** your program, once, at the edge.
After that, trust the type. Ask: "if this data is wrong, can anything other
than the compiler tell me?" If the type system already guarantees it, or
nothing bad happens when it's wrong, skip Zod.

## What to avoid (overengineering)

- **Your own backend's responses, when types are generated.** Here
  `src/api/generated/schema.d.ts` comes from the OpenAPI spec, so the types
  already match the contract. Re-validating every response duplicates that, costs
  CPU on every fetch, and breaks the UI for a harmless extra field. Validate
  API responses only if the API is third-party/unversioned, or you have been bitten
  by contract drift. If you do, validate only the fields you read, and at one
  place (the API client), not in components.
- **Data you just created in code**, or passed between your own functions.
  TypeScript already covers it.
- **Redux/React Query state**, internal props, component props.
- **Trivial forms.** A form with 2 `required` fields doesn't need Zod; RHF's
  built-in rules are fine. Reach for Zod when rules start to be cross-field,
  reusable, or shared with the server.
- **Schemas that restate the whole type "just in case".** Keep them to what
  the code relies on.
- **Validating the same value in several layers.**

## Practical tips

- Use `safeParse` (returns `{ success, data | error }`) for expected bad input;
  `parse` throws, fine for things that should never fail (like config at startup).
- `z.object` strips unknown keys by default. Use `z.looseObject` when you
  need to keep them (as we do for stored hotels).
- Prefer `z.infer<typeof schema>` over hand-written types for form values. When a
  type already exists (like `Hotel`), don't redefine it; make sure
  the schema is assignable to it, and let `tsc` tell you when they drift.
- `z.prettifyError(error)` gives a readable message for logs.
