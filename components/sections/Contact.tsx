import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/ui/ContactForm";
import { CAL_LINK, CONTACT_EMAIL } from "@/lib/site";

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="relative px-6 py-[clamp(5rem,12vh,9rem)]">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <p className="t-eyebrow text-yolk">{t("eyebrow")}</p>
          <h2 className="t-h1 mt-4 text-crumb">{t("title")}</h2>
          <p className="t-lead mt-7 text-ash">{t("body")}</p>

          <div className="mt-10 flex flex-col items-start gap-3">
            {CAL_LINK ? (
              <a
                href={`https://cal.com/${CAL_LINK}`}
                target="_blank"
                rel="noreferrer"
                className="t-lead text-crumb underline decoration-crust-lift underline-offset-[6px] transition-colors duration-200 hover:decoration-yolk"
              >
                {t("book")}
              </a>
            ) : null}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="t-lead text-yolk underline decoration-yolk/30 underline-offset-[6px] transition-colors duration-200 hover:decoration-yolk"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
