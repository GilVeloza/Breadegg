import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  // `icon` is Next's generated tab icon: it lives at the root, not under a
  // locale, and has no extension to be caught by the rule below — without it
  // listed here the middleware rewrites /icon to /en/icon and the tab 404s.
  matcher: "/((?!api|icon|_next|_vercel|.*\\..*).*)",
};
