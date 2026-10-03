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

  useEffect(() => {
    const hydrate = async () => {
      let stored: string | null = null;
      try {
        stored = await AsyncStorage.getItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to retrieve active role from storage:", error);
      }
      dispatch(
        activeRoleActions.setActiveRole(resolveActiveRole(roles, stored)),
      );
      hasHydrated.current = true;
      setIsReady(true);
    };

    hydrate();
    // Intentionally once: `roles` arriving later (e.g. the session resolves
    // after this first runs) is handled by the re-validation effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-validate whenever the set of roles changes after hydration — keeps
  // the current choice if it's still valid, otherwise re-derives a safe
  // default (e.g. a role was revoked, or the session finished loading after
  // the hydration effect above already ran with no roles yet).
  useEffect(() => {
    if (!hasHydrated.current) return;
    if (activeRole && roles?.includes(activeRole)) return;
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
