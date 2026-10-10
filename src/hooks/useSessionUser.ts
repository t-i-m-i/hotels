import { authClient, type SessionUser } from "@/api/authClient";

/**
 * The signed-in user, or undefined when logged out. The root layout holds off
 * rendering the navigator until the session has resolved, so screens never see
 * a pending state - only the brief frame after sign-out, before the protected
 * tree unmounts.
 */
export function useSessionUser(): SessionUser | undefined {
  const { data: session } = authClient.useSession();
  return session?.user as SessionUser | undefined;
}
