import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, STUDIO } from "@/lib/site";
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
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, pathFor(l)]),
      ),
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

  return (
    <html lang={locale} className={inter.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          // Local search is how a hotel in Funchal finds a studio in Funchal.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: STUDIO.name,
              description: t("description"),
              url: SITE_URL,
              areaServed: ["Madeira", "Portugal", "Europe"],
              address: {
                "@type": "PostalAddress",
                addressLocality: STUDIO.city,
                addressRegion: STUDIO.region,
                addressCountry: STUDIO.country,
              },
            }),
          }}
        />
        <NextIntlClientProvider>
          <SmoothScroll>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
