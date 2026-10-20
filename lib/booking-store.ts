import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Which days already have a call.
 *
 * On Cloudflare this is the D1 database bound as BOOKINGS (see wrangler.jsonc
 * and migrations/). The date is the table's primary key, so two people booking
 * the same day at the same moment can't both get it. Bookings stay in the
 * table, which doubles as the list of every call booked; delete a row in the
 * Cloudflare dashboard (D1 → breadegg-bookings) and that day opens again.
 *
 * Under `next dev` there is no D1, so a Map stands in and forgets everything
 * on restart.
 */

export type Booking = {
  date: string;
  slot: string;
  name: string;
  email: string;
  company: string;
};

export type BookingStore = {
  taken(dates: string[]): Promise<Set<string>>;
  /** True if the day was free and is now this booking's. */
  claim(booking: Booking): Promise<boolean>;
  /** Gives the day back, when the confirmation couldn't go out. */
  release(date: string): Promise<void>;
};

// The slice of the D1 API used here.
type D1Result = { results?: { date: string }[]; meta: { changes: number } };
type D1 = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<D1Result>;
      all(): Promise<D1Result>;
    };
  };
};

function d1Store(db: D1): BookingStore {
  return {
    async taken(dates) {
      if (dates.length === 0) return new Set();
      const { results = [] } = await db
        .prepare(
          `SELECT date FROM bookings WHERE date IN (${dates.map(() => "?").join(", ")})`,
        )
        .bind(...dates)
        .all();
      return new Set(results.map((row) => row.date));
    },
    async claim(b) {
      const { meta } = await db
        .prepare(
          "INSERT OR IGNORE INTO bookings (date, slot, name, email, company) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(b.date, b.slot, b.name, b.email, b.company || null)
        .run();
      return meta.changes === 1;
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
    // Not running on Cloudflare: `next dev`, or another host.
  }
  return process.env.NODE_ENV === "production" ? null : memoryStore;
}
