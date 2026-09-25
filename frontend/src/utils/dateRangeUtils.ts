// Small, dependency-free date helpers — replaces the moment.js calls
// from the original jQuery date range picker.

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export type DraftRange = {
  startDate: Date;
  endDate: Date | null;
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const pad = (n: number) => String(n).padStart(2, '0');

/* ---------- construction ---------- */

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const subDays = (d: Date, n: number) => addDays(d, -n);

export const addMonths = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

export const subMonths = (d: Date, n: number) => addMonths(d, -n);

/* ---------- comparison (day precision) ---------- */

export const compareDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() - startOfDay(b).getTime();

export const isSameDay = (a: Date, b: Date) => compareDay(a, b) === 0;
export const isBeforeDay = (a: Date, b: Date) => compareDay(a, b) < 0;
export const isAfterDay = (a: Date, b: Date) => compareDay(a, b) > 0;

export const isBetweenDay = (d: Date, from: Date, to: Date) =>
  compareDay(d, from) > 0 && compareDay(d, to) < 0;

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/* ---------- formatting ---------- */

/**
 * Supports the tokens used by the original markup plus a few extras:
 * YYYY YY MMMM MMM MM M DD D dddd ddd
 */
export function formatDate(date: Date, pattern = 'MMMM D, YYYY'): string {
  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: MONTH_NAMES[date.getMonth()],
    MMM: MONTH_NAMES[date.getMonth()].slice(0, 3),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: pad(date.getDate()),
    D: String(date.getDate()),
    dddd: DAY_NAMES[date.getDay()],
    ddd: DAY_NAMES[date.getDay()].slice(0, 3),
  };

  return pattern.replace(
    /YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D/g,
    (token) => tokens[token],
  );
}

export function formatRange(
  range: DateRange,
  pattern = 'MMMM D, YYYY',
  separator = ' - ',
): string {
  if (isSameDay(range.startDate, range.endDate)) {
    return formatDate(range.startDate, pattern);
  }
  return (
    formatDate(range.startDate, pattern) +
    separator +
    formatDate(range.endDate, pattern)
  );
}

/* ---------- calendar grid ---------- */

/** 42 cells (6 weeks) covering the month that `viewDate` falls in. */
export function monthMatrix(viewDate: Date, weekStartsOn = 0): Date[] {
  const first = startOfMonth(viewDate);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function weekdayLabels(weekStartsOn = 0): string[] {
  return Array.from(
    { length: 7 },
    (_, i) => DAY_NAMES[(i + weekStartsOn) % 7].slice(0, 2),
  );
}

export const monthNames = MONTH_NAMES;