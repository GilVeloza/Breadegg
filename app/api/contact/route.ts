import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { mailer } from "@/lib/email";
import { renderEmail } from "@/lib/email-template";
import { LANGUAGE_NAMES_ES } from "@/lib/intl";
import { throttle } from "@/lib/throttle";

const throttled = throttle(3);

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

  // Honeypot: a real person never fills a field they cannot see. Answer 200 so
  // the bot believes it succeeded and doesn't come back to probe.
  if (typeof body.fax === "string" && body.fax.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const company = String(body.company ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 4000);
  const locale = hasLocale(routing.locales, body.locale)
    ? body.locale
    : routing.defaultLocale;

  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const mail = mailer();
  if (!mail) {
    console.error("Contact form is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // The studio reads this one in Spanish.
  const details = [
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "Empresa", value: company || "—" },
    { label: "Idioma de la web", value: LANGUAGE_NAMES_ES[locale] ?? locale },
  ];

  try {
    await mail.send({
      to: [mail.inbox],
      replyTo: email,
      subject: `Nuevo mensaje: ${name}${company ? ` · ${company}` : ""}`,
      text: [
        "Nuevo mensaje desde el formulario de breadegg.com.",
        "",
        `Nombre: ${name}`,
        ...details.map((d) => `${d.label}: ${d.value}`),
        "",
        message,
      ].join("\n"),
      html: renderEmail({
        lang: "es",
        preheader: message.slice(0, 140),
        eyebrow: "Nuevo mensaje desde la web",
        title: name,
        subtitle: company || email,
        details,
        quote: { label: "Mensaje", text: message },
        cta: {
          label: `Responder a ${name}`,
          href: `mailto:${email}?subject=${encodeURIComponent("Re: Breadegg")}`,
        },
        footer: "breadegg.com · Formulario de contacto",
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (cause) {
    console.error("Contact form failed:", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
