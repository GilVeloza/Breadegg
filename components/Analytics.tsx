"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";
import { GA_ID } from "@/lib/site";

/**
 * Google Analytics, only with consent.
 *
 * Analytics cookies need a yes first in the EU, so gtag is not even loaded
 * until the visitor accepts: no cookieless pings, no "consent mode" sending
 * data in the background. The choice is remembered in localStorage and can be
 * changed from the footer. A browser sending Global Privacy Control is taken
 * as a no and never sees the banner. Without a measurement ID none of this
 * renders.
 */

type Consent = "granted" | "denied" | null;

const KEY = "breadegg-consent";
const listeners = new Set<() => void>();

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "granted" || value === "denied") return value;
  } catch {
    // Storage blocked: ask again, every visit.
  }
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl;
  return gpc ? "denied" : null;
}

function writeConsent(value: Consent) {
  try {
    if (value) window.localStorage.setItem(KEY, value);
    else window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do: the choice holds for this page view only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** "pending" on the server, so nobody who already chose sees a banner flash. */
function useConsent() {
  return useSyncExternalStore<Consent | "pending">(
    subscribe,
    readConsent,
    () => "pending",
  );
}

function forgetAnalytics() {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  gtag?.("consent", "update", { analytics_storage: "denied" });
  // Clear the cookies GA already set, on this host and the parent domain.
  const domain = window.location.hostname.replace(/^www\./, "");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const scope of ["", `; domain=.${domain}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/${scope}`;
    }
  }
}

export default function Analytics() {
  const t = useTranslations("consent");
  const consent = useConsent();

  // Buttons that matter for the business carry data-track: one listener here
  // instead of a client component around every one of them.
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-track]",
      );
      if (target?.dataset.track) track(target.dataset.track);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID || consent === "pending") return null;

  if (consent === "granted") {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </>
    );
  }

  if (consent === "denied") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("label")}
      className="fixed inset-x-4 bottom-4 z-[60] rounded-2xl border border-crust-lift bg-crust-deep/95 p-6 shadow-2xl backdrop-blur-xl sm:right-auto sm:max-w-sm"
    >
      <p className="t-body text-ash">{t("text")}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className="inline-flex items-center gap-3 rounded-xl border border-yolk/35 bg-crust-lift px-5 py-2.5 text-[0.9375rem] font-medium text-crumb transition-colors duration-300 hover:border-yolk/70"
        >
          <span aria-hidden="true" className="egg-yolk cta-yolk block size-2.5 shrink-0" />
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="rounded-xl border border-crust-lift px-5 py-2.5 text-[0.9375rem] font-medium text-ash transition-colors duration-300 hover:border-ash-dim hover:text-crumb"
        >
          {t("decline")}
        </button>
      </div>
    </div>
  );
}

/** The footer link that takes the choice back: withdrawing is as easy as giving. */
export function ConsentSettings({ label }: { label: string }) {
  if (!GA_ID) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (readConsent() === "granted") forgetAnalytics();
        writeConsent(null);
      }}
      className="t-body w-fit text-ash transition-colors duration-200 hover:text-crumb"
    >
      {label}
    </button>
  );
}
