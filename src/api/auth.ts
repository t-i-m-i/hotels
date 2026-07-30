// No auth in this demo. Kept as a seam for future JWT/token headers so
// callers never need to change once real auth is wired up.
export function getAuthHeaders(): Record<string, string> {
  return {};
}
