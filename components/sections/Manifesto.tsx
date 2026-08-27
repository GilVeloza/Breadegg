import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

/**
 * The essence. The negative line recedes into ash, the positive one lands in
 * full crumb — the hierarchy carries the argument before anyone reads it.
 */
export default function Manifesto() {
  const t = useTranslations("manifesto");

  return (
    <section
      id="manifesto"
      className="relative px-6 py-[clamp(6rem,16vh,11rem)]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="t-h1 text-ash-dim">{t("line1")}</p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="t-h1 mt-1 text-crumb">{t("line2")}</p>
        </Reveal>

        <div className="mt-[clamp(3rem,8vh,6rem)] grid gap-8 md:grid-cols-12">
          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <p className="t-lead text-ash">{t("body")}</p>
            <p className="t-lead mt-7 text-crumb">{t("close")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
