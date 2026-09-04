import createClient from "openapi-fetch";
import type { paths } from "@/api/generated/schema";
import { getAuthHeaders } from "@/api/auth";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not set — check your .env.local");
}

export const apiClient = createClient<paths>({ baseUrl });

// EXPO_PUBLIC_* vars are inlined at bundle time by Metro, not read from the
// device at runtime — so this is only ever true for a JS bundle actually
// served by `EXPO_PUBLIC_E2E_TEST_MODE=true bun start`, never for a normal
// dev/prod build. Tags every booking this app creates as synthetic (see
// hotels-api's `X-Synthetic-Booking` header) so `.maestro/booking-flow.yaml`
// can clean up via `DELETE /bookings/synthetic` instead of matching
// bookings by hotel name and date.
const isE2eTestMode = process.env.EXPO_PUBLIC_E2E_TEST_MODE === "true";

apiClient.use({
  onRequest({ request }) {
    for (const [key, value] of Object.entries(getAuthHeaders())) {
      request.headers.set(key, value);
    }
    if (isE2eTestMode) {
      request.headers.set("X-Synthetic-Booking", "true");
    }
    return request;
  },
});
