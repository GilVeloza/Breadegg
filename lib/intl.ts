// A bare "pt" formats numbers and dates the Brazilian way; the site's
// Portuguese is European.
export function intlLocale(locale: string): string {
  return locale === "pt" ? "pt-PT" : locale;
}

// The studio reads its notifications in Spanish, whatever the visitor spoke,
// so the site language is named in Spanish there.
export const LANGUAGE_NAMES_ES: Record<string, string> = {
  en: "Inglés",
  pt: "Portugués",
  es: "Español",
  de: "Alemán",
};
