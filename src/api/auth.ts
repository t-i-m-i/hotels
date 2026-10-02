// No auth in this demo. Kept as a seam for future JWT/token headers so

import { authClient } from "./authClient";

// callers never need to change once real auth is wired up.
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookie = await authClient.getCookie();
  return { Cookie: cookie };
}
