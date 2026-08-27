import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { pick, publishedCases } from "@/content/cases";

export default function Cases() {
  const t = useTranslations("cases");
  const locale = useLocale();
  const items = publishedCases();

  // Nothing real to show yet, better an absent section than an empty one.
  if (items.length === 0) return null;

  return (
    <section id="cases" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          note={t("note")}
        />

        {/* One project should not sit next to an empty half of the grid, so the
            second column only exists once there is something to put in it. */}
        <ul
          className={`mt-[clamp(3rem,7vh,5rem)] grid gap-px overflow-hidden rounded-2xl bg-crust-lift ${
            items.length > 1 ? "md:grid-cols-2" : ""
          }`}
        >
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.id}
              delay={i * 0.08}
              className="flex flex-col bg-crust p-8 md:p-10"
            >
              {item.draft ? (
                <span className="t-eyebrow mb-5 inline-block w-fit rounded border border-yolk/40 px-2 py-1 text-yolk">
                  draft · dev only
                </span>
              ) : null}

              {item.logo ? (
                /* Each mark sits on the ground it was drawn for: navy on
                   cream, cream on grey. One shared plate colour would leave
                   half of them illegible. Fixed height, free width, so a row
                   of logos lines up whatever their proportions. */
                <div
                  className="mb-8 inline-flex h-16 w-fit items-center rounded-xl px-6"
                  style={{ backgroundColor: item.logo.plate }}
                >
                  <Image
                    src={item.logo.src}
                    alt={item.logo.alt}
                    width={item.logo.width}
                    height={item.logo.height}
                    className="h-8 w-auto"
                  />
                </div>
              ) : null}

              <p className="t-h2 text-crumb">{item.name}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {item.what.map((what) => (
                  <li
                    key={what.en}
                    className="t-eyebrow rounded-full border border-crust-lift px-3 py-1.5 text-ash"
                  >
                    {pick(what, locale)}
                  </li>
                ))}
              </ul>

              <p className="t-body mt-5 text-ash">{pick(item.body, locale)}</p>

              {item.href ? (
                /* mt-auto so the links line up along the bottom of a row of
                   cards, however much text each one carries above them. */
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-eyebrow mt-auto inline-flex w-fit items-center gap-2 pt-8 text-ash transition-colors duration-200 hover:text-crumb"
                >
                  {item.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
