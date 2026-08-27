/**
 * The mark, rendered with nothing but a gradient.
 *
 * Three jobs: it is the LCP element (paints on the first frame, no JS), it is
 * the placeholder the WebGL egg cross-fades over, and it is the permanent
 * fallback wherever WebGL can't or shouldn't run.
 */
export default function CssEgg({
  size = "min(56vh, 74vw)",
  breathe = true,
  className = "",
  style,
}: {
  size?: string;
  breathe?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <div className="egg-glow absolute -inset-[18%] rounded-full" />
      <div
        className={`egg-yolk grain relative h-full w-full overflow-hidden ${
          breathe ? "egg-breathe" : ""
        }`}
      />
    </div>
  );
}
