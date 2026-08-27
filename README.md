# BreadEgg

The studio site. Next.js 16 · Tailwind v4 · react-three-fiber · Lenis · next-intl.

See [PLAN.md](PLAN.md) for the design and the milestones.

## Run

```sh
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

Locales: `/` (en) · `/pt` · `/es` · `/de`.

## Where things are

| Path | What |
|---|---|
| `messages/*.json` | **All copy.** Change text here, never in components. |
| `app/globals.css` | Brand tokens (`@theme`) and the iOS type scale. |
| `components/egg/` | The egg — CSS version and, from M2, the WebGL one. |
| `components/sections/` | One file per section of the page. |
| `i18n/` | Routing and request config for the four locales. |
| `lib/site.ts` | Env-driven values (URL, email, Cal link). |

## Before shipping a section

Walk it in **German** — it runs ~30% longer than English and is what
breaks headlines first. Then check it with `prefers-reduced-motion` on.
