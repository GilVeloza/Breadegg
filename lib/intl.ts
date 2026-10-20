// A bare "pt" formats numbers and dates the Brazilian way; the site's
// Portuguese is European.
export function intlLocale(locale: string): string {
  return locale === "pt" ? "pt-PT" : locale;
}
