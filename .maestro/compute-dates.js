// Check-in / check-out for the booking flow: the 10th and 13th of *next*
// month. Next month is always fully in the future, so the calendar's
// minDate (today) never disables these cells regardless of when the test
// runs. Output as "YYYY-MM-DD" to match react-native-calendars day testIDs
// (`booking-calendar.day_YYYY-MM-DD`).
const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const yyyy = nextMonth.getFullYear();
const mm = String(nextMonth.getMonth() + 1).padStart(2, "0");

output.checkIn = yyyy + "-" + mm + "-10";
output.checkOut = yyyy + "-" + mm + "-13";
