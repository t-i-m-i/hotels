import { activeRoleActions } from "@/store/activeRoleSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCallback } from "react";

/**
 * Read/change which route tree ((guest)/(host)/(admin)) is currently shown,
 * for an account that holds more than one role. This is UI state, not
 * identity — `session.user.roles` is the source of truth for which roles
 * an account actually has.
 *
 * Pure read/dispatch, no side effects — hydrating from storage and
 * persisting on change is owned solely by useActiveRolePersistence, called
 * once at the app root. Don't add hydrate/persist logic here; see that
 * hook's comment for why duplicating it caused a real bug.
 */
export default function useActiveRole() {
  const dispatch = useAppDispatch();
  const activeRole = useAppSelector((state) => state.activeRole);

  const setActiveRole = useCallback(
    (role: string, roles: string[]) => {
      if (!roles.includes(role)) {
        console.warn(
          `Cannot switch to role "${role}": account doesn't hold it.`,
        );
        return;
      }
      dispatch(activeRoleActions.setActiveRole(role));
    },
    [dispatch],
  );

  return { activeRole, setActiveRole };
}
