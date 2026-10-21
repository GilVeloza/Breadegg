import { NextResponse, connection } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { BOOKING, openDays } from "@/content/booking";
import { confirmToVisitor, notifyStudio } from "@/lib/booking-emails";
import { bookingStore, type Booking, type BookingStore } from "@/lib/booking-store";
import { createToken, hashToken } from "@/lib/booking-token";
import { mailer } from "@/lib/email";
import { throttle } from "@/lib/throttle";

const throttled = throttle(5);

async function freeDays(store: BookingStore) {
  const days = openDays();
  const taken = await store.taken(days.map((d) => d.date));
  return days.filter((d) => !taken.has(d.date));
}

/** The free days and their slots, fresh on every request. */
export async function GET() {
  await connection();
  const store = await bookingStore();
  if (!store) return NextResponse.json({ ready: false, days: [] });
  try {
    return NextResponse.json({ ready: true, days: await freeDays(store) });
  } catch (cause) {
    console.error("Booking: couldn't read the store", cause);
    return NextResponse.json({ ready: false, days: [] }, { status: 503 });
  }
}

function validTimeZone(value: unknown): string {
  const zone = typeof value === "string" ? value.slice(0, 64) : "";
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return zone || BOOKING.timeZone;
  } catch {
    return BOOKING.timeZone;
  }
}

export async function POST(request: Request) {
  if (throttled(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Same honeypot as the contact form: a bot is told it worked.
  if (typeof body.fax === "string" && body.fax.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const company = String(body.company ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const slot = String(body.slot ?? "");
  // The site language at the moment of booking: every email to them uses it.
  const locale = hasLocale(routing.locales, body.locale)
    ? body.locale
    : routing.defaultLocale;
  const timeZone = validTimeZone(body.timeZone);

  if (!name || !slot || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const mail = mailer();
  const store = await bookingStore();
  if (!store || !mail) {
    console.error(
      "Booking is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL, and bind the BOOKINGS D1 database",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // The slot must be one the rules still allow, on a day nobody has taken.
  const day = (await freeDays(store)).find((d) => d.slots.includes(slot));
  if (!day) return NextResponse.json({ error: "taken" }, { status: 409 });

  const token = createToken();
  const booking: Booking = {
    date: day.date,
    slot,
    name,
    email,
    company,
    message,
    locale,
    timeZone,
    uid: crypto.randomUUID(),
    sequence: 0,
    tokenHash: await hashToken(token),
  };
  if (!(await store.claim(booking))) {
    return NextResponse.json({ error: "taken" }, { status: 409 });
  }

  // Gil hears first. If that fails the day goes back, so nobody is booked
  // into a call that nobody knows about.
  try {
    await notifyStudio(mail, "booked", booking);
  } catch (cause) {
    await store.release(day.date).catch(() => {});
    console.error("Booking: the notification to the studio failed", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // The booking stands from here: Gil has it and can follow up by hand even
  // if the visitor's confirmation bounces.
  try {
    await confirmToVisitor(mail, booking, token, "booked");
  } catch (cause) {
    console.error("Booking: the confirmation to the visitor failed", cause);
  }

  return NextResponse.json({ ok: true });
}
