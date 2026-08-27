import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

type Link = { place: string; role: string };

/** The quiet section. Island → world, as one line of thought. */
export default function Madeira() {
  const t = useTranslations("madeira");
  const chain = t.raw("chain") as Link[];

  return (
    <section className="relative overflow-hidden px-6 py-[clamp(6rem,16vh,11rem)]">
      {/* A low warm horizon behind the type — the island at dusk. */}
      <div
        aria-hidden="true"
        className="egg-glow pointer-events-none absolute -bottom-1/2 left-1/2 h-[70vh] w-[130vw] -translate-x-1/2 rounded-[50%] opacity-60"
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="max-w-3xl">
          <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
          <h2 className="t-h1 mt-4 text-crumb">{t("title")}</h2>
          <p className="t-lead mt-7 text-ash">{t("body")}</p>
        </Reveal>

        <Reveal delay={0.15} className="mt-[clamp(3rem,8vh,5rem)]">
          <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            {chain.map((link, i) => (
              <li key={link.place} className="flex items-center gap-8">
                <div>
                  <p className="t-h2 text-crumb">{link.place}</p>
                  <p className="t-eyebrow mt-2 text-ash-dim">{link.role}</p>
                </div>
                {i < chain.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden h-px w-10 bg-crust-lift sm:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="t-lead mt-[clamp(3rem,8vh,5rem)] max-w-2xl text-crumb">
            {t("close")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
