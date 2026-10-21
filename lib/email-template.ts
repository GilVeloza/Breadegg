import { EGG_PNG_BASE64 } from "./email-assets";

/**
 * Breadegg's emails, in the site's own look: the crust ground, crumb text,
 * the yolk for the one thing that matters, and the egg mark at the top.
 *
 * Built the way email clients still need it: tables for layout, every style
 * inline, no CSS that Gmail or Outlook would drop. Inter loads where the
 * client allows web fonts and falls back to the system face elsewhere. The
 * egg rides along as an inline attachment, so it shows even where remote
 * images are blocked.
 */

const C = {
  crust: "#2a1a0f",
  card: "#1c1109",
  line: "#34210f",
  crumb: "#f7f1e8",
  ash: "#a89685",
  ashDim: "#9a8979",
  yolk: "#f4901c",
};

const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const EGG_CID = "breadegg-egg";

/** Attach this to every message rendered here: the HTML points at it. */
export const EGG_ATTACHMENT = {
  filename: "breadegg.png",
  content: EGG_PNG_BASE64,
  contentType: "image/png",
  contentId: EGG_CID,
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped, with the line breaks someone typed kept. */
const multiline = (text: string) => escapeHtml(text).replace(/\r?\n/g, "<br>");

export type EmailDetail = { label: string; value: string; href?: string };

export type EmailContent = {
  lang: string;
  /** The line inbox lists show after the subject. */
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  details?: EmailDetail[];
  quote?: { label: string; text: string };
  cta?: { label: string; href: string };
  /** A row of add-to-calendar buttons, one per calendar app. */
  calendars?: { label: string; buttons: { label: string; href: string }[] };
  /** A line of quiet text links, such as changing or cancelling. */
  links?: { label: string; items: { label: string; href: string }[] };
  footnote?: string;
  footer: string;
};

const egg = (size: number) =>
  `<img src="cid:${EGG_CID}" width="${size}" height="${size}" alt="" style="display:block;border:0;outline:none;width:${size}px;height:${size}px;">`;

function details(rows: EmailDetail[]): string {
  const cells = rows
    .map((row) => {
      const value = row.href
        ? `<a href="${escapeHtml(row.href)}" style="color:${C.crumb};text-decoration:underline;text-decoration-color:${C.line};">${escapeHtml(row.value)}</a>`
        : escapeHtml(row.value);
      return `<tr>
  <td style="padding:12px 0;border-top:1px solid ${C.line};font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.ashDim};width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
  <td style="padding:12px 0;border-top:1px solid ${C.line};font-family:${FONT};font-size:15px;line-height:1.5;color:${C.crumb};vertical-align:top;">${value}</td>
</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-collapse:collapse;">${cells}</table>`;
}

function quote(q: { label: string; text: string }): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
<tr><td style="padding:20px 22px;border:1px solid ${C.line};border-radius:14px;">
  <p style="margin:0;font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.ashDim};">${escapeHtml(q.label)}</p>
  <p style="margin:10px 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.crumb};">${multiline(q.text)}</p>
</td></tr>
</table>`;
}

/** The site's CTA button: a small yolk, then the words, on a lifted crust. */
function button(cta: { label: string; href: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
<tr><td bgcolor="${C.line}" style="background:${C.line};border:1px solid #7a4a1a;border-radius:12px;">
  <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:13px 20px;font-family:${FONT};font-size:15px;font-weight:500;letter-spacing:-0.01em;color:${C.crumb};text-decoration:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;padding-right:10px;">${egg(10)}</td>
      <td style="vertical-align:middle;font-family:${FONT};font-size:15px;font-weight:500;color:${C.crumb};">${escapeHtml(cta.label)}</td>
    </tr></table>
  </a>
</td></tr>
</table>`;
}

/** Side by side where there is room, wrapping onto a second line where not. */
function calendarButtons(c: NonNullable<EmailContent["calendars"]>): string {
  const buttons = c.buttons
    .map(
      (b) =>
        `<a href="${escapeHtml(b.href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 16px;background:${C.line};border:1px solid #7a4a1a;border-radius:12px;font-family:${FONT};font-size:14px;font-weight:500;color:${C.crumb};text-decoration:none;">${escapeHtml(b.label)}</a>`,
    )
    .join("");
  return `<p style="margin:32px 0 0;font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.ashDim};">${escapeHtml(c.label)}</p>
<div style="margin-top:12px;">${buttons}</div>`;
}

function textLinks(l: NonNullable<EmailContent["links"]>): string {
  const items = l.items
    .map(
      (i) =>
        `<a href="${escapeHtml(i.href)}" style="color:${C.crumb};text-decoration:underline;text-decoration-color:#7a4a1a;">${escapeHtml(i.label)}</a>`,
    )
    .join(` <span style="color:${C.ashDim};">·</span> `);
  return `<p style="margin:24px 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.ash};">${escapeHtml(l.label)} ${items}</p>`;
}

export function renderEmail(email: EmailContent): string {
  const paragraphs = (email.paragraphs ?? [])
    .map(
      (p, i) =>
        `<p style="margin:${i === 0 ? 28 : 16}px 0 0;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.ash};">${multiline(p)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(email.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(email.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:${C.crust}; }
  @media (max-width:600px) {
    .card { padding:30px 22px !important; }
    .title { font-size:27px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.crust};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;color:${C.crust};">${escapeHtml(email.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.crust}" style="background:${C.crust};">
<tr><td align="center" style="padding:40px 16px 48px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

    <tr><td style="padding:0 4px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;">${egg(14)}</td>
        <td style="vertical-align:middle;padding-left:8px;font-family:${FONT};font-size:16px;font-weight:600;letter-spacing:-0.02em;color:${C.crumb};">Breadegg</td>
      </tr></table>
    </td></tr>

    <tr><td class="card" bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:40px 36px;">
      ${egg(48)}
      <p style="margin:28px 0 0;font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.yolk};">${escapeHtml(email.eyebrow)}</p>
      <h1 class="title" style="margin:12px 0 0;font-family:${FONT};font-size:31px;line-height:1.12;font-weight:600;letter-spacing:-0.03em;color:${C.crumb};">${escapeHtml(email.title)}</h1>
      ${email.subtitle ? `<p style="margin:10px 0 0;font-family:${FONT};font-size:15px;line-height:1.5;color:${C.ash};">${escapeHtml(email.subtitle)}</p>` : ""}
      ${paragraphs}
      ${email.details?.length ? details(email.details) : ""}
      ${email.quote ? quote(email.quote) : ""}
      ${email.cta ? button(email.cta) : ""}
      ${email.calendars ? calendarButtons(email.calendars) : ""}
      ${email.links ? textLinks(email.links) : ""}
      ${email.footnote ? `<p style="margin:28px 0 0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.ashDim};">${multiline(email.footnote)}</p>` : ""}
    </td></tr>

    <tr><td style="padding:24px 4px 0;font-family:${FONT};font-size:12px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.ashDim};">${escapeHtml(email.footer)}</td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}
