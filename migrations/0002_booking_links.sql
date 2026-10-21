-- What the confirmation email's links need: a private link per booking (only
-- its hash is stored), and what to render the follow-up emails with. uid and
-- sequence keep the calendar event the same event when the call moves.
ALTER TABLE bookings ADD COLUMN token_hash TEXT;
ALTER TABLE bookings ADD COLUMN uid TEXT;
ALTER TABLE bookings ADD COLUMN sequence INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN locale TEXT;
ALTER TABLE bookings ADD COLUMN time_zone TEXT;
ALTER TABLE bookings ADD COLUMN message TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_token_hash ON bookings (token_hash);
