"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

/** Each language in its own language — nobody looks for "German" under D. */
const NAMES: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
  de: "Deutsch",
};

/**
 * A real <select>, so it opens as the platform's own picker: a listbox on
 * desktop, the native wheel on iOS. The chevron is ours, the rest is the OS —
 * which is why `appearance-none` strips the control and `color-scheme: dark`
 * has to be set explicitly, or the open menu comes back white.
 */
export default function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative flex items-center">
      <select
        aria-label={t("language")}
        value={active}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          // The locale lives in the path, so switching is a navigation.
          startTransition(() => router.replace(pathname, { locale: next }));
        }}
        className="t-eyebrow cursor-pointer appearance-none rounded bg-transparent py-1 pl-1.5 pr-5 text-ash transition-colors duration-200 hover:text-crumb focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yolk disabled:opacity-60"
        style={{ colorScheme: "dark" }}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {NAMES[locale]}
          </option>
        ))}
      </select>

      <svg
        aria-hidden="true"
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-1 h-[6px] w-[10px] fill-none stroke-ash-dim"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </div>
  );
}
