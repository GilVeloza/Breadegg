import { routing } from "@/i18n/routing";

/**
 * One page per thing people search for. The copy lives in
 * messages/*.json under `services.items.<slug>`; this file only holds what is
 * the same in every language: the URL, how it is bought, the work that
 * proves it and the schema.org type search engines file it under.
 *
 * `billing` says whether the work goes through the subscription queue or is
 * too big for it and gets a fixed price; the page shows the matching steps.
 */
export const services = [
  {
    slug: "websites",
    billing: "subscription",
    cases: ["art-4-everyone", "eeyesee", "travel-now-madeira", "rackers"],
    serviceType: "Web design and development",
  },
  {
    slug: "brand",
    billing: "subscription",
    cases: ["madeira-dream-stays", "politica-mais", "rackers"],
    serviceType: "Brand identity design",
  },
  {
    slug: "apps",
    billing: "project",
    cases: ["rackers", "politica-mais"],
    serviceType: "Mobile app development",
  },
  {
    slug: "ai-automation",
    billing: "project",
    cases: ["rackers"],
    serviceType: "AI and business process automation",
  },
  {
    slug: "seo-geo",
    billing: "subscription",
    cases: [],
    serviceType: "Search engine optimization",
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export type ServiceCopy = {
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  includes: string[];
  forWho: string[];
  faq: { q: string; a: string }[];
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return services.some((s) => s.slug === value);
}

/** The path as the visitor sees it: English at the root, the rest prefixed. */
export function servicePath(locale: string, slug: ServiceSlug) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/services/${slug}`;
}
