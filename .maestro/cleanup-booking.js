// Deletes every booking this run (or any prior interrupted run) tagged as
// synthetic, via hotels-api's DELETE /bookings/synthetic. The tag itself is
// set by the app, not by this script — src/api/client.ts adds the
// `X-Synthetic-Booking: true` header to every request whenever the JS
// bundle was served with EXPO_PUBLIC_E2E_TEST_MODE=true (see this repo's
// README/docs/logs/005-... for how to start Metro that way). No matching
// on hotel name or dates needed: the row is unambiguous, and a bulk delete
// also sweeps up anything a previous crashed run left behind.
http.delete(`${API_URL}/bookings/synthetic`);
