import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * The tab icon: the mark, and nothing but the mark.
 *
 * Same seven-stop ramp and same off-centre highlight as `.egg-yolk` and the
 * share card, so the circle in the tab is recognisably the circle in the hero.
 * Rendered at 64px and left to downsample — browsers ask for 16 and 32, and a
 * gradient this smooth survives the scale better than a hand-drawn .ico would.
 * The corners stay transparent so it reads as a dot, not as a tile.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 9999,
          background:
            "radial-gradient(circle at 35% 32%, #fff7d4 0%, #ffeaa4 10%, #fcd063 26%, #f8ab2a 48%, #f4901c 66%, #ea7a12 84%, #dd660a 100%)",
        }}
      />
    ),
    size,
  );
}
