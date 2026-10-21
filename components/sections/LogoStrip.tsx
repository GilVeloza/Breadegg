import Image from "next/image";
import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";
import { publishedCases } from "@/content/cases";

// One set of six marks is narrower than the column, so each half of the loop
// carries the set twice; otherwise the end of the track would slide into view.
const SETS_PER_HALF = 2;

/**
 * The clients, drifting past in one quiet line under the hero. Most marks are
 * knocked out to the same warm white so different brand colours read as one
 * row, not as stickers; a mark drawn on a filled shape keeps its drawing in
 * grey instead (see `strip` in content/cases). The full-colour marks live on
 * the cards further down. Hovering stops the drift; with reduced motion it is
 * one static, wrapped row.
 */
export default function LogoStrip() {
  const t = useTranslations("strip");
  const items = publishedCases().filter((c) => c.logo);

  if (items.length === 0) return null;

  const sets = Array.from({ length: SETS_PER_HALF * 2 }, (_, i) => i);

  return (
    <section
      aria-label={t("label")}
      className="relative px-6 pb-[clamp(3rem,8vh,5rem)]"
    >
      <Reveal className="mx-auto max-w-6xl">
        <p className="t-eyebrow text-center text-ash-dim">{t("label")}</p>
        <div className="marquee-mask marquee-pause mt-8 overflow-hidden">
          <div className="marquee-track marquee-left marquee-slow">
            {sets.map((set) => (
              <ul
                key={set}
                aria-hidden={set > 0 || undefined}
                className={`logo-set flex shrink-0 items-center gap-x-14 pr-14 sm:gap-x-16 sm:pr-16 ${set > 0 ? "marquee-dupe" : ""}`}
              >
                {items.map((item) =>
                  item.logo ? (
                    <li key={item.id} className="shrink-0">
                      <Image
                        src={item.logo.src}
                        alt={set > 0 ? "" : item.logo.alt}
                        width={item.logo.width}
                        height={item.logo.height}
                        className={`${item.logo.compact ? "h-11" : "h-6"} w-auto transition-opacity duration-200 hover:opacity-100 ${
                          item.logo.strip === "gray"
                            ? "opacity-70 brightness-125 grayscale"
                            : "opacity-60 brightness-0 invert-[0.94]"
                        }`}
                      />
                    </li>
                  ) : null,
                )}
              </ul>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
