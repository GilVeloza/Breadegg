import Image from "next/image";
import { pick, type CaseStudy } from "@/content/cases";

/**
 * The inside of a work card, shared by the home carousel and the service
 * pages. The picture is the work: a screenshot when we built the thing, the
 * client's mark on its own ground when the job was the identity.
 */
export default function CaseCard({
  item,
  locale,
}: {
  item: CaseStudy;
  locale: string;
}) {
  return (
    <>
      {item.draft ? (
        <span className="t-eyebrow mb-5 inline-block w-fit rounded border border-yolk/40 px-2 py-1 text-yolk">
          draft · dev only
        </span>
      ) : null}

      <div
        className="relative mb-8 aspect-[16/10] w-full overflow-hidden rounded-xl border border-crust-lift"
        style={
          !item.shot && item.logo
            ? { backgroundColor: item.logo.plate }
            : undefined
        }
      >
        {item.shot ? (
          <Image
            src={item.shot}
            alt={`${item.name}: ${item.what.map((w) => pick(w, locale)).join(", ")}`}
            fill
            sizes="(min-width: 768px) 34rem, 85vw"
            className="object-cover object-top"
          />
        ) : item.logo ? (
          <div className="absolute inset-0 grid place-items-center p-10">
            <Image
              src={item.logo.src}
              alt={item.logo.alt}
              width={item.logo.width}
              height={item.logo.height}
              className={`${item.logo.compact ? "h-28" : "h-14"} w-auto`}
            />
          </div>
        ) : null}
      </div>

      <h3 className="t-h2 text-crumb">{item.name}</h3>

      <ul className="mt-4 flex flex-wrap gap-2">
        {item.what.map((what) => (
          <li
            key={what.en}
            className="t-eyebrow rounded-full border border-crust-lift px-3 py-1.5 text-ash"
          >
            {pick(what, locale)}
          </li>
        ))}
      </ul>

      <p className="t-body mt-5 text-ash">{pick(item.body, locale)}</p>

      {item.href ? (
        /* mt-auto so the links line up along the bottom of a row of cards,
           however much text each one carries above them. */
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="t-eyebrow mt-auto inline-flex w-fit items-center gap-2 pt-8 text-ash transition-colors duration-200 hover:text-crumb"
        >
          {item.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </>
  );
}
