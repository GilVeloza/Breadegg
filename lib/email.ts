import { Resend } from "resend";
import { EGG_ATTACHMENT } from "./email-template";

/**
 * Outgoing email, through Resend. RESEND_API_KEY and CONTACT_TO_EMAIL live in
 * .env.local for development and in the hosting settings for production; the
 * sender must be on a domain verified in that Resend account.
 */
export const EMAIL_FROM =
  process.env.RESEND_FROM ?? "Breadegg <hello@breadegg.com>";

type Attachment = {
  filename: string;
  /** Base64 content, or… */
  content?: string;
  /** …a public URL Resend fetches the file from. */
  path?: string;
  contentType?: string;
  /** Set it and the attachment goes inline, for the HTML to use as cid:… */
  contentId?: string;
};

type Message = {
  to: string[];
  subject: string;
  /** Always sent alongside the HTML, for clients that read plain text. */
  text: string;
  /** Rendered with lib/email-template, which also adds the egg it needs. */
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export type Mailer = {
  /** Where enquiries and bookings are delivered. */
  inbox: string;
  send: (message: Message) => Promise<void>;
};

const withEgg = (message: Message): Attachment[] => [
  ...(message.html ? [EGG_ATTACHMENT] : []),
  ...(message.attachments ?? []),
];

/**
 * Development without a key: print the message and save the HTML under
 * .next/emails, with the egg inlined as a data URL so the file opens on its
 * own in a browser.
 */
async function preview(message: Message) {
  console.info(
    `\n[email, not sent: no RESEND_API_KEY]\nTo: ${message.to.join(", ")}\nSubject: ${message.subject}\n\n${message.text}\n`,
  );
  if (!message.html) return;
  const { mkdir, writeFile } = await import("node:fs/promises");
  const dir = `${process.cwd()}/.next/emails`;
  await mkdir(dir, { recursive: true });
  const slug = message.subject
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50);
  const file = `${dir}/${Date.now()}-${slug}.html`;
  await writeFile(
    file,
    message.html.replaceAll(
      `cid:${EGG_ATTACHMENT.contentId}`,
      `data:image/png;base64,${EGG_ATTACHMENT.content}`,
    ),
  );
  console.info(`[email preview] ${file}`);
}

/**
 * Null when production isn't configured. In development without a key the
 * messages are previewed instead, so the flows can be tried before the
 * account exists.
 */
export function mailer(): Mailer | null {
  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.CONTACT_TO_EMAIL;

  if (apiKey && inbox) {
    const resend = new Resend(apiKey);
    return {
      inbox,
      async send(message) {
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {}),
          ...(message.replyTo ? { replyTo: message.replyTo } : {}),
          attachments: withEgg(message),
        });
        if (error) throw new Error(`Resend rejected the message: ${error.message}`);
      },
    };
  }

  if (process.env.NODE_ENV === "development") {
    return { inbox: inbox ?? "hello@breadegg.com", send: preview };
  }

  return null;
}
