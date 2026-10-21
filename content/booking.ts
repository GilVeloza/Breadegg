/**
 * When people can book a call. Every rule lives here; the API recomputes the
 * slots from it on each request, so the page can never offer a time this
 * file doesn't allow.
 */
export const BOOKING = {
  /** Madeira keeps Lisbon time; the hours below are read in it. */
  timeZone: "Atlantic/Madeira",
  /** 0 is Sunday: Tuesday, Wednesday and Thursday. */
  weekdays: [2, 3, 4],
  /** First start time and the hour by which the call has ended. */
  from: { hour: 16, minute: 0 },
  until: { hour: 20, minute: 0 },
  callMinutes: 15,
  /** A slot every half hour: 16:00, 16:30 … 19:30. */
  stepMinutes: 30,
  /** How far ahead, and how much notice. */
  horizonDays: 14,
  noticeHours: 12,
  /** Days off, as YYYY-MM-DD in Madeira. */
  blocked: [] as string[],
} as const;

// One call a day is the rule: the store claims the whole day (see
// lib/booking-store), so taking a slot takes the day with it.

export type BookingDay = {
  /** YYYY-MM-DD in Madeira: the key a booking is stored under. */
  date: string;
  /** Start times as ISO instants, which the browser shows in local time. */
  slots: string[];
};

/** Minutes the time zone is ahead of UTC at this instant. */
function offsetMinutes(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return (wall - at.getTime()) / 60_000;
}

/** The instant a wall-clock time in `timeZone` falls on, summer time included. */
function zonedToUtc(
  timeZone: string,
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number,
): Date {
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  const first = offsetMinutes(timeZone, new Date(guess));
  let utc = guess - first * 60_000;
  // On the night the clocks change the first guess can land on the other side.
  const second = offsetMinutes(timeZone, new Date(utc));
  if (second !== first) utc = guess - second * 60_000;
  return new Date(utc);
}

/** Today's calendar date in `timeZone`. */
function zonedToday(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Every bookable day and its slots from now on, before removing taken days. */
export function openDays(now: Date = new Date()): BookingDay[] {
  const { timeZone } = BOOKING;
  const today = zonedToday(timeZone, now);
  const earliest = now.getTime() + BOOKING.noticeHours * 3_600_000;
  const days: BookingDay[] = [];

  for (let i = 0; i <= BOOKING.horizonDays; i++) {
    // Walk the calendar, not the clock: a date's weekday is the same in
    // every time zone once it is a date.
    const day = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    const date = `${y}-${pad(m)}-${pad(d)}`;

    if (!(BOOKING.weekdays as readonly number[]).includes(day.getUTCDay())) {
      continue;
    }
    if (BOOKING.blocked.includes(date)) continue;

    const slots: string[] = [];
    const first = BOOKING.from.hour * 60 + BOOKING.from.minute;
    const last = BOOKING.until.hour * 60 + BOOKING.until.minute - BOOKING.callMinutes;
    for (let t = first; t <= last; t += BOOKING.stepMinutes) {
      const start = zonedToUtc(timeZone, y, m, d, Math.floor(t / 60), t % 60);
      if (start.getTime() >= earliest) slots.push(start.toISOString());
    }
    if (slots.length > 0) days.push({ date, slots });
  }

  return days;
}
