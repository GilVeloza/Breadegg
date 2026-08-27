"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Wordmark from "@/components/ui/Wordmark";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Nav() {
  const t = useTranslations("nav");
  const [lifted, setLifted] = useState(false);

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
        <Link href="/" className="text-[0.95rem] text-crumb">
          <Wordmark />
          <span className="sr-only">Breadegg, home</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-8">
          <nav className="hidden items-center gap-6 sm:flex">
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
