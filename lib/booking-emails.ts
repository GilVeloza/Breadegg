import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BOOKING } from "@/content/booking";
import type { Booking } from "@/lib/booking-store";
import { calendarPath, managePath } from "@/lib/booking-token";
import type { Mailer } from "@/lib/email";
import { renderEmail } from "@/lib/email-template";
import { LANGUAGE_NAMES_ES, intlLocale } from "@/lib/intl";
import { SITE_URL } from "@/lib/site";

/**
 * Every email a booking sends, in one place: the visitor's confirmation (new
 * or moved), their cancellation, and the studio's notice for each. The visitor
 * always hears back in the language the site was in when they booked; the
 * studio always reads Spanish.
 */

export function when(start: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(start);
}

/** Capital first letter: Intl writes "miércoles", a heading wants "Miércoles". */
function sentence(text: string, locale: string) {
  return text.charAt(0).toLocaleUpperCase(intlLocale(locale)) + text.slice(1);
}

const span = (b: Booking) => {
  const start = new Date(b.slot);
  return { start, end: new Date(start.getTime() + BOOKING.callMinutes * 60_000) };
};

const stamp = (d: Date) =>
  d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * The call as a calendar file. The UID stays the same when the call moves and
 * the sequence goes up, so a calendar that already has it updates the event
 * instead of adding a second one; METHOD:CANCEL takes it out again.
 */
export function calendarFile(
  b: Booking,
  summary: string,
  description: string,
  method: "PUBLISH" | "CANCEL" = "PUBLISH",
) {
  const text = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const { start, end } = span(b);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Breadegg//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${b.uid}@breadegg.com`,
    `SEQUENCE:${b.sequence}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(summary)}`,
    `DESCRIPTION:${text(description)}`,
    "LOCATION:Google Meet",
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    `URL:${SITE_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

const ics = (content: string) => ({
  filename: "breadegg-call.ics",
  content: Buffer.from(content).toString("base64"),
  contentType: "text/calendar",
});

function googleCalendarUrl(b: Booking, title: string, details: string) {
  const { start, end } = span(b);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
    location: "Google Meet",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function outlookUrl(b: Booking, title: string, details: string) {
  const { start, end } = span(b);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: details,
    location: "Google Meet",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

/** The visitor's confirmation, for a new booking or after moving it. */
export async function confirmToVisitor(
  mail: Mailer,
  b: Booking,
  token: string,
  kind: "booked" | "moved",
) {
  const t = await getTranslations({ locale: b.locale, namespace: "booking.email" });
  const theirs = when(new Date(b.slot), b.locale, b.timeZone);
  const manage = `${SITE_URL}${managePath(b.locale, token)}`;
  const calendars = [
    { label: "Google Calendar", href: googleCalendarUrl(b, t("summary"), t("meet")) },
    // An .ics over https: iPhone and Mac offer to add it to Calendar.
    { label: "Apple Calendar", href: `${SITE_URL}${calendarPath(token)}` },
    { label: "Outlook", href: outlookUrl(b, t("summary"), t("meet")) },
  ];
  const moved = kind === "moved";
  // The guide to the call goes with the first confirmation, in their language.
  // Resend fetches it from the site, so it never has to ride in the worker.
  const guide = moved
    ? []
    : [
        {
          filename: t("guideFile"),
          path: `${SITE_URL}/pdf/breadegg-call-${b.locale}.pdf`,
          contentType: "application/pdf",
        },
      ];

  await mail.send({
    to: [b.email],
    replyTo: mail.inbox,
    subject: t(moved ? "movedSubject" : "subject", { when: theirs }),
    text: [
      t("greeting", { name: b.name }),
      "",
      t("booked", { when: theirs, timeZone: b.timeZone }),
      t("meet"),
      ...(moved ? [] : [t("guide")]),
      "",
      `${t("addTo")}:`,
      ...calendars.map((c) => `- ${c.label}: ${c.href}`),
      "",
      `${t("moveLink")}: ${manage}`,
      `${t("cancelLink")}: ${manage}?action=cancel`,
      ...(b.message ? ["", t("yours"), b.message] : []),
      "",
      t("sign"),
    ].join("\n"),
    html: renderEmail({
      lang: b.locale,
      preheader: t("booked", { when: theirs, timeZone: b.timeZone }),
      eyebrow: t(moved ? "movedEyebrow" : "eyebrow"),
      title: sentence(theirs, b.locale),
      subtitle: t("duration", { timeZone: b.timeZone }),
      paragraphs: [
        t("greeting", { name: b.name }),
        t("meet"),
        ...(moved ? [] : [t("guide")]),
      ],
      quote: b.message ? { label: t("yours"), text: b.message } : undefined,
      calendars: { label: t("addTo"), buttons: calendars },
      links: {
        label: t("manage"),
        items: [
          { label: t("moveLink"), href: manage },
          { label: t("cancelLink"), href: `${manage}?action=cancel` },
        ],
      },
      footnote: t("calendarNote"),
      footer: "Breadegg · Madeira, Portugal · breadegg.com",
    }),
    attachments: [ics(calendarFile(b, t("summary"), t("meet"))), ...guide],
  });
}

/** The visitor's note that the call is off, with the event taken back out. */
export async function cancellationToVisitor(mail: Mailer, b: Booking) {
  const t = await getTranslations({ locale: b.locale, namespace: "booking.email" });
  const theirs = when(new Date(b.slot), b.locale, b.timeZone);
  const prefix = b.locale === routing.defaultLocale ? "" : `/${b.locale}`;
  const again = `${SITE_URL}${prefix}/#contact`;

  await mail.send({
    to: [b.email],
    replyTo: mail.inbox,
    subject: t("cancelledSubject"),
    text: [
      t("greeting", { name: b.name }),
      "",
      t("cancelledBody", { when: theirs }),
      `${t("bookAgain")}: ${again}`,
      "",
      t("sign"),
    ].join("\n"),
    html: renderEmail({
      lang: b.locale,
      preheader: t("cancelledBody", { when: theirs }),
      eyebrow: t("cancelledEyebrow"),
      title: sentence(theirs, b.locale),
      subtitle: t("duration", { timeZone: b.timeZone }),
      paragraphs: [t("greeting", { name: b.name }), t("cancelledBody", { when: theirs })],
      cta: { label: t("bookAgain"), href: again },
      footer: "Breadegg · Madeira, Portugal · breadegg.com",
    }),
    attachments: [
      ics(
        calendarFile(
          { ...b, sequence: b.sequence + 1 },
          t("summary"),
          t("cancelledBody", { when: theirs }),
          "CANCEL",
        ),
      ),
    ],
  });
}

