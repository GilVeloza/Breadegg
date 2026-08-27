import type Lenis from "lenis";

// The smooth-scroll instance is created once by <SmoothScroll>. GSAP's
// ScrollTrigger needs to read from the same instance, so it is parked here
// instead of in React state — no re-renders, no context plumbing.
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
