import { useLocale, useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { pick, publishedCases } from "@/content/cases";

export default function Cases() {
  const t = useTranslations("cases");
  const locale = useLocale();
  const items = publishedCases();

  // Nothing real to show yet — better an absent section than an empty one.
  if (items.length === 0) return null;

  return (
    <section id="cases" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          note={t("note")}
        />

        <ul className="mt-[clamp(3rem,7vh,5rem)] grid gap-px overflow-hidden rounded-2xl bg-crust-lift md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.id}
              delay={i * 0.08}
              className="bg-crust p-8 md:p-10"
            >
              {item.draft ? (
                <span className="t-eyebrow mb-5 inline-block rounded border border-yolk/40 px-2 py-1 text-yolk">
                  draft · dev only
                </span>
              ) : null}

              <p className="t-num t-display text-yolk">{item.metric}</p>
              <p className="t-lead mt-3 text-crumb">
                {pick(item.metricLabel, locale)}
              </p>

              <dl className="mt-8 space-y-4 border-t border-crust-lift pt-6">
                <div>
                  <dt className="t-eyebrow text-ash-dim">
                    {pick(item.client, locale)}
                  </dt>
                  <dd className="t-body mt-2 text-ash">
                    {pick(item.problem, locale)}
                  </dd>
                </div>
                <dd className="t-body text-crumb">{pick(item.built, locale)}</dd>
              </dl>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
