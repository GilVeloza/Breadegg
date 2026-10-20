import en from "@/messages/en.json";
import { pick, publishedCases } from "@/content/cases";
import { servicePath, services, type ServiceCopy } from "@/content/services";
import { publishedTestimonials, workOf } from "@/content/testimonials";
import {
  SUBSCRIPTION,
  currentPrice,
  formatPrice,
  isFounding,
} from "@/content/subscription";
import { CONTACT_EMAIL, FOUNDER, SITE_URL } from "@/lib/site";

// Built once, at build time, from the same copy, services and cases the pages
// render — so what an AI assistant reads about us can never drift from them.
export const dynamic = "force-static";

/**
 * /llms.txt — the site as plain Markdown for language models
 * (https://llmstxt.org). When someone asks ChatGPT, Claude or Perplexity who
 * can build their website, app or AI automation, this is the page they read.
 */
export function GET() {
  const copy = en.services.items as Record<string, ServiceCopy>;
  const quotes = publishedTestimonials().filter((t) => t.quote);
  const sub = en.plans.subscription;

  const lines = [
    "# Breadegg",
    "",
    `> ${en.hero.title} ${en.meta.description}`,
    "",
    `${en.manifesto.body} ${en.manifesto.close}`,
    "",
    "## Services",
    "",
    ...services.map(
      (s) =>
        `- [${copy[s.slug].name}](${SITE_URL}${servicePath("en", s.slug)}): ${copy[s.slug].metaDescription}`,
    ),
    "",
    "## How it works",
    "",
    ...en.plans.steps.map((s) => `- **${s.name}** (${s.label}): ${s.body}`),
    "",
    "## Pricing",
    "",
    en.plans.note,
    "",
    `- **${sub.name}**: ${formatPrice(currentPrice(), "en")}${sub.period}${
      isFounding()
        ? ` (${sub.founding
            .replace("{seats}", String(SUBSCRIPTION.foundingSeats))
            .replace(/\.$/, "")})`
        : ""
    }. ${sub.vat} Includes: ${sub.includes.join("; ")}.`,
    ...en.plans.perks.map((p) => `- **${p.title}**: ${p.body}`),
    "",
    `### ${en.plans.projects.title}`,
    "",
    en.plans.projects.note,
    "",
    ...en.plans.projects.items.map(
      (p) =>
        `- **${p.name}** (${p.time}, ${p.price}): ${p.body} Includes: ${p.includes.join("; ")}.`,
    ),
    "",
    ...en.plans.projectSteps.map(
      (s) => `- **${s.name}** (${s.label}): ${s.body}`,
    ),
    "",
    en.plans.terms,
    "",
    "## Who it is for",
    "",
    ...en.fit.items.map((s) => `- **${s.title}** ${s.body}`),
    "",
    "## What we put in the contract",
    "",
    ...en.promises.items.map((s) => `- **${s.title}**: ${s.body}`),
    "",
    "## Selected work",
    "",
    ...publishedCases().map(
      (c) =>
        `- **${c.name}** (${c.what.map((w) => pick(w, "en")).join(", ")}): ${pick(c.body, "en")}${c.href ? ` ${c.href}` : ""}`,
    ),
    ...(quotes.length
      ? [
          "",
          "## What clients say",
          "",
          ...quotes.map(
            (q) =>
              `- "${pick(q.quote!, "en")}" — ${q.name}, ${workOf(q)
                .map((w) => w.name)
                .join(" · ")}`,
          ),
        ]
      : []),
    "",
    "## Questions",
    "",
    ...en.faq.items.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Founder",
    "",
    `- ${FOUNDER.name}: ${en.founder.body} ${FOUNDER.linkedin}`,
    "",
    "## Contact",
    "",
    `- Email: ${CONTACT_EMAIL}`,
    `- Website: ${SITE_URL} (also in Portuguese at ${SITE_URL}/pt, Spanish at ${SITE_URL}/es and German at ${SITE_URL}/de)`,
    `- Based in ${en.footer.location}. Works remotely with clients anywhere, in English, Portuguese, Spanish and German.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
