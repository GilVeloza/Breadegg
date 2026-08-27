/**
 * Framing shared by the two eggs, so they land on exactly the same circle.
 *
 * The CSS egg fills its box edge to edge. The WebGL egg is a sphere in
 * perspective, so what it covers is the tangent cone, not its diameter — at
 * this camera that is ~90% of the canvas. Matched box for box the mark visibly
 * shrank the instant the cross-fade ran, so EggStage bleeds the canvas past the
 * stage by OVERSCAN and the two silhouettes come out identical.
 */

export const CAMERA_Z = 2.85; // back far enough to leave the egg room to float
export const CAMERA_FOV = 45; // degrees, vertical — the stage is square
export const SPHERE_RADIUS = 1;

/** Share of the canvas height the sphere's silhouette actually covers. */
const FILL =
  Math.tan(Math.asin(SPHERE_RADIUS / CAMERA_Z)) /
  Math.tan((CAMERA_FOV * Math.PI) / 360);

/** Canvas inset — negative, which makes the sphere come out stage-sized. */
export const OVERSCAN = `${(-100 * (1 / FILL - 1)) / 2}%`;
