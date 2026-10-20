import { Resend } from "resend";

/**
 * Outgoing email, through Resend. RESEND_API_KEY and CONTACT_TO_EMAIL live in
 * .env.local for development and in the hosting settings for production; the
 * sender must be on a domain verified in that Resend account.
 */
export const EMAIL_FROM =
  process.env.RESEND_FROM ?? "Breadegg <hello@breadegg.com>";

type Message = {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
};

export type Mailer = {
  /** Where enquiries and bookings are delivered. */
  inbox: string;
  send: (message: Message) => Promise<void>;
};

/**
 * Null when production isn't configured. In development without a key the
 * messages are printed to the terminal instead, so the flows can be tried
 * before the account exists.
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
          ...message,
        });
        if (error) throw new Error(`Resend rejected the message: ${error.message}`);
      },
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      inbox: inbox ?? "hello@breadegg.com",
      async send(message) {
        console.info(
          `\n[email, not sent: no RESEND_API_KEY]\nTo: ${message.to.join(", ")}\nSubject: ${message.subject}\n\n${message.text}\n`,
        );
      },
    };
  }

  return null;
}
