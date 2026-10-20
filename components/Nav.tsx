"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { getLenis } from "@/lib/lenis";
import Wordmark from "@/components/ui/Wordmark";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);

  // On the home page the logo links to where you already are: the URL does
  // not change, so there is nothing for Next to navigate to and the page
  // stays put. Scroll to the top instead, through Lenis when it is driving.
  const toTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0 });
    // A leftover #cases would send a reload back down the page.
    if (window.location.hash) {
      history.replaceState(
        history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        lifted
          ? "border-b border-crust-lift bg-crust/72 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-10 focus:rounded focus:bg-crust-lift focus:px-3 focus:py-2"
      >
        {t("skip")}
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={toTop} className="text-[0.95rem] text-crumb">
          <Wordmark />
          <span className="sr-only">Breadegg, home</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-8">
          {/* Links go through "/" so they also work from a service page. */}
          <nav className="hidden items-center gap-6 sm:flex">
            {(["work", "plans"] as const).map((key) => (
              <Link
                key={key}
                href={`/#${key === "work" ? "cases" : "plans"}`}
                className="t-eyebrow text-ash transition-colors duration-200 hover:text-crumb"
              >
                {t(key)}
              </Link>
            ))}
            <a
              href="#contact"
              className="t-eyebrow text-ash transition-colors duration-200 hover:text-crumb"
            >
              {t("contact")}
            </a>
          </nav>
          <LocaleSwitcher />
          <a
            href="#contact"
            className="t-eyebrow text-ash transition-colors duration-200 hover:text-crumb sm:hidden"
          >
            {t("contact")}
          </a>
        </div>
      </div>
    </header>
  );
}
