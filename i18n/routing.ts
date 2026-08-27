import { defineRouting } from "next-intl/routing";

export const locales = ["en", "pt", "es", "de"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  // English lives at "/", the rest at "/pt", "/es", "/de".
  localePrefix: "as-needed",
});
