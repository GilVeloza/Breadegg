import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { pick } from "@/content/cases";
import { publishedTestimonials, workOf } from "@/content/testimonials";

/**
 * The clients, in their own words. Only quotes the client has approved ship:
 * an entry still waiting for its words shows up in dev as a dashed slot, one
 * waiting for its sign-off carries a draft badge, and neither appears in
 * production. With nothing approved yet, the section isn't there.
 */
export default function Testimonials() {
  const t = useTranslations("testimonials");
  const cta = useTranslations("cta");
  const locale = useLocale();
  const items = publishedTestimonials();

  if (items.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative px-6 py-[clamp(5rem,12vh,9rem)]"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item.id}
              delay={(i % 2) * 0.08}
              className={`flex flex-col rounded-2xl p-8 md:p-10 ${
                item.quote
                  ? "border border-crust-lift bg-crust-deep/40"
                  : "border border-dashed border-yolk/40"
              }`}
            >
              {item.quote && !item.approved ? (
                <span className="t-eyebrow mb-5 inline-block w-fit rounded border border-yolk/40 px-2 py-1 text-yolk">
                  draft · dev only
                </span>
              ) : null}
              {item.quote ? (
                <blockquote className="t-lead text-crumb">
                  <span aria-hidden="true" className="text-yolk">
                    “
                  </span>
                  {pick(item.quote, locale)}
                  <span aria-hidden="true" className="text-yolk">
                    ”
                  </span>
                </blockquote>
              ) : (
                <p className="t-body text-yolk">
                  draft · dev only — {t("pending", { name: item.name })}
                </p>
              )}
              <p className="mt-auto pt-8 text-crumb">
                <span className="font-semibold">{item.name}</span>
                <span className="t-eyebrow mt-1 block text-ash-dim">
                  {workOf(item).map((work, j) => (
                    <Fragment key={work.id}>
                      {j > 0 ? " · " : null}
                      {work.href ? (
                        <a
                          href={work.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors duration-200 hover:text-crumb"
                        >
                          {work.name}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : (
                        work.name
                      )}
                    </Fragment>
                  ))}
                </span>
              </p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10">
          <CtaButton href="#contact">{cta("getStarted")}</CtaButton>
        </div>
      </div>
    </section>
  );
}
