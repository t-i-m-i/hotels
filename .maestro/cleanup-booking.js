// Deletes the booking this flow just created against the shared demo
// database. Maestro has no direct handle on the id (the UI never shows
// it), so this finds it the same way a human would: the booking on a
// hotel matching SEARCH with exactly the check-in/check-out dates
// compute-dates.js picked for this run, then calls the backend's own
// DELETE /bookings/:id (see hotels-api's BookingsController) to remove
// it. Runs after the confirmation assertions so a failed cleanup here
// never masks a real assertion failure earlier in the flow.
const response = http.get(`${API_URL}/bookings`);
const bookings = JSON.parse(response.body);

const booking = bookings.find(
  (b) =>
    b.hotel.name.includes(SEARCH) &&
    b.checkIn === output.checkIn &&
    b.checkOut === output.checkOut,
);

if (booking) {
  http.delete(`${API_URL}/bookings/${booking.id}`);
}
