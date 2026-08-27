import type { Locale } from "@/i18n/routing";

/**
 * Case studies live here rather than in messages/ because they are data, not
 * page copy — you add and remove them over time.
 *
 * Anything marked `draft: true` is visible in `npm run dev` only. It is
 * stripped from production builds, so a placeholder can never ship as a claim
 * about a real client. Delete the flag when the numbers are real and cleared.
 */

type Localized = { en: string } & Partial<Record<Locale, string>>;

export type CaseStudy = {
  id: string;
  draft?: boolean;
  /** The headline number, e.g. "60%", "×4", "400/mo". Locale-independent. */
  metric: string;
  metricLabel: Localized;
  /** Who it was for. Name them, or describe them: "a hotel group in Funchal". */
  client: Localized;
  problem: Localized;
  built: Localized;
};

export function pick(value: Localized, locale: string): string {
  return value[locale as Locale] ?? value.en;
}

export const cases: CaseStudy[] = [
  {
    id: "placeholder-1",
    draft: true,
    metric: "00%",
    metricLabel: { en: "PLACEHOLDER: the result that changed" },
    client: { en: "PLACEHOLDER: who it was for" },
    problem: { en: "PLACEHOLDER: what was costing them time or money." },
    built: { en: "PLACEHOLDER: what we actually built." },
  },
  {
    id: "placeholder-2",
    draft: true,
    metric: "00h",
    metricLabel: { en: "PLACEHOLDER: the result that changed" },
    client: { en: "PLACEHOLDER: who it was for" },
    problem: { en: "PLACEHOLDER: what was costing them time or money." },
    built: { en: "PLACEHOLDER: what we actually built." },
  },
];

export function publishedCases(): CaseStudy[] {
  return process.env.NODE_ENV === "development"
    ? cases
    : cases.filter((c) => !c.draft);
}
