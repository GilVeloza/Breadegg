-- One row per booked call. The date is the primary key, which is the
-- one-call-a-day rule: a second insert for the same day changes nothing.
CREATE TABLE IF NOT EXISTS bookings (
  date TEXT PRIMARY KEY,   -- YYYY-MM-DD in Madeira
  slot TEXT NOT NULL,      -- start time, ISO 8601 in UTC
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
