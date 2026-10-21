import { routing } from "@/i18n/routing";

/**
 * The private link in a booking's emails. Whoever holds it can move or
 * cancel that one call, so it is long and random, and only its SHA-256 is
 * stored: the database alone can't be turned back into working links.
 */

/** 24 random bytes, base64url: 32 characters. */
export function createToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function isToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(value);
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The page where the visitor moves or cancels, in the language they booked in. */
export function managePath(locale: string, token: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/booking/${token}`;
}

/** The booking as a calendar file, always the current time. */
export function calendarPath(token: string): string {
  return `/api/booking/${token}/calendar.ics`;
}
