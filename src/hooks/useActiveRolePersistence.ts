import { activeRoleActions } from "@/store/activeRoleSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "activeRole";

function resolveActiveRole(
  roles: string[] | undefined,
  preferred: string | null,
) {
  if (!roles || roles.length === 0) return null;
  if (preferred && roles.includes(preferred)) return preferred;
  return roles.includes("guest") ? "guest" : roles[0];
}

/**
 * Owns hydrating the active-role preference from storage, re-validating it
 * against the account's real roles, and persisting it back on change.
 * Call this exactly once, at the app root (see useFavoritesPersistence for
 * the same pattern with favorites) — everywhere else that needs the value
 * or wants to change it should use the plain useActiveRole() instead.
 *
 * This single-owner split matters: an earlier version ran this same
 * hydrate/revalidate/persist logic from every call site (the root layout
 * *and* the account screen's switcher). Two independent copies both
 * "correcting" one shared Redux value, each from its own momentarily-stale
 * view of `roles` during a navigation transition, produced a real
 * ping-pong between roles rather than converging.
 */
export default function useActiveRolePersistence(roles: string[] | undefined) {
  const dispatch = useAppDispatch();
  const activeRole = useAppSelector((state) => state.activeRole);
  const hasHydrated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Loads the stored preference *verbatim*, deliberately not resolved
  // against `roles`. This runs on mount, when the session is still pending
  // and `roles` is therefore undefined — resolving here would discard
  // whatever was stored and fall straight through to the default, which is
  // exactly the bug this shape avoids. Validation is the next effect's job,
  // once the roles are actually known.
  useEffect(() => {
    const hydrate = async () => {
      let stored: string | null = null;
      try {
        stored = await AsyncStorage.getItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to retrieve active role from storage:", error);
      }
      dispatch(activeRoleActions.setActiveRole(stored));
      hasHydrated.current = true;
      setIsReady(true);
    };

    hydrate();
  }, [dispatch]);

  // Validates the current choice once the account's real roles are known,
  // re-deriving a default when it isn't one of them (nothing stored on a
  // first launch, or a role that has since been revoked). Skipped entirely
  // while `roles` is empty/undefined — that means "not loaded yet" (or
  // logged out), not "this account has no roles", so there's nothing to
  // validate against and clobbering the stored preference there would lose
  // it.
  //
  // Neither app load nor switching roles via the UI actually trigger the
  // dispatch below — in both cases `activeRole` is already one of `roles`,
  // so the early return on the line above fires first. The scenario where
  // this effect does something is `roles` shrinking out from under a role
  // that's currently active — e.g. an admin revokes this account's host
  // access while the device still has "host" selected; the next session
  // refetch gives us a new `roles` without "host" in it, and this effect
  // bounces `activeRole` back to a role the account still actually has.
  useEffect(() => {
    if (!hasHydrated.current) return;
    if (!roles || roles.length === 0) return;
    if (activeRole && roles.includes(activeRole)) return;
    dispatch(
      activeRoleActions.setActiveRole(resolveActiveRole(roles, activeRole)),
    );
  }, [roles, activeRole, dispatch]);

  useEffect(() => {
    if (!hasHydrated.current || !activeRole) return;
    AsyncStorage.setItem(STORAGE_KEY, activeRole).catch((error: unknown) =>
      console.error("Failed to persist active role:", error),
    );
  }, [activeRole]);

  return { activeRole, isReady };
}
