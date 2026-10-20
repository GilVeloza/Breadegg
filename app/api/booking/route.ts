import { NextResponse, connection } from "next/server";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BOOKING, openDays } from "@/content/booking";
import { bookingStore, type BookingStore } from "@/lib/booking-store";
import { mailer } from "@/lib/email";
import { renderEmail } from "@/lib/email-template";
import { LANGUAGE_NAMES_ES, intlLocale } from "@/lib/intl";
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

/** Capital first letter: Intl writes "miércoles", a heading wants "Miércoles". */
function sentence(text: string, locale: string) {
  return text.charAt(0).toLocaleUpperCase(intlLocale(locale)) + text.slice(1);
}

/** Opens Google Calendar with the call filled in, ready to save. */
function googleCalendarUrl(start: Date, title: string, details: string) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(start.getTime() + BOOKING.callMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
    location: "Google Meet",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
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
  // The visitor hears back in the language the site was in when they booked.
  const t = await getTranslations({ locale, namespace: "booking.email" });
  const theirs = when(start, locale, timeZone);
  const madeira = when(start, "es", BOOKING.timeZone);
  const theirsInSpanish = when(start, "es", timeZone);
  const subject = t("subject", { when: theirs });

  // Gil hears first. If that fails the day goes back, so nobody is booked
  // into a call that nobody knows about.
  try {
    const studio = {
      details: [
        { label: "Nombre", value: name },
        { label: "Email", value: email, href: `mailto:${email}` },
        { label: "Empresa", value: company || "—" },
        { label: "Su hora", value: `${theirsInSpanish} (${timeZone})` },
        { label: "Idioma de la web", value: LANGUAGE_NAMES_ES[locale] ?? locale },
      ],
      footnote: `Mándale el enlace de Google Meet antes de la llamada. Para cancelarla, escríbele y borra la fila del ${day.date} en D1 (breadegg-bookings): el día vuelve a quedar libre.`,
    };
    await mail.send({
      to: [mail.inbox],
      replyTo: email,
      subject: `Llamada reservada: ${name}${company ? ` · ${company}` : ""} · ${madeira}`,
      text: [
        "Nueva llamada reservada en breadegg.com.",
        "",
        `Cuándo:  ${madeira} (hora de Madeira) · 15 minutos`,
        ...studio.details.map((d) => `${d.label}: ${d.value}`),
        "",
        "De qué quiere hablar:",
        message || "No escribió nada.",
        "",
        studio.footnote,
      ].join("\n"),
      html: renderEmail({
        lang: "es",
        preheader: `${name} ha reservado una llamada de 15 minutos.`,
        eyebrow: "Nueva llamada reservada",
        title: sentence(madeira, "es"),
        subtitle: "Hora de Madeira · 15 minutos",
        details: studio.details,
        quote: { label: "De qué quiere hablar", text: message || "No escribió nada." },
        cta: {
          label: `Responder a ${name}`,
          href: `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`,
        },
        footnote: studio.footnote,
        footer: "breadegg.com · Reservas",
      }),
    });
  } catch (cause) {
    await store.release(day.date).catch(() => {});
    console.error("Booking: the notification to the studio failed", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // The booking stands from here: Gil has it and can follow up by hand even
  // if the visitor's confirmation bounces.
  try {
    await mail.send({
      to: [email],
      replyTo: mail.inbox,
      subject,
      text: [
        t("greeting", { name }),
        "",
        t("booked", { when: theirs, timeZone }),
        t("meet"),
        t("calendarNote"),
        t("change"),
        ...(message ? ["", t("yours"), message] : []),
        "",
        t("sign"),
      ].join("\n"),
      html: renderEmail({
        lang: locale,
        preheader: t("booked", { when: theirs, timeZone }),
        eyebrow: t("eyebrow"),
        title: sentence(theirs, locale),
        subtitle: t("duration", { timeZone }),
        paragraphs: [t("greeting", { name }), t("meet")],
        quote: message ? { label: t("yours"), text: message } : undefined,
        cta: {
          label: t("calendar"),
          href: googleCalendarUrl(start, t("summary"), t("meet")),
        },
        footnote: `${t("calendarNote")}\n${t("change")}`,
        footer: "Breadegg · Madeira, Portugal · breadegg.com",
      }),
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
