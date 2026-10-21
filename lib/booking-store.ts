import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * The booked calls.
 *
 * On Cloudflare this is the D1 database bound as BOOKINGS (see wrangler.jsonc
 * and migrations/). The date is the table's primary key, so two people booking
 * the same day at the same moment can't both get it. Bookings stay in the
 * table, which doubles as the list of every call booked; delete a row in the
 * Cloudflare dashboard (D1 → breadegg-bookings) and that day opens again.
 *
 * Under `next dev` the same code runs against a local copy of D1; where there
 * is no database at all in development, a Map stands in.
 */

export type Booking = {
  /** YYYY-MM-DD in Madeira. */
  date: string;
  /** Start time, ISO 8601 in UTC. */
  slot: string;
  name: string;
  email: string;
  company: string;
  message: string;
  /** The site language at booking time: every email to them uses it. */
  locale: string;
  timeZone: string;
  /** The calendar event's identity, kept when the call moves. */
  uid: string;
  sequence: number;
  /** SHA-256 of the private link's token (lib/booking-token). */
  tokenHash: string;
};

export type BookingStore = {
  taken(dates: string[]): Promise<Set<string>>;
  /** True if the day was free and is now this booking's. */
  claim(booking: Booking): Promise<boolean>;
  find(tokenHash: string): Promise<Booking | null>;
  /** Moves a booking to `next`; false if the new day was taken meanwhile. */
  move(fromDate: string, next: Booking): Promise<boolean>;
  /** Gives the day back: a cancellation, or a confirmation that couldn't go out. */
  release(date: string): Promise<void>;
};

// The slice of the D1 API used here.
type D1Result<T> = { results?: T[]; meta: { changes: number } };
type D1Statement = {
  run(): Promise<D1Result<unknown>>;
  all<T>(): Promise<D1Result<T>>;
  first<T>(): Promise<T | null>;
};
type D1 = {
  prepare(query: string): { bind(...values: unknown[]): D1Statement };
};

const COLUMNS =
  "date, slot, name, email, company, message, locale, time_zone AS timeZone, uid, sequence, token_hash AS tokenHash";

function d1Store(db: D1): BookingStore {
  const insert = (b: Booking) =>
    db
      .prepare(
        "INSERT OR IGNORE INTO bookings (date, slot, name, email, company, message, locale, time_zone, uid, sequence, token_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        b.date,
        b.slot,
        b.name,
        b.email,
        b.company || null,
        b.message || null,
        b.locale,
        b.timeZone,
        b.uid,
        b.sequence,
        b.tokenHash,
      )
      .run();

  return {
    async taken(dates) {
      if (dates.length === 0) return new Set();
      const { results = [] } = await db
        .prepare(
          `SELECT date FROM bookings WHERE date IN (${dates.map(() => "?").join(", ")})`,
        )
        .bind(...dates)
        .all<{ date: string }>();
      return new Set(results.map((row) => row.date));
    },
    async claim(b) {
      return (await insert(b)).meta.changes === 1;
    },
    async find(tokenHash) {
      const row = await db
        .prepare(`SELECT ${COLUMNS} FROM bookings WHERE token_hash = ?`)
        .bind(tokenHash)
        .first<Booking>();
      return row
        ? { ...row, company: row.company ?? "", message: row.message ?? "" }
        : null;
    },
    async move(fromDate, next) {
      if (next.date === fromDate) {
        const { meta } = await db
          .prepare(
            "UPDATE bookings SET slot = ?, sequence = ?, token_hash = ? WHERE date = ?",
          )
          .bind(next.slot, next.sequence, next.tokenHash, fromDate)
          .run();
        return meta.changes === 1;
      }
      // Take the new day first: if someone got there meanwhile, nothing moves.
      if ((await insert(next)).meta.changes !== 1) return false;
      await db.prepare("DELETE FROM bookings WHERE date = ?").bind(fromDate).run();
      return true;
    },
    async release(date) {
      await db.prepare("DELETE FROM bookings WHERE date = ?").bind(date).run();
    },
  };
}

const memory = new Map<string, Booking>();
const memoryStore: BookingStore = {
  async taken(dates) {
    return new Set(dates.filter((d) => memory.has(d)));
  },
  async claim(b) {
    if (memory.has(b.date)) return false;
    memory.set(b.date, b);
    return true;
  },
  async find(tokenHash) {
    return [...memory.values()].find((b) => b.tokenHash === tokenHash) ?? null;
  },
  async move(fromDate, next) {
    if (next.date !== fromDate && memory.has(next.date)) return false;
    memory.delete(fromDate);
    memory.set(next.date, next);
    return true;
  },
  async release(date) {
    memory.delete(date);
  },
};

/** Null in production without the database: booking would promise days twice. */
export async function bookingStore(): Promise<BookingStore | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as { BOOKINGS?: D1 }).BOOKINGS;
    if (db) return d1Store(db);
  } catch {
    // Not running on Cloudflare: `next dev` without bindings, or another host.
  }
  return process.env.NODE_ENV === "production" ? null : memoryStore;
}
