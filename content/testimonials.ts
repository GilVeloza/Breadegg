import type { Locale } from "@/i18n/routing";
import { cases, type CaseStudy } from "@/content/cases";

type Localized = { en: string } & Partial<Record<Locale, string>>;

export type Testimonial = {
  id: string;
  name: string;
  /**
   * The projects they are talking about, as ids from content/cases. The name
   * under the quote and the link to their site both come from there, so a
   * client's site is written down once.
   */
  work: string[];
  /**
   * What the client said, written up from a conversation with them and
   * edited for each locale. `en` is the fallback for any locale left out.
   *
   * An entry without a quote is a placeholder: visible in `npm run dev`,
   * stripped from production builds, so an empty slot never ships.
   */
  quote?: Localized;
  /**
   * The client has read this wording, in every language it is given in, and
   * said yes. It is their name under it, so until then the quote is dev-only,
   * like a placeholder.
   */
  approved?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "andre-teixeira",
    name: "André Teixeira",
    work: ["madeira-dream-stays"],
    approved: true,
    quote: {
      en: "Breadegg helped us give Madeira Dream Stays its visual identity with our first logo. Years later it is still part of the brand, which says a lot about the value of the work.",
      pt: "A Breadegg ajudou-nos a dar forma visual à Madeira Dream Stays com o nosso primeiro logótipo. Anos depois, continua a fazer parte da identidade da marca, o que diz muito sobre o valor do trabalho.",
      es: "Breadegg nos ayudó a dar forma visual a Madeira Dream Stays con nuestro primer logotipo. Años después, sigue formando parte de la identidad de la marca, lo que dice mucho del valor de su trabajo.",
      de: "Breadegg hat Madeira Dream Stays mit unserem ersten Logo ein visuelles Gesicht gegeben. Jahre später gehört es immer noch zur Identität der Marke, und das sagt viel über den Wert dieser Arbeit.",
    },
  },
  {
    id: "nicola-pinto",
    name: "Nicola Pinto",
    work: ["travel-now-madeira"],
    approved: true,
    quote: {
      en: "Thanks to the booking and payment system Breadegg built, I've been able to take work off my plate, and my business has the online presence it needed.",
      pt: "Graças ao sistema de reservas e pagamentos que a Breadegg desenvolveu, consegui aliviar a minha carga de trabalho, e o meu negócio ganhou a presença digital de que precisava.",
      es: "Gracias al sistema de reservas y pagos que desarrolló Breadegg, pude aliviar mi carga de trabajo, y mi negocio ganó la presencia digital que necesitaba.",
      de: "Dank des Buchungs- und Zahlungssystems, das Breadegg entwickelt hat, konnte ich meine Arbeitslast verringern, und mein Unternehmen hat die digitale Präsenz bekommen, die es gebraucht hat.",
    },
  },
  {
    id: "martim-fernandes",
    name: "Martim Fernandes",
    work: ["politica-mais"],
    approved: true,
    quote: {
      en: "Breadegg was essential to all of Política+'s branding and to how it is positioned in the market. It wasn't easy: the project brings all of Portuguese politics into one place, so the colours, the logo and all of the marketing had to convey transparency. The result was excellent!",
      pt: "A Breadegg foi essencial em todo o branding do Política+ e no seu posicionamento no mercado. Não era tarefa fácil: o projeto reúne toda a política portuguesa num só lugar, e as cores, o logótipo e todo o marketing tinham de transmitir transparência. O resultado foi excelente!",
      es: "Breadegg fue clave en todo el branding de Política+ y en su posicionamiento en el mercado. No era fácil: el proyecto reúne toda la política portuguesa en un solo lugar, y los colores, el logo y todo el marketing tenían que transmitir transparencia. ¡El resultado fue excelente!",
      de: "Breadegg war entscheidend für das gesamte Branding von Política+ und seine Positionierung am Markt. Leicht war das nicht: Das Projekt bündelt die ganze portugiesische Politik an einem Ort, also mussten Farben, Logo und das gesamte Marketing Transparenz vermitteln. Das Ergebnis war hervorragend!",
    },
  },
  {
    id: "laura-kort",
    name: "Laura Kort",
    work: ["eeyesee", "art-4-everyone"],
    approved: true,
    quote: {
      en: "Breadegg came up with the idea of organising the event into editions, with a website that works like a gallery so each one is remembered. And with the EEYE.SEE shop, they helped me become independent in managing my own sales and products.",
      pt: "A Breadegg teve a ideia de organizar o evento por edições e de lhe dar um website que funciona como uma galeria, para recordar cada uma. Com a loja EEYE.SEE, ajudou-me a ser independente na gestão das minhas vendas e dos meus produtos.",
      es: "Breadegg tuvo la idea de organizar el evento por ediciones y de darle una web que funciona como una galería, para recordar cada una. Con la tienda de EEYE.SEE, me ayudó a ser independiente en la gestión de mis ventas y mis productos.",
      de: "Breadegg hatte die Idee, das Event in Ausgaben zu gliedern, mit einer Website, die wie eine Galerie funktioniert und an jede einzelne erinnert. Mit dem EEYE.SEE-Shop hat Breadegg mir geholfen, meine Verkäufe und Produkte selbstständig zu verwalten.",
    },
  },
];

/** The projects a testimonial is about, looked up in content/cases. */
export function workOf(testimonial: Testimonial): CaseStudy[] {
  return testimonial.work.map((id) => {
    const found = cases.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Testimonial "${testimonial.id}" names no case "${id}"`);
    }
    return found;
  });
}

export function publishedTestimonials(): Testimonial[] {
  return process.env.NODE_ENV === "development"
    ? testimonials
    : testimonials.filter((t) => t.quote && t.approved);
}
