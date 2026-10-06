"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Reveal from "./Reveal";

/** How long each card holds before the row moves on. */
const HOLD_MS = 5000;

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReduce(onChange: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const subscribeNothing = () => () => {};

/**
 * A row that moves on by itself and loops. Native scrolling and CSS snap
 * still do the moving, so a swipe, a trackpad and a tab key all work with
 * nothing reimplemented; the timer and the arrows only ask it to scroll.
 *
 * The loop is a copy of the cards on either side. Once the row comes to rest
 * on a copy it is moved, instantly, to the same card in the real set, which
 * looks identical, so the row never visibly rewinds.
 *
 * The track runs out to both edges of the window rather than stopping at the
 * content column, so on a wide screen the neighbours are already peeking in.
 * The card at rest still lines up with the header above it.
 */
export default function Carousel({
  header,
  label,
  prevLabel,
  nextLabel,
  pauseLabel,
  playLabel,
  children,
}: {
  header: React.ReactNode;
  /** What the region is, for screen readers. */
  label: string;
  prevLabel: string;
  nextLabel: string;
  pauseLabel: string;
  playLabel: string;
  /** The cards, each an <li>. */
  children: React.ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const count = items.length;
  const loops = count > 1;

  // The copies only exist once React runs in the browser: the server HTML,
  // and anyone reading without JavaScript, gets every project exactly once.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const cloned = loops && hydrated;
  // Assumed on the server, so nothing starts moving before the visitor's
  // preference is known.
  const reduce = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => true,
  );

  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [stopped, setStopped] = useState(false);
  const touchingRef = useRef(false);

  const autoplay = cloned && !reduce;
  // Anyone reading, pointing or swiping holds it still, and so does being
  // off screen: a visitor should arrive at the first project, not the third.
  const playing =
    autoplay && !stopped && inView && !hovered && !focused && !touching;

  /** Distance from one card to the next, gap included. */
  const step = useCallback(() => {
    const el = track.current;
    if (!el || el.children.length < 2) return 0;
    const a = el.children[0] as HTMLElement;
    const b = el.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  }, []);

  // With the copies in, start on the first real card. A layout effect, so
  // the jump happens before the browser paints anything.
  useLayoutEffect(() => {
    const el = track.current;
    if (el && cloned) el.scrollLeft = count * step();
  }, [cloned, count, step]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let rest: number | undefined;

    const settle = () => {
      const s = step();
      if (!s) return;
      if (touchingRef.current) {
        rest = window.setTimeout(settle, 150);
        return;
      }
      const at = Math.round(el.scrollLeft / s);
      if (at < count) el.scrollLeft += count * s;
      else if (at >= 2 * count) el.scrollLeft -= count * s;
    };

    const onScroll = () => {
      const s = step();
      if (!s) return;
      const at = Math.round(el.scrollLeft / s);
      setIndex(((at % count) + count) % count);
      if (!cloned) return;
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 150);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(rest);
    };
  }, [cloned, count, step]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => {
      const el = track.current;
      const s = step();
      if (!el || !s) return;
      // Aim for a card, not for "one card further than now": mid-scroll,
      // "now" is somewhere between two of them.
      const at = Math.round(el.scrollLeft / s) + direction;
      el.scrollTo({ left: at * s, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce, step],
  );

  const touch = (down: boolean) => {
    touchingRef.current = down;
    setTouching(down);
  };

  const copies = (set: string) =>
    items.map((item) =>
      isValidElement<Record<string, unknown>>(item)
        ? cloneElement(item, {
            key: `${set}${item.key}`,
            "aria-hidden": true,
            inert: true,
          })
        : item,
    );

  const button =
    "flex size-12 items-center justify-center rounded-full border border-crust-lift text-crumb transition-colors duration-200 hover:border-ash-dim hover:bg-crust-lift";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      // Keyboard focus only. A mouse click leaves focus on the arrow, and
      // that should not hold the row still once the pointer has gone.
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="mx-auto box-content max-w-6xl px-6">{header}</div>

      {/* The row arrives as one piece. Lifting each card on its own would
          push it past the bottom of the track, and a scroll container
          answers overflow with a scrollbar of its own. */}
      <Reveal delay={0.08} className="mt-[clamp(3rem,7vh,5rem)]">
        <ul
          ref={track}
          data-lenis-prevent-horizontal
          aria-live={playing ? "off" : "polite"}
          onTouchStart={() => touch(true)}
          onTouchEnd={() => touch(false)}
          onTouchCancel={() => touch(false)}
          className="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain"
        >
          {cloned ? copies("before-") : null}
          {items}
          {cloned ? copies("after-") : null}
        </ul>

        {loops ? (
          <div className="mx-auto mt-8 box-content flex max-w-6xl items-center gap-8 px-6">
            {/* One segment per project. The current one fills while it
                holds, and that fill is the timer: when it ends, the row
                moves on. Pausing the fill pauses the row. */}
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {items.map((item, i) => (
                <span
                  key={isValidElement(item) ? item.key : i}
                  className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ash-dim/30"
                >
                  {i === index ? (
                    <span
                      className={`absolute inset-0 origin-left bg-ash ${
                        autoplay ? "carousel-fill" : ""
                      }`}
                      style={{
                        animationDuration: `${HOLD_MS}ms`,
                        animationPlayState: playing ? "running" : "paused",
                      }}
                      onAnimationEnd={() => go(1)}
                    />
                  ) : null}
                </span>
              ))}
            </div>

            <div className="flex shrink-0 gap-3">
              {autoplay ? (
                <button
                  type="button"
                  className={button}
                  onClick={() => setStopped((s) => !s)}
                  aria-label={stopped ? playLabel : pauseLabel}
                >
                  <svg
                    viewBox="0 0 12 12"
                    className="size-3"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d={
                        stopped
                          ? "M3 1.5v9l7.5-4.5z"
                          : "M2.5 1.5H5v9H2.5zM7 1.5h2.5v9H7z"
                      }
                    />
                  </svg>
                </button>
              ) : null}
              <button
                type="button"
                className={button}
                onClick={() => go(-1)}
                aria-label={prevLabel}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={button}
                onClick={() => go(1)}
                aria-label={nextLabel}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}
      </Reveal>
    </div>
  );
}
