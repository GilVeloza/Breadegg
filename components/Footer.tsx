import { useTranslations } from "next-intl";
import Wordmark from "@/components/ui/Wordmark";
import { CONTACT_EMAIL } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-crust-lift px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Wordmark className="text-sm text-crumb" />
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="t-eyebrow text-ash transition-colors duration-200 hover:text-crumb"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="t-eyebrow text-ash-dim">{t("location")}</p>
        <p className="t-eyebrow text-ash-dim">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
