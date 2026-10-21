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
    /**
     * A squarish mark rather than a wordmark. At a wordmark's height it reads
     * as a thumbnail, so the card sets it taller.
     */
    compact?: boolean;
    /**
     * How the logo strip draws it. "knockout" (the default) flattens the mark
     * to one warm white; "gray" keeps the original drawing and only drains the
     * colour, for marks that sit on a filled shape and would knock out to a
     * blank silhouette.
     */
    strip?: "knockout" | "gray";
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
  /**
   * A screenshot of the work itself, 1440×900, in /public/cases/shots. Only
   * for work we built: an identity-only job shows its mark instead, because a
   * screenshot of someone else's website would claim a site we didn't make.
   */
  shot?: string;
};

export function pick(value: Localized, locale: string): string {
  return value[locale as Locale] ?? value.en;
}

export const cases: CaseStudy[] = [
  {
    id: "rackers",
    shot: "/cases/shots/rackers.jpg",
    name: "Rackers",
    logo: {
      src: "/cases/rackers.png",
      width: 520,
      height: 88,
      alt: "Rackers",
      plate: "#0b1322",
    },
    what: [
      {
        en: "iOS and Apple Watch app",
        pt: "App para iOS e Apple Watch",
        es: "App para iOS y Apple Watch",
        de: "App für iOS und Apple Watch",
      },
      {
        en: "Website",
        pt: "Website",
        es: "Sitio web",
        de: "Website",
      },
    ],
    body: {
      en: "One app, six sports. A scoreboard for padel, tennis, pickleball, squash, table tennis and badminton, on iPhone and Apple Watch.",
      pt: "Uma app, seis desportos. Um marcador para padel, ténis, pickleball, squash, ténis de mesa e badminton, no iPhone e no Apple Watch.",
      es: "Una app, seis deportes. Un marcador para pádel, tenis, pickleball, squash, tenis de mesa y bádminton, en iPhone y Apple Watch.",
      de: "Eine App, sechs Sportarten. Eine Anzeigetafel für Padel, Tennis, Pickleball, Squash, Tischtennis und Badminton, auf iPhone und Apple Watch.",
    },
    href: "https://rackers.app",
  },
  {
    id: "politica-mais",
    shot: "/cases/shots/politica-mais.jpg",
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
  {
    id: "the-silicon-guys",
    shot: "/cases/shots/the-silicon-guys.jpg",
    name: "The Silicon Guys",
    logo: {
      src: "/cases/the-silicon-guys.png",
      width: 320,
      height: 320,
      alt: "The Silicon Guys",
      plate: "#fb651f",
      compact: true,
      // A faceted stone: knocked out, it would flatten to a blank pentagon.
      strip: "gray",
    },
    what: [
      {
        en: "Website",
        pt: "Website",
        es: "Sitio web",
        de: "Website",
      },
      {
        en: "AI news radar",
        pt: "Radar de notícias com IA",
        es: "Radar de noticias con IA",
        de: "KI-Nachrichtenradar",
      },
    ],
    body: {
      en: "A weekly podcast on technology and the economy. Its AI reads dozens of sources a day and sums up in Portuguese the news the episodes are built from.",
      pt: "Um podcast semanal de tecnologia e economia. A IA lê dezenas de fontes por dia e resume em português as notícias de onde saem os episódios.",
      es: "Un podcast semanal de tecnología y economía. Su IA lee decenas de fuentes al día y resume en portugués las noticias de las que salen los episodios.",
      de: "Ein wöchentlicher Podcast über Technologie und Wirtschaft. Eine KI liest täglich Dutzende Quellen und fasst auf Portugiesisch die Nachrichten zusammen, aus denen die Folgen entstehen.",
    },
    href: "https://thesiliconguys.com",
  },
  {
    id: "travel-now-madeira",
    shot: "/cases/shots/travel-now-madeira.jpg",
    name: "Travel Now Madeira",
    logo: {
      src: "/cases/travel-now-madeira.png",
      width: 600,
      height: 498,
      alt: "Travel Now Madeira",
      plate: "#0b0b0c",
      compact: true,
    },
    what: [
      {
        en: "Website",
        pt: "Website",
        es: "Sitio web",
        de: "Website",
      },
    ],
    body: {
      en: "A local travel agency running tours and airport transfers across Madeira.",
      pt: "Uma agência de viagens local, com tours e transfers do aeroporto por toda a Madeira.",
      es: "Una agencia de viajes local, con tours y traslados al aeropuerto por toda Madeira.",
      de: "Ein Reisebüro vor Ort, mit Touren und Flughafentransfers auf ganz Madeira.",
    },
    href: "https://www.travelnowmadeira.com",
  },
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
    id: "art-4-everyone",
    shot: "/cases/shots/art-4-everyone.jpg",
    name: "Art 4 Everyone",
    logo: {
      src: "/cases/art-4-everyone.png",
      width: 600,
      height: 352,
      alt: "Art 4 Everyone",
      plate: "#fbf0c9",
      compact: true,
      strip: "gray",
    },
    what: [
      {
        en: "Event website",
        pt: "Website do evento",
        es: "Web del evento",
        de: "Event-Website",
      },
    ],
    body: {
      en: "A free, open-air art gathering in Funchal, where anyone can turn up and make something.",
      pt: "Um encontro de arte gratuito e ao ar livre no Funchal, onde qualquer pessoa pode aparecer e criar.",
      es: "Un encuentro de arte gratuito y al aire libre en Funchal, donde cualquiera puede presentarse y crear algo.",
      de: "Ein kostenloses Kunsttreffen unter freiem Himmel in Funchal, zu dem jeder kommen und etwas gestalten kann.",
    },
    href: "https://www.art4everyone.world",
  },
  {
    id: "eeyesee",
    shot: "/cases/shots/eeyesee.jpg",
    name: "EEYE.SEE",
    logo: {
      src: "/cases/eeyesee.png",
      width: 600,
      height: 323,
      alt: "EEYE.SEE",
      plate: "#bf99e6",
      compact: true,
    },
    what: [
      {
        en: "Website and online shop",
        pt: "Website e loja online",
        es: "Web y tienda online",
        de: "Website und Onlineshop",
      },
    ],
    body: {
      en: "The studio of surreal artist Laura Michelle Kort. Originals, prints and commissions, all circling the motif of the eye.",
      pt: "O estúdio da artista surrealista Laura Michelle Kort. Originais, impressões e encomendas, sempre à volta do motivo do olho.",
      es: "El estudio de la artista surrealista Laura Michelle Kort. Originales, láminas y encargos, siempre en torno al motivo del ojo.",
      de: "Das Atelier der surrealistischen Künstlerin Laura Michelle Kort. Originale, Drucke und Auftragsarbeiten, alle rund um das Motiv des Auges.",
    },
    href: "https://eeyesee.com",
  },
];

export function publishedCases(): CaseStudy[] {
  return process.env.NODE_ENV === "development"
    ? cases
    : cases.filter((c) => !c.draft);
}
