import { useLocale, useTranslations } from "next-intl";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { Link } from "@/i18n/navigation";
import type { ServiceSlug } from "@/content/services";
import {
  SUBSCRIPTION,
  currentPrice,
  formatPrice,
  isFounding,
  seatsOpen,
} from "@/content/subscription";
import { SUBSCRIBE_URL } from "@/lib/site";

type Step = { name: string; label: string; body: string };
type Perk = { title: string; body: string };
type Project = {
  name: string;
  time: string;
  price: string;
  body: string;
  includes: string[];
  service: ServiceSlug | null;
};

/**
 * How it works, in three steps. The subscription's by default; `project` is
 * the way into a fixed-price build (call, Diagnosis, project), which is what
 * the app and custom AI pages show.
 */
export function Steps({
  kind = "subscription",
}: {
  kind?: "subscription" | "project";
}) {
  const t = useTranslations("plans");
  const steps = t.raw(kind === "project" ? "projectSteps" : "steps") as Step[];

  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.name}
          delay={i * 0.08}
          className="flex flex-col rounded-2xl border border-crust-lift p-8"
        >
          <p className="t-eyebrow t-num text-ash-dim">
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className="t-h3 mt-4 text-crumb">{step.name}</h3>
          <p className="t-eyebrow mt-3 text-yolk">{step.label}</p>
          <p className="t-body mt-5 text-ash">{step.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

function Bullets({ lines, columns = false }: { lines: string[]; columns?: boolean }) {
  return (
    <ul
      className={`grid gap-x-8 gap-y-2.5 ${columns ? "sm:grid-cols-2" : ""}`}
    >
      {lines.map((line) => (
        <li key={line} className="t-body flex gap-3 text-crumb">
          <span
            aria-hidden="true"
            className="mt-[0.6em] block size-1.5 shrink-0 rounded-full bg-yolk"
          />
          {line}
        </li>
      ))}
    </ul>
  );
}

/**
 * One offer up front, the way Designjoy sells: a single subscription with its
 * price on the page, and the two things that take the risk out of it next to
 * it. Work too big for a queue, a native app or a custom AI build, sits below
 * as fixed-price projects; once one launches, it carries on in the
 * subscription.
 */
export default function Plans() {
  const t = useTranslations("plans");
  const cta = useTranslations("cta");
  const locale = useLocale();
  const includes = t.raw("subscription.includes") as string[];
  const perks = t.raw("perks") as Perk[];
  const projects = t.raw("projects.items") as Project[];

  const open = seatsOpen();
  const founding = isFounding();
  // With no payment link yet, or no seat left, starting means talking first.
  const startHref = open > 0 && SUBSCRIBE_URL ? SUBSCRIBE_URL : "#contact";
  // The booking calendar is the first tab of the contact section.
  const callHref = "#contact";

  return (
    <section id="plans" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          note={t("note")}
        />

        <div className="mt-12">
          <Steps />
        </div>

        <div className="mt-[clamp(3rem,8vh,5rem)] grid gap-4 lg:grid-cols-12">
          <Reveal className="flex flex-col rounded-2xl border border-yolk/30 bg-crust-deep/60 p-8 md:p-12 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="t-eyebrow text-yolk">{t("subscription.name")}</p>
              <p className="t-eyebrow rounded-full border border-crust-lift px-3 py-1.5 text-ash">
                {open > 0
                  ? t("subscription.seats", { open, total: SUBSCRIPTION.seats })
                  : t("subscription.full")}
              </p>
            </div>

            <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="t-h1 t-num text-crumb">
                {formatPrice(currentPrice(), locale)}
              </span>
              <span className="t-lead text-ash">{t("subscription.period")}</span>
              {founding ? (
                <span className="t-lead t-num text-ash-dim line-through">
                  {formatPrice(SUBSCRIPTION.price, locale)}
                </span>
              ) : null}
            </p>
            <p className="t-body mt-3 text-ash-dim">
              {founding
                ? `${t("subscription.founding", { seats: SUBSCRIPTION.foundingSeats })} `
                : null}
              {t("subscription.vat")}
            </p>

            <div className="mt-8 border-t border-crust-lift pt-8">
              <Bullets lines={includes} columns />
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-4 pt-10">
              <CtaButton href={startHref} track="start_subscription">
                {open > 0 ? t("subscription.start") : t("subscription.waitlist")}
              </CtaButton>
              <CtaButton href={callHref} variant="ghost" track="book_call">
                {t("subscription.call")}
              </CtaButton>
            </div>
          </Reveal>

          <div className="grid gap-4 lg:col-span-4">
            {perks.map((perk, i) => (
              <Reveal
                key={perk.title}
                delay={0.08 + i * 0.08}
                className="flex flex-col rounded-2xl border border-crust-lift p-8"
              >
                <h3 className="t-h3 text-crumb">{perk.title}</h3>
                <p className="t-body mt-3 text-ash">{perk.body}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-[clamp(4rem,10vh,6rem)] max-w-3xl">
          <h3 className="t-h2 text-crumb">{t("projects.title")}</h3>
          <p className="t-lead mt-5 text-ash">{t("projects.note")}</p>
        </Reveal>

        <ul
          className={`mt-10 grid gap-4 ${projects.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {projects.map((project, i) => (
            <Reveal
              as="li"
              key={project.name}
              delay={i * 0.08}
              className="flex flex-col rounded-2xl border border-crust-lift bg-crust-deep/40 p-8"
            >
              <p className="t-eyebrow text-ash-dim">{project.time}</p>
              <h4 className="t-h3 mt-3 text-crumb">{project.name}</h4>
              <p className="t-lead t-num mt-2 text-yolk">{project.price}</p>
              <p className="t-body mt-4 text-ash">{project.body}</p>

              <div className="mt-6 border-t border-crust-lift pt-6">
                <Bullets lines={project.includes} />
              </div>

              {/* mt-auto: the buttons line up along the bottom of a row. */}
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
                <CtaButton href="#contact">{cta("getStarted")}</CtaButton>
                {project.service ? (
                  <Link
                    href={`/services/${project.service}`}
                    className="t-body text-ash underline decoration-crust-lift underline-offset-[5px] transition-colors duration-200 hover:text-crumb hover:decoration-yolk"
                  >
                    {cta("learnMore")}
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>

        <p className="t-body mt-8 max-w-3xl text-ash-dim">{t("terms")}</p>
      </div>
    </section>
  );
}