const STUDIO = {
  booked: { subject: "Llamada reservada", eyebrow: "Nueva llamada reservada" },
  moved: { subject: "Llamada cambiada", eyebrow: "Llamada cambiada de hora" },
  cancelled: { subject: "Llamada cancelada", eyebrow: "Llamada cancelada" },
};

/** The studio's notice, in Spanish, for a booking, a move or a cancellation. */
export async function notifyStudio(
  mail: Mailer,
  kind: keyof typeof STUDIO,
  b: Booking,
  previous?: Booking,
) {
  const start = new Date(b.slot);
  const madeira = when(start, "es", BOOKING.timeZone);
  const details = [
    { label: "Nombre", value: b.name },
    { label: "Email", value: b.email, href: `mailto:${b.email}` },
    { label: "Empresa", value: b.company || "—" },
    { label: "Su hora", value: `${when(start, "es", b.timeZone)} (${b.timeZone})` },
    { label: "Idioma de la web", value: LANGUAGE_NAMES_ES[b.locale] ?? b.locale },
  ];
  const subtitle =
    kind === "moved" && previous
      ? `Antes: ${when(new Date(previous.slot), "es", BOOKING.timeZone)} · hora de Madeira`
      : kind === "cancelled"
        ? "Hora de Madeira · el día vuelve a estar libre en la web"
        : "Hora de Madeira · 15 minutos";
  const footnote =
    kind === "cancelled"
      ? "No hace falta hacer nada: la reserva ya está borrada y el cliente ha recibido la confirmación."
      : `Mándale el enlace de Google Meet antes de la llamada${kind === "moved" ? ", con la hora nueva" : ""}. Para cancelarla tú, escríbele y borra la fila del ${b.date} en D1 (breadegg-bookings).`;

  await mail.send({
    to: [mail.inbox],
    replyTo: b.email,
    subject: `${STUDIO[kind].subject}: ${b.name}${b.company ? ` · ${b.company}` : ""} · ${madeira}`,
    text: [
      `${STUDIO[kind].eyebrow} en breadegg.com.`,
      "",
      `Cuándo: ${madeira} (hora de Madeira)`,
      ...(previous ? [`Antes:  ${when(new Date(previous.slot), "es", BOOKING.timeZone)}`] : []),
      ...details.map((d) => `${d.label}: ${d.value}`),
      "",
      "De qué quiere hablar:",
      b.message || "No escribió nada.",
      "",
      footnote,
    ].join("\n"),
    html: renderEmail({
      lang: "es",
      preheader: `${b.name} · ${madeira}`,
      eyebrow: STUDIO[kind].eyebrow,
      title: sentence(madeira, "es"),
      subtitle,
      details,
      quote: { label: "De qué quiere hablar", text: b.message || "No escribió nada." },
      cta: {
        label: `Responder a ${b.name}`,
        href: `mailto:${b.email}?subject=${encodeURIComponent("Re: Breadegg")}`,
      },
      footnote,
      footer: "breadegg.com · Reservas",
    }),
  });
}
