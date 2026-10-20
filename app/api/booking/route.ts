import { NextResponse, connection } from "next/server";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BOOKING, openDays } from "@/content/booking";
import { bookingStore, type BookingStore } from "@/lib/booking-store";
import { mailer } from "@/lib/email";
import { intlLocale } from "@/lib/intl";
import { SITE_URL } from "@/lib/site";
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

function when(start: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(start);
}

/** A calendar file the visitor can open to add the call; no invitation, no RSVP. */
function calendarFile(start: Date, summary: string, description: string) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const text = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const end = new Date(start.getTime() + BOOKING.callMinutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Breadegg//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-${crypto.randomUUID()}@breadegg.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(summary)}`,
    `DESCRIPTION:${text(description)}`,
    "LOCATION:Google Meet",
    `URL:${SITE_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
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

  const claimed = await store.claim({ date: day.date, slot, name, email, company });
  if (!claimed) return NextResponse.json({ error: "taken" }, { status: 409 });

  const start = new Date(slot);
  const theirs = when(start, locale, timeZone);
  const madeira = when(start, "en-GB", BOOKING.timeZone);

  // Gil hears first. If that fails the day goes back, so nobody is booked
  // into a call that nobody knows about.
  try {
    await mail.send({
      to: [mail.inbox],
      replyTo: email,
      subject: `Call booked: ${name}${company ? ` · ${company}` : ""} · ${madeira}`,
      text: [
        "A call was booked on breadegg.com.",
        "",
        `When:       ${madeira} (Madeira)`,
        `Their time: ${theirs} (${timeZone})`,
        `Name:       ${name}`,
        `Email:      ${email}`,
        `Company:    ${company || "not given"}`,
        `Language:   ${locale}`,
        "",
        "What they want to talk about:",
        message || "(nothing written)",
        "",
        "Send them the Google Meet link before the call. To cancel, write to them",
        `and delete the ${day.date} row in D1 (breadegg-bookings) so the day opens again.`,
      ].join("\n"),
    });
  } catch (cause) {
    await store.release(day.date).catch(() => {});
    console.error("Booking: the notification to the studio failed", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // The booking stands from here: Gil has it and can follow up by hand even
  // if the visitor's confirmation bounces.
  try {
    const t = await getTranslations({ locale, namespace: "booking.email" });
    await mail.send({
      to: [email],
      replyTo: mail.inbox,
      subject: t("subject", { when: theirs }),
      text: [
        t("greeting", { name }),
        "",
        t("booked", { when: theirs, timeZone }),
        t("meet"),
        t("change"),
        ...(message ? ["", t("yours"), message] : []),
        "",
        t("sign"),
      ].join("\n"),
      attachments: [
        {
          filename: "breadegg-call.ics",
          content: Buffer.from(
            calendarFile(start, t("summary"), t("meet")),
          ).toString("base64"),
          contentType: "text/calendar",
        },
      ],
    });
  } catch (cause) {
    console.error("Booking: the confirmation to the visitor failed", cause);
  }

  return NextResponse.json({ ok: true });
}
