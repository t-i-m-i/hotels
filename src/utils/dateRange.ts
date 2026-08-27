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
