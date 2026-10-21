import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import LogoStrip from "@/components/sections/LogoStrip";
import Manifesto from "@/components/sections/Manifesto";
import Capabilities from "@/components/sections/Capabilities";
import Cases from "@/components/sections/Cases";
import Testimonials from "@/components/sections/Testimonials";
import Fit from "@/components/sections/Fit";
import Plans from "@/components/sections/Plans";
import Promises from "@/components/sections/Promises";
import Founder from "@/components/sections/Founder";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const faq = await getTranslations({ locale, namespace: "faq" });

  return (
    <>
      <Hero />
      <LogoStrip />
      <Manifesto />
      <Capabilities />
      <Cases />
      <Testimonials />
      <Fit />
      <Plans />
      <Promises />
      <Founder />
      <Faq
        eyebrow={faq("eyebrow")}
        title={faq("title")}
        items={faq.raw("items") as { q: string; a: string }[]}
      />
      <Contact />
    </>
  );
}
