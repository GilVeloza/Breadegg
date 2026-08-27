import type { Locale } from "@/i18n/routing";

/**
 * The work, one entry per project.
 *
 * This used to be metric-led: a big number, and a line saying what the number
 * measured. That framing only holds for engagements that move a number someone
 * is willing to publish, which an identity job usually is not, so the section
 * shows the projects themselves instead.
 *
 * Anything marked `draft: true` is visible in `npm run dev` only. It is
 * stripped from production builds, so a placeholder can never ship as a claim
 * about a real client. Delete the flag when the entry is real and cleared.
 */

type Localized = { en: string } & Partial<Record<Locale, string>>;

export type CaseStudy = {
  id: string;
  draft?: boolean;
  /** The name as the client writes it. Locale-independent. */
  name: string;
  /**
   * The client's own mark. Client logos are drawn for light backgrounds, so
   * the card sets it on a plate rather than dropping it onto the crust.
   */
  logo?: {
    src: string;
    width: number;
    height: number;
    alt: string;
    /** The ground this particular mark was drawn for. */
    plate: string;
  };
  /**
   * What we made, one short label per discipline. A list rather than a
   * sentence: an identity job is one label, a product build is four, and a
   * sentence that stretches to cover both ends up covering neither.
   */
  what: Localized[];
  /** Who they are, in one line. */
  body: Localized;
  /** The live thing, when there is one to point at. */
  href?: string;
};

export function pick(value: Localized, locale: string): string {
  return value[locale as Locale] ?? value.en;
}

export const cases: CaseStudy[] = [
  {
    id: "madeira-dream-stays",
    name: "Madeira Dream Stays",
    logo: {
      src: "/cases/madeira-dream-stays.webp",
      width: 300,
      height: 100,
      alt: "Madeira Dream Stays",
      plate: "#f7f1e8",
    },
    what: [
      {
        en: "Brand identity and logo",
        pt: "Identidade de marca e logótipo",
        es: "Identidad de marca y logo",
        de: "Markenidentität und Logo",
      },
    ],
    body: {
      en: "Luxury villas and property management in Madeira.",
      pt: "Villas de luxo e gestão de alojamento na Madeira.",
      es: "Villas de lujo y gestión de alojamiento en Madeira.",
      de: "Luxusvillen und Objektverwaltung auf Madeira.",
    },
    href: "https://www.madeiradreamstays.com",
  },
  {
    id: "politica-mais",
    name: "Política+",
    logo: {
      src: "/cases/politica-mais.png",
      width: 900,
      height: 327,
      alt: "Política+",
      plate: "#f7f1e8",
    },
    what: [
      {
        en: "Brand identity and logo",
        pt: "Identidade de marca e logótipo",
        es: "Identidad de marca y logo",
        de: "Markenidentität und Logo",
      },
      {
        en: "Product design and monetisation",
        pt: "Design de produto e monetização",
        es: "Diseño de producto y monetización",
        de: "Produktdesign und Monetarisierung",
      },
    ],
    body: {
      en: "Portuguese politics in one place. Bills, votes, debates and elections, straight from the official sources, on iOS and Android.",
      pt: "A política portuguesa num só lugar. Iniciativas, votações, debates e eleições, direto das fontes oficiais, em iOS e Android.",
      es: "La política portuguesa en un solo lugar. Iniciativas, votaciones, debates y elecciones, directo de las fuentes oficiales, en iOS y Android.",
      de: "Portugals Politik an einem Ort. Initiativen, Abstimmungen, Debatten und Wahlen, direkt aus den offiziellen Quellen, auf iOS und Android.",
    },
    href: "https://politicamais.pt",
  },
];

export function publishedCases(): CaseStudy[] {
  return process.env.NODE_ENV === "development"
    ? cases
    : cases.filter((c) => !c.draft);
}
