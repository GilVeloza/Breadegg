// Single source of truth for the handful of values that differ per environment.
// Override in .env.local rather than editing here.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://breadegg.com";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@breadegg.com";

export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "";

export const STUDIO = {
  name: "BreadEgg",
  city: "Funchal",
  region: "Madeira",
  country: "PT",
} as const;
