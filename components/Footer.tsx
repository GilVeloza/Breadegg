import { useTranslations } from "next-intl";
import Wordmark from "@/components/ui/Wordmark";
import { ConsentSettings } from "@/components/Analytics";
import { Link } from "@/i18n/navigation";
import { services, type ServiceCopy } from "@/content/services";
import { CONTACT_EMAIL, FOUNDER } from "@/lib/site";

/**
 * The footer is also the site map a crawler finds on every page: one link to
 * each service, so no page is ever more than a click from any other.
 */
export default function Footer() {
  const t = useTranslations("footer");
  const s = useTranslations("services");
  const consent = useTranslations("consent");
  const copy = s.raw("items") as Record<string, ServiceCopy>;

  return (
    <footer className="border-t border-crust-lift px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
        <div className="flex flex-col gap-4 md:col-span-4">
          <Wordmark className="text-sm text-crumb" />
          <p className="t-eyebrow text-ash-dim">{t("location")}</p>
        </div>

        <nav aria-label={t("services")} className="md:col-span-4">
          <p className="t-eyebrow text-ash-dim">{t("services")}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="t-body text-ash transition-colors duration-200 hover:text-crumb"
                >
                  {copy[service.slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 md:col-span-4">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="t-body text-ash transition-colors duration-200 hover:text-crumb"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={FOUNDER.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="t-body text-ash transition-colors duration-200 hover:text-crumb"
          >
            LinkedIn ↗
          </a>
          <ConsentSettings label={consent("settings")} />
          <p className="t-eyebrow mt-4 text-ash-dim">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
