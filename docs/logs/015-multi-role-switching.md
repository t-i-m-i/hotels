# Multi-role route trees + role switcher

Guest, host, and admin are now three separate route trees instead of one
set of screens with conditional UI. An account can hold more than one role
(see `hotels-api`'s own log entry for the `user_roles` table backing this)
and switches between them from an in-app control — no re-login needed.

## What changed

- `src/app/(tabs)/*` moved to `src/app/(guest)/(tabs)/*`, matching
  `(admin)/(tabs)` and `(host)/(tabs)`'s existing shape. All
  `redirectTo`/`router.replace` path strings updated to match.
  `hotel/[hotelId]`, `booking/[bookingId]`, and `map` deliberately stayed
  at the app root rather than moving into `(guest)` — they're not
  guest-exclusive (a host will need `booking/[bookingId]` to confirm/cancel
  a booking later), just not yet registered under any other role's
  `Stack.Protected` block.
- `src/api/authClient.ts`: dropped the `inferAdditionalFields` plugin
  (the `roleId` field it described no longer exists). Added a hand-written
  `SessionUser` type adding `roles: string[]` — `customSessionClient()`
  would normally infer this, but it requires importing the server's `Auth`
  instance type, which isn't possible across these two separate repos.
- `src/app/_layout.tsx`: `Stack.Protected` guards now compare
  `activeRole` (a resolved string) instead of a numeric `roleId`. Fixed a
  real gating bug in the process — the guest guard used to be `!session ||
  roleId === 2` *and* a separate `!session` guard covered `(auth)`,
  so a logged-out user got both trees registered simultaneously. Also now
  holds off rendering the `Stack` until both the session and the stored
  role preference have resolved (`isPending` / `isReady`), fixing a
  cold-start flash where an already-logged-in host/admin would briefly see
  the guest tree or login screen first.
- `src/hooks/useActiveRolePersistence.ts` (new) + `src/hooks/useActiveRole.ts`
  (rewritten) + `src/store/activeRoleSlice.ts` (new): which role tree is
  currently shown is Redux state (same pattern as `favorites`), not a
  component-local `useState` — it has to be visible identically from the
  root layout's guards and from the account screen's switcher at once.
- `src/components/AccountActions.tsx` (new): logout / delete-account /
  role-switcher pulled out of the guest account screen into a shared
  component, since host and admin now have their own account tabs too
  (`src/app/(host)/(tabs)/account.tsx`, `src/app/(admin)/(tabs)/account.tsx`)
  that need the same actions without duplicating the delete-confirmation
  flow three times.

## Gotchas

- **Don't duplicate the hydrate/persist/revalidate effects across call
  sites.** The first version of `useActiveRole` ran its full
  hydrate-from-storage + re-validate + persist logic in *every* component
  that called it (both the root layout and the account screen). Two
  independent copies of that logic, each acting on its own momentarily-stale
  view of `roles` during a navigation transition, fought over the one
  shared Redux value and produced a real ping-pong (admin → guest → admin →
  …) ending in a crash. The fix: exactly one hook
  (`useActiveRolePersistence`) owns hydration/persistence, called once at
  the app root; everywhere else uses the side-effect-free `useActiveRole()`
  that just reads/dispatches.
- Tapping a role switch alone did nothing until the above `useActiveRole`
  was made to share state via Redux instead of local `useState` — before
  that fix, only a full Metro reload (which remounts everything and
  re-reads storage fresh) picked up the new role.
- `src/store/activeRoleSlice.ts`'s `initialState = null as string | null;`
  isn't a style choice — `createSlice` infers its `State` generic too
  narrowly from a bare `null` literal (even with `const x: string | null =
  null` as a separate variable, confirmed by testing both forms directly),
  and a reducer returning `string | null` then fails to type-check against
  that narrowed-to-`null` state type. The inline `as` assertion is RTK's
  documented workaround for this exact case.
