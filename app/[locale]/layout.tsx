import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { CONTACT_EMAIL, FOUNDER, SITE_URL, STUDIO } from "@/lib/site";
import { services, servicePath, type ServiceCopy } from "@/content/services";
import { SUBSCRIPTION, currentPrice } from "@/content/subscription";
import FloatingChat from "@/components/ui/FloatingChat";
import Analytics from "@/components/Analytics";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "../globals.css";

// Inter is the closest free equivalent to SF, and — crucially — it carries the
// `opsz` axis, the same optical-size switch that keeps SF readable at 14px and
// tight at 96px. Self-hosted by next/font, so no third-party request.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function pathFor(locale: Locale) {
  return locale === routing.defaultLocale ? "/" : `/${locale}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: pathFor(locale as Locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, pathFor(l)])),
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: STUDIO.name,
      title: t("title"),
      description: t("description"),
      locale,
      url: pathFor(locale as Locale),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opt this locale into static rendering.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta" });
  const hero = await getTranslations({ locale, namespace: "hero" });
  const caps = await getTranslations({ locale, namespace: "capabilities" });
  const svc = await getTranslations({ locale, namespace: "services" });
  const cta = await getTranslations({ locale, namespace: "cta" });
  const plans = await getTranslations({ locale, namespace: "plans" });
  const serviceCopy = svc.raw("items") as Record<string, ServiceCopy>;

  // What search engines and AI assistants read about the studio on every
  // page: who it is, who runs it, what it does and where each service lives.
  // The subscription has a public price, so it goes in too; project prices
  // are agreed in writing.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#studio`,
        name: STUDIO.name,
        slogan: hero("title"),
        description: t("description"),
        url: SITE_URL,
        email: CONTACT_EMAIL,
        logo: `${SITE_URL}/icon`,
        image: `${SITE_URL}${FOUNDER.photo}`,
        areaServed: "Worldwide",
        availableLanguage: ["en", "pt", "es", "de"],
        knowsAbout: caps.raw("items") as string[],
        address: {
          "@type": "PostalAddress",
          addressRegion: STUDIO.region,
          addressCountry: STUDIO.country,
        },
        founder: {
          "@type": "Person",
          name: FOUNDER.name,
          jobTitle: "Founder",
          image: `${SITE_URL}${FOUNDER.photo}`,
          sameAs: [FOUNDER.linkedin],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: svc("eyebrow"),
          itemListElement: [
            {
              "@type": "Offer",
              name: plans("subscription.name"),
              price: currentPrice(),
              priceCurrency: SUBSCRIPTION.currency,
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: currentPrice(),
                priceCurrency: SUBSCRIPTION.currency,
                unitText: "MONTH",
              },
              itemOffered: {
                "@type": "Service",
                name: plans("subscription.name"),
              },
            },
            ...services.map((service) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: serviceCopy[service.slug].name,
                serviceType: service.serviceType,
                url: `${SITE_URL}${servicePath(locale, service.slug)}`,
              },
            })),
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: STUDIO.name,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#studio` },
      },
    ],
  };

  return (
    <html lang={locale} className={inter.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          // The studio as an entity: the thing AI search quotes when someone
          // asks who builds websites, apps or AI for a business like theirs.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <SmoothScroll>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
          <FloatingChat label={cta("talk")} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
