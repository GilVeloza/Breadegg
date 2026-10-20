import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { servicePath, services } from "@/content/services";
import { SITE_URL } from "@/lib/site";

function home(locale: string) {
  return locale === routing.defaultLocale
    ? SITE_URL
    : `${SITE_URL}/${locale}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homes = routing.locales.map((locale) => ({
    url: home(locale),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, home(l)])),
    },
  }));

  // One entry per service per language, each pointing at its translations.
  const pages = services.flatMap((service) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${servicePath(locale, service.slug)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${SITE_URL}${servicePath(l, service.slug)}`,
          ]),
        ),
      },
    })),
  );

  return [...homes, ...pages];
}
