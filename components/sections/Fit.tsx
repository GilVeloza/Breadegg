import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

type Item = { title: string; body: string };

/**
 * Who this is for, said as the three situations people are actually in when
 * they find us — not as sectors. Each card is a sentence the reader can
 * recognise themselves in, then what we do about it.
 */
export default function Fit() {
  const t = useTranslations("fit");
  const items = t.raw("items") as Item[];

  return (
    <section id="fit" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={i * 0.08}
              className="flex flex-col rounded-2xl border border-crust-lift bg-crust p-8 md:p-10"
            >
              <h3 className="t-h3 text-crumb">{item.title}</h3>
              <p className="t-body mt-5 text-ash">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
