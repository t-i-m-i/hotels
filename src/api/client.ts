import createClient from "openapi-fetch";
import type { paths } from "@/api/generated/schema";
import { getAuthHeaders } from "@/api/auth";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not set — check your .env.local");
}

export const apiClient = createClient<paths>({ baseUrl });

apiClient.use({
  onRequest({ request }) {
    for (const [key, value] of Object.entries(getAuthHeaders())) {
      request.headers.set(key, value);
    }
    return request;
  },
});
