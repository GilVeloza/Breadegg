import { Link } from "@/i18n/navigation";

/**
 * The one button, built from the wordmark: a small yolk, then the words. On
 * hover the yolk lights up (see .cta-yolk) — the orange stays light, never a
 * fill. `#anchor` hrefs stay plain links so they scroll the page they're on,
 * full URLs open in a new tab, and everything else goes through the
 * locale-aware Link.
 */
export default function CtaButton({
  href,
  children,
  variant = "primary",
  className = "",
  track,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  /** Analytics event sent on click (see components/Analytics). */
  track?: string;
}) {
  const look =
    variant === "primary"
      ? "border-yolk/35 bg-crust-lift hover:border-yolk/70"
      : "border-crust-lift hover:border-ash-dim";

  const classes = `group inline-flex w-fit items-center gap-3 rounded-xl border px-5 py-3 text-[0.9375rem] font-medium tracking-[-0.01em] text-crumb transition-colors duration-300 ${look} ${className}`;
  const inner = (
    <>
      <span aria-hidden="true" className="egg-yolk cta-yolk block size-2.5 shrink-0" />
      {children}
    </>
  );

  if (/^https?:\/\//.test(href)) {
    // Checkout and the booking page live on someone else's site.
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        data-track={track}
      >
        {inner}
      </a>
    );
  }

  return href.startsWith("#") ? (
    <a href={href} className={classes} data-track={track}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes} data-track={track}>
      {inner}
    </Link>
  );
}
