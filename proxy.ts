import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // One address for the site: www.breadegg.com answers with a permanent
  // redirect to the same path on breadegg.com, so search engines index a
  // single site instead of two copies of it.
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = host.slice(4);
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  // `icon` is Next's generated tab icon: it lives at the root, not under a
  // locale, and has no extension to be caught by the rule below — without it
  // listed here the middleware rewrites /icon to /en/icon and the tab 404s.
  // The share images live under every locale, English included, so the
  // "as-needed" prefix rule would bounce /en/opengraph-image through a redirect
  // that some link previews don't follow.
  matcher: "/((?!api|icon|_next|_vercel|.*opengraph-image|.*\\..*).*)",
};
