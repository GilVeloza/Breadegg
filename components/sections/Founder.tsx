import Image from "next/image";
import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import { FOUNDER } from "@/lib/site";

/**
 * The person behind the studio. A small studio is bought on who you will be
 * talking to, so the face comes first and the name is set as large as any
 * section title. The portrait was shot on black, which sits on the crust
 * without a frame.
 */
export default function Founder() {
  const t = useTranslations("founder");

  return (
    <section id="founder" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl">
            <Image
              src={FOUNDER.photo}
              alt={FOUNDER.name}
              fill
              sizes="(min-width: 768px) 24rem, 90vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
          <h2 className="t-h1 mt-4 text-crumb">{FOUNDER.name}</h2>
          <p className="t-eyebrow mt-4 text-ash-dim">{t("role")}</p>
          <p className="t-lead mt-8 text-ash">{t("body")}</p>
          <a
            href={FOUNDER.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="t-lead mt-7 inline-flex items-center gap-2 text-crumb underline decoration-crust-lift underline-offset-[6px] transition-colors duration-200 hover:decoration-yolk"
          >
            {t("linkedin")}
            <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
