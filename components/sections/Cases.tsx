import { useLocale, useTranslations } from "next-intl";
import Carousel from "@/components/ui/Carousel";
import CaseCard from "@/components/ui/CaseCard";
import CtaButton from "@/components/ui/CtaButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { publishedCases } from "@/content/cases";

export default function Cases() {
  const t = useTranslations("cases");
  const cta = useTranslations("cta");
  const locale = useLocale();
  const items = publishedCases();

  // Nothing real to show yet, better an absent section than an empty one.
  if (items.length === 0) return null;

  return (
    <section id="cases" className="relative py-[clamp(5rem,12vh,9rem)]">
      {/* A carousel rather than a grid: every project added to a grid makes
          the page longer, a carousel just gets one card wider. */}
      <Carousel
        header={
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            note={t("note")}
          />
        }
        label={t("eyebrow")}
        prevLabel={t("prev")}
        nextLabel={t("next")}
        pauseLabel={t("pause")}
        playLabel={t("play")}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-crust-lift bg-crust p-6 md:w-[calc(50%-0.5rem)] md:p-8"
          >
            <CaseCard item={item} locale={locale} />
          </li>
        ))}
      </Carousel>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <CtaButton href="#contact">{cta("freeCall")}</CtaButton>
      </div>
    </section>
  );
}
