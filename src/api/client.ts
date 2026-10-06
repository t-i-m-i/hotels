import createClient from "openapi-fetch";
import type { paths } from "@/api/generated/schema";
import { getAuthHeaders } from "@/api/auth";
import { getApiBaseUrl } from "@/api/getApiBaseUrl";

export const apiClient = createClient<paths>({ baseUrl: getApiBaseUrl() });

// EXPO_PUBLIC_* vars are inlined at bundle time by Metro, not read from the
// device at runtime — so this is only ever true for a JS bundle actually
// served by `EXPO_PUBLIC_E2E_TEST_MODE=true bun start`, never for a normal
// dev/prod build. Tags every booking this app creates as synthetic (see
// hotels-api's `X-Synthetic-Booking` header) so `.maestro/booking-flow.yaml`
// can clean up via `DELETE /bookings/synthetic` instead of matching
// bookings by hotel name and date.
const isE2eTestMode = process.env.EXPO_PUBLIC_E2E_TEST_MODE === "true";

apiClient.use({
  async onRequest({ request }) {
    for (const [key, value] of Object.entries(await getAuthHeaders())) {
      request.headers.set(key, value);
    }
    if (isE2eTestMode) {
      request.headers.set("X-Synthetic-Booking", "true");
    }
    return request;
  },
});

// Dev-only one-line request log in the Metro terminal. Deliberately skips
// headers (auth) and bodies. `__DEV__` is false in release bundles, so this
// is stripped from production.
if (__DEV__) {
  apiClient.use({
    onRequest({ request }) {
      console.log(`[api] ${request.method} ${request.url}`);
      return request;
    },
  });
}
