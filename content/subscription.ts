import { intlLocale } from "@/lib/intl";

/**
 * The subscription, in numbers. The words live in messages under
 * `plans.subscription`; what is the same in every language lives here, so the
 * pricing card, the structured data and llms.txt can never quote different
 * figures.
 */
export const SUBSCRIPTION: {
  currency: string;
  /** The price once the founding seats are gone. */
  price: number;
  /** What the first clients pay, kept for as long as they stay. */
  foundingPrice: number;
  foundingSeats: number;
  /** One person does the work, so the roster is capped. */
  seats: number;
  /** Clients subscribed right now. Update it by hand when one joins or leaves. */
  taken: number;
} = {
  currency: "EUR",
  price: 2990,
  foundingPrice: 2490,
  foundingSeats: 3,
  seats: 4,
  taken: 1,
};

/** Whoever joins while the roster is below the founding seats gets the founding price. */
export function isFounding(): boolean {
  return SUBSCRIPTION.taken < SUBSCRIPTION.foundingSeats;
}

export function currentPrice(): number {
  return isFounding() ? SUBSCRIPTION.foundingPrice : SUBSCRIPTION.price;
}

export function seatsOpen(): number {
  return Math.max(0, SUBSCRIPTION.seats - SUBSCRIPTION.taken);
}

/** "€2,490" in English, "2490 €" in Portuguese, "2.490 €" in German. */
export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: SUBSCRIPTION.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
