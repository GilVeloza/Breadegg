import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

type Item = { q: string; a: string };

/**
 * Questions and answers, as a plain <details> list — it opens without
 * JavaScript and every answer is in the HTML, which is what search engines
 * and AI assistants read. The same items go out as FAQPage structured data,
 * so the visible page and the schema can never disagree.
 */
export default function Faq({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Item[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section id="faq" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <SectionHeader eyebrow={eyebrow} title={title} />
        </div>

        <Reveal className="md:col-span-8">
          <ul className="border-t border-crust-lift">
            {items.map((item) => (
              <li key={item.q} className="border-b border-crust-lift">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="t-h3 text-crumb">{item.q}</h3>
                    <span
                      aria-hidden="true"
                      className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-crust-lift text-ash transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="t-body max-w-2xl pb-7 text-ash">{item.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
