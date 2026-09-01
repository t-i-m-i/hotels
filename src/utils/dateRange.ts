// Local calendar day as "YYYY-MM-DD", via local Date getters - never
// toISOString(), which renders the UTC day and can be off by one depending
// on the device's offset from UTC (see docs/logs/003-isPastBooking-utc-bug.md).
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Inclusive of both endpoints. Timezone-safe: works entirely in UTC so it
// doesn't skip/duplicate a day depending on the device's local offset.
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = parseISODate(startDate);
  const end = parseISODate(endDate);

  while (current.getTime() <= end.getTime()) {
    dates.push(formatISODate(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}
