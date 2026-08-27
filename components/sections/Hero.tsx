"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "motion/react";
import EggStage from "@/components/egg/EggStage";

/**
 * One screen — and that is a constraint, not a description.
 *
 * Every vertical measurement here is a share of the viewport height, because
 * the egg, the headline and the footer line are spending one budget between
 * them. Anything sized in absolute pixels stops being a share of that budget
 * and starts being a claim on it: fixed 7rem/5rem padding was a quarter of a
 * 780px-tall window, which is where the headline used to run past the bottom
 * of the screen. The headline is capped by height as well as width for the
 * same reason — see .t-display-hero.
 *
 * The egg floats slowly on its own, and as the hero scrolls away it drifts
 * upward a little faster than the page while a halo blooms around it. The
 * circle itself never deforms.
 */
export default function Hero() {
  const hero = useRef<HTMLElement>(null);

  const t = useTranslations("hero");
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });

  // Leaves a touch faster than the page, so it feels lighter than the type.
  const eggY = useTransform(scrollYProgress, [0, 1], ["0%", "-42%"]);
  const halo = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const cue = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      id="top"
      ref={hero}
      className="relative flex min-h-svh flex-col items-center justify-center px-6 pt-[clamp(5rem,10vh,7rem)] pb-[clamp(2.5rem,6vh,5rem)]"
    >
      <motion.div
        style={{ y: eggY }}
        className="relative mb-[clamp(1.25rem,3.5vh,3rem)] shrink-0"
      >
        <motion.span
          aria-hidden="true"
          style={{ opacity: halo }}
          className="egg-halo pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[210%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
        {/* The egg is the piece that gives: height-led, so it shrinks on a
            short window instead of pushing the headline off the bottom. */}
        <EggStage size="min(46vh, 74vw)" />
      </motion.div>

      <div className="flex max-w-6xl flex-col items-center text-center">
        <h1 className="t-display t-display-hero text-crumb">{t("title")}</h1>
      </div>

      <motion.div
        style={{ opacity: cue }}
        className="mt-[clamp(1.5rem,4vh,3.5rem)] flex w-full max-w-6xl items-end justify-between gap-6"
      >
        <p className="t-eyebrow text-ash-dim">{t("location")}</p>
        <div className="flex items-center gap-3">
          <span className="t-eyebrow text-ash-dim">{t("scroll")}</span>
          <span className="scroll-cue relative block h-10 w-px bg-crust-lift" />
        </div>
      </motion.div>
    </section>
  );
}
