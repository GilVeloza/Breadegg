import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

type Item = { title: string; body: string };

/**
 * What goes in the contract. Written for the reader who has been burned
 * before: each line is a promise they can hold us to, not a value.
 */
export default function Promises() {
  const t = useTranslations("promises");
  const items = t.raw("items") as Item[];

  return (
    <section
      id="promises"
      className="relative px-6 py-[clamp(5rem,12vh,9rem)]"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <ul className="mt-12 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(i % 3) * 0.08}
              className="border-t border-crust-lift py-7"
            >
              <h3 className="t-h3 text-crumb">{item.title}</h3>
              <p className="t-body mt-3 text-ash">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
