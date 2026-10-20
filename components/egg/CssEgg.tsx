"use client";

import { useEffect, useRef } from "react";

/**
 * How the yolk gives when the page moves under it.
 *
 * Scroll speed is measured in screens per second. The stretch grows with it
 * but flattens out (tanh), so a slow scroll barely registers and a hard flick
 * tops out at STRETCH_MAX instead of turning the mark into a sausage.
 */
const STRETCH_MAX = 0.11;
/** The speed at which the stretch reaches about three quarters of its max. */
const STRETCH_SPEED = 4;
/** How far it trails the page, as a share of its size, per screen/second. */
const LAG = 0.022;
const LAG_MAX = 0.055;
/**
 * Stiffness and damping ratio. Both are under 1 on purpose: an underdamped
 * spring overshoots before it settles, and that overshoot is the wobble.
 */
const STRETCH_SPRING = { k: 260, zeta: 0.2 };
const LAG_SPRING = { k: 170, zeta: 0.28 };

type Spring = { x: number; v: number };

function pull(s: Spring, target: number, k: number, zeta: number, dt: number) {
  s.v += (k * (target - s.x) - 2 * zeta * Math.sqrt(k) * s.v) * dt;
  s.x += s.v * dt;
}

const clamp = (n: number, max: number) => Math.max(-max, Math.min(max, n));

/**
 * The mark, rendered with nothing but a gradient.
 *
 * It is the LCP element: the markup is complete on the server and paints on
 * the first frame, before any JavaScript runs. With `jelly`, a small spring
 * simulation then lets the yolk give a little when the page scrolls under it
 * and wobble back to round when it stops. It runs only while something is
 * moving and the egg is on screen, writes transforms rather than layout, and
 * never starts for anyone who asks for reduced motion.
 */
export default function CssEgg({
  size = "min(56vh, 74vw)",
  breathe = true,
  jelly = false,
  className = "",
  style,
}: {
  size?: string;
  breathe?: boolean;
  jelly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const body = useRef<HTMLDivElement>(null);
  const yolk = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bodyEl = body.current;
    const yolkEl = yolk.current;
    if (!jelly || !bodyEl || !yolkEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stretch: Spring = { x: 0, v: 0 };
    const lag: Spring = { x: 0, v: 0 };
    let speed = 0;
    let lastY = window.scrollY;
    let lastT = 0;
    let frame = 0;
    let visible = true;

    const rest = () => {
      stretch.x = stretch.v = lag.x = lag.v = speed = 0;
      bodyEl.style.transform = "";
      yolkEl.style.borderRadius = "";
      yolkEl.style.removeProperty("--gloss-y");
    };

    const tick = (now: number) => {
      // The first frame after waking has no previous frame to measure from.
      const dt = lastT
        ? Math.min(Math.max((now - lastT) / 1000, 0.001), 1 / 30)
        : 1 / 60;
      lastT = now;
      const y = window.scrollY;
      const raw = dt > 0 ? (y - lastY) / dt / window.innerHeight : 0;
      lastY = y;
      // Lenis already smooths the wheel; this smooths touch and trackpads,
      // whose scroll events arrive in uneven bursts.
      speed += (raw - speed) * (1 - Math.exp(-dt * 30));

      pull(
        stretch,
        STRETCH_MAX * Math.tanh(Math.abs(speed) / STRETCH_SPEED),
        STRETCH_SPRING.k,
        STRETCH_SPRING.zeta,
        dt,
      );
      pull(
        lag,
        clamp(speed * LAG, LAG_MAX),
        LAG_SPRING.k,
        LAG_SPRING.zeta,
        dt,
      );

      // Taller as it stretches and narrower to match, so it reads as the same
      // amount of yolk changing shape rather than as a zoom. Below zero, the
      // overshoot, it squashes the other way.
      const s = stretch.x;
      const o = lag.x;
      bodyEl.style.transform = `translate3d(0, ${o * 100}%, 0) scale(${
        1 - s * 0.5
      }, ${1 + s})`;

      // The trailing end draws out into a slight teardrop, and while it moves
      // the sides answer each other a little out of step, so the outline is
      // never a ruled ellipse. Both fade to a plain circle as it settles.
      const tear = clamp(o * 1.6, 0.09) * 100;
      const wob = s * Math.sin(now / 110) * 32;
      yolkEl.style.borderRadius = `${50 + wob}% ${50 - wob}% ${50 - wob}% ${
        50 + wob
      }% / ${50 - tear}% ${50 - tear}% ${50 + tear}% ${50 + tear}%`;
      // The highlight hangs back from the body it sits on: light stays where
      // it is while the surface under it moves.
      yolkEl.style.setProperty("--gloss-y", `${-o * 70}%`);

      const settled =
        Math.abs(speed) < 0.005 &&
        Math.abs(s) < 0.0005 &&
        Math.abs(stretch.v) < 0.005 &&
        Math.abs(o) < 0.0005 &&
        Math.abs(lag.v) < 0.005;
      if (settled) {
        rest();
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    // Asleep until the page moves, and asleep again once the wobble has died
    // down: a resting egg costs nothing. lastY is left where the last frame
    // put it, so the scroll that wakes it is part of what it measures.
    const wake = () => {
      if (frame || !visible) return;
      lastT = 0;
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Whatever scrolled past while it was off screen is not its motion.
      lastY = window.scrollY;
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        rest();
      }
    });
    observer.observe(bodyEl);
    window.addEventListener("scroll", wake, { passive: true });

    return () => {
      window.removeEventListener("scroll", wake);
      observer.disconnect();
      cancelAnimationFrame(frame);
      rest();
    };
  }, [jelly]);

  return (
    <div
      aria-hidden="true"
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <div className="egg-glow absolute -inset-[18%] rounded-full" />
      {/* Two layers on purpose: the float animation owns the yolk's
          transform, so the jelly moves the body around it instead. */}
      <div ref={body} className="relative h-full w-full">
        <div
          ref={yolk}
          className={`egg-yolk grain relative h-full w-full overflow-hidden ${
            breathe ? "egg-breathe" : ""
          }`}
        >
          {jelly ? (
            <>
              <div className="egg-gloss" />
              <div className="egg-rim" />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
