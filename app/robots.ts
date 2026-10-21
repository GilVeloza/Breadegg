import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The crawlers behind AI answers (ChatGPT, Claude, Perplexity, Gemini, Apple).
// Already covered by "*", but named so that nobody "tightens" robots later and
// quietly takes the studio out of AI search.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
