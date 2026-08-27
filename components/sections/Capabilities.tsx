import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";

function Row({ items, dir }: { items: string[]; dir: "left" | "right" }) {
  return (
    <div className="marquee-mask overflow-hidden">
      <ul className={`marquee-track marquee-${dir} gap-3 py-1.5`}>
        {[0, 1].map((copy) => (
          <li
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className={`flex gap-3 ${copy === 1 ? "marquee-dupe" : ""}`}
          >
            {items.map((item) => (
              <span
                key={item}
                className="t-body whitespace-nowrap rounded-full border border-crust-lift px-5 py-2.5 text-ash"
              >
                {item}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The range, without turning into a menu of thirty services. Two rows drifting
 * against each other; a static wrapped grid when motion is reduced.
 */
export default function Capabilities() {
  const t = useTranslations("capabilities");
  const items = t.raw("items") as string[];
  const half = Math.ceil(items.length / 2);

  return (
    <section className="relative py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="mt-12 flex flex-col gap-3">
        <Row items={items.slice(0, half)} dir="left" />
        <Row items={items.slice(half)} dir="right" />
      </div>
    </section>
  );
}
