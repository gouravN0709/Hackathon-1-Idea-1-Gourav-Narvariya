import { diningHours } from "@/lib/site-config";

const openDays = new Set<number>(diningHours.openWeekdays);

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isServiceDay(date: Date) {
  return openDays.has(date.getDay());
}

export function formatServiceDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function upcomingServiceDates(count = 8) {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const formatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  while (dates.length < count) {
    if (openDays.has(cursor.getUTCDay())) {
      dates.push({
        value: cursor.toISOString().slice(0, 10),
        label: formatter.format(cursor),
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string) {
  const digits = phoneDigits(value);
  return digits.length >= 8 && digits.length <= 15;
}

export function serviceDateError(value: string) {
  const date = parseDateInput(value);
  if (!date) {
    return "Choose an arrival date.";
  }
  if (date < startOfToday()) {
    return "Choose a date that has not already passed.";
  }
  if (!isServiceDay(date)) {
    return "The cider house is open Thursday to Sunday. Monday to Wednesday are closed.";
  }
  return null;
}
