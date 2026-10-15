// Shared frame-budget helpers. Decorative canvases redraw a large surface every frame; while the
// page is scrolling, that time belongs to the scroll, so they hold still and resume ~150 ms after
// it stops. A canvas that is fully on screen (a pinned scene driven by the scroll) keeps drawing.

let scrollingUntil = 0;
let listening = false;

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  addEventListener(
    "scroll",
    () => {
      scrollingUntil = performance.now() + 150;
    },
    { passive: true },
  );
}

/** True while the page is being scrolled (and for 150 ms after). */
export function isScrolling() {
  listen();
  return performance.now() < scrollingUntil;
}

/** True when the element lies entirely within the viewport. */
export function fullyInView(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top >= -1 && r.bottom <= innerHeight + 1;
}

/** Frame interval for the shared 60 fps cap. */
export const FRAME_MS = 1000 / 60 - 1;
