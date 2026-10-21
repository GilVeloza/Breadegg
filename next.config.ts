import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Tailwind keeps the stylesheet small, so it rides inside the HTML: no
    // render-blocking request before the headline can paint, which is most
    // of what a first visit on a phone waits for.
    inlineCss: true,
  },
  images: {
    // A year. Images here change by getting a new file name, never in place,
    // so a long cache costs nothing and saves every repeat visit the bytes.
    minimumCacheTTL: 31_536_000,
  },
};

export default withNextIntl(nextConfig);
