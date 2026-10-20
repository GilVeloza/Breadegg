import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/ui/Reveal";
import CaseCard from "@/components/ui/CaseCard";
import CtaButton from "@/components/ui/CtaButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { Steps } from "@/components/sections/Plans";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { publishedCases } from "@/content/cases";
import {
  isServiceSlug,
  servicePath,
  services,
  type ServiceCopy,
} from "@/content/services";
import { SITE_URL, STUDIO } from "@/lib/site";

type Params = Promise<{ locale: string; slug: string }>;

// Every service in every language is built at build time; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    services.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "services" });
  const copy = (t.raw("items") as Record<string, ServiceCopy>)[slug];

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: servicePath(locale, slug),
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, servicePath(l, slug)]),
        ),
        "x-default": servicePath(routing.defaultLocale, slug),
      },
    },
    openGraph: {
      type: "website",
      siteName: STUDIO.name,
      title: copy.metaTitle,
      description: copy.metaDescription,
      locale,
      url: servicePath(locale, slug),
    },
  };
}

/**
 * One page per service, written for the search that brings someone here:
 * a plain-language h1, what's included, who it's for, how it works, the work
 * that proves it, and the questions people actually ask, all in the HTML.
 */
export default async function ServicePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "services" });
  const cta = await getTranslations({ locale, namespace: "cta" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const copy = (t.raw("items") as Record<string, ServiceCopy>)[slug];
  const service = services.find((s) => s.slug === slug)!;
  const work = publishedCases().filter((c) =>
    (service.cases as readonly string[]).includes(c.id),
  );
  const url = `${SITE_URL}${servicePath(locale, slug)}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: copy.name,
        serviceType: service.serviceType,
        description: copy.metaDescription,
        url,
        inLanguage: locale,
        areaServed: "Worldwide",
        provider: { "@id": `${SITE_URL}/#studio` },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: copy.name,
          itemListElement: copy.includes.map((line) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: line },
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("home"),
            item: `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}`,
          },
          { "@type": "ListItem", position: 2, name: copy.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="relative px-6 pt-[clamp(8rem,18vh,11rem)] pb-[clamp(4rem,10vh,7rem)]">
        <div
          aria-hidden="true"
          className="egg-glow pointer-events-none absolute -top-1/3 left-1/2 h-[60vh] w-[110vw] -translate-x-1/2 rounded-[50%] opacity-40"
        />
        <Reveal className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="t-eyebrow text-ash-dim">
            <Link href="/" className="transition-colors hover:text-crumb">
              {t("home")}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-yolk">{copy.name}</span>
          </nav>
          <h1 className="t-h1 mt-6 max-w-4xl text-crumb">{copy.h1}</h1>
          <p className="t-lead mt-7 max-w-3xl text-ash">{copy.intro}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton href="#contact">{cta("getStarted")}</CtaButton>
            <CtaButton href="/#plans" variant="ghost">
              {nav("plans")}
            </CtaButton>
          </div>
        </Reveal>
      </section>

      <section className="relative px-6 py-[clamp(4rem,10vh,7rem)]">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-7">
            <h2 className="t-h2 text-crumb">{t("includes")}</h2>
            <ul className="mt-8 border-t border-crust-lift">
              {copy.includes.map((line) => (
                <li
                  key={line}
                  className="t-body flex gap-4 border-b border-crust-lift py-4 text-crumb"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-yolk"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <h2 className="t-h2 text-crumb">{t("forWho")}</h2>
            <ul className="mt-8 flex flex-col gap-5">
              {copy.forWho.map((line) => (
                <li key={line} className="t-lead text-ash">
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-[clamp(4rem,10vh,7rem)]">
        <div className="mx-auto max-w-6xl">
          <SectionHeader eyebrow={copy.name} title={t("how")} />
          <div className="mt-12">
            <Steps kind={service.billing} />
          </div>
        </div>
      </section>

      {work.length > 0 ? (
        <section className="relative px-6 py-[clamp(4rem,10vh,7rem)]">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow={copy.name} title={t("work")} />
            <ul className="mt-12 grid gap-4 md:grid-cols-2">
              {work.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-crust-lift bg-crust p-6 md:p-8"
                >
                  <CaseCard item={item} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <Faq eyebrow={copy.name} title={t("faq")} items={copy.faq} />
      <Contact />
    </>
  );
}
