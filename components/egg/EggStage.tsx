import CssEgg from "./CssEgg";

/**
 * The mark. One egg, always the same one.
 *
 * A WebGL sphere used to fade in over the CSS egg a moment after load, trading
 * a cursor-tracked highlight for a mark that visibly changed while you looked
 * at it — different shading, and the glow gone with it. Holding one appearance
 * from the first frame is worth more than the interaction, so the CSS egg is
 * the whole thing now: it paints without JavaScript, it is the LCP element, and
 * it never hands off to anything.
 *
 * EggCanvas and frame.ts are what the WebGL egg was; nothing imports them.
 */
export default function EggStage({
  size = "min(56vh, 74vw)",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <CssEgg size={size} className={className} />;
}
