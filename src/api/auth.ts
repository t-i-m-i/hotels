import { authClient } from "./authClient";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookie = await authClient.getCookie();
  return { Cookie: cookie };
}
