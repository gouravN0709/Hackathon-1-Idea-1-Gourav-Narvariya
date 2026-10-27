/** Map YYYY-MM-DD to ISO weekday (Mon=1 … Sun=7) using calendar date parts. */
export function isoDayFromServiceDate(serviceDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(serviceDate);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  const jsDay = utc.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function arrivalTimeToDb(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}
