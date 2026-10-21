// Single source of truth for the handful of values that differ per environment.
// Override in .env.local rather than editing here.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://breadegg.com";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@breadegg.com";

// The Google Analytics 4 measurement ID (G-XXXXXXXXXX). Public by nature: it
// ships in the page. Empty means no analytics and no cookie banner.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

// The Stripe Payment Link for the subscription. Until it exists, "Start
// today" on the pricing card sends people to the contact form instead.
export const SUBSCRIBE_URL = process.env.NEXT_PUBLIC_SUBSCRIBE_URL ?? "";

// The person a client actually talks to. Public on purpose: a small studio
// sells on who is behind it.
export const FOUNDER = {
  name: "Gil Veloza",
  linkedin: "https://www.linkedin.com/in/gilveloza/",
  photo: "/founder/gil-veloza.jpg",
} as const;

export const STUDIO = {
  name: "BreadEgg",
  region: "Madeira",
  country: "PT",
} as const;
