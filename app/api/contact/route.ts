import { NextResponse } from "next/server";
import { mailer } from "@/lib/email";
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

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const mail = mailer();
  if (!mail) {
    console.error("Contact form is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  try {
    await mail.send({
      to: [mail.inbox],
      replyTo: email,
      subject: `New enquiry: ${name}${company ? ` · ${company}` : ""}`,
      text: [
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Company: ${company || "not given"}`,
        "",
        message,
      ].join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (cause) {
    console.error("Contact form failed:", cause);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
