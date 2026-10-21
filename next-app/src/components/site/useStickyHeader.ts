"use client";

import { useEffect, useRef } from "react";

/**
 * The header stays fixed at the top and turns solid once the hero has scrolled out from under it:
 * `data-solid` is toggled on the header element, and CSS does the rest. An observer (rather than a
 * scroll listener) keeps this off the scroll path entirely.
 *
 * Every concept page is mounted but only one is shown, so observe only while this page is `active`:
 * a hidden header measures 0px tall, which would let the hero slide under the bar unnoticed.
 */
export function useStickyHeader<T extends HTMLElement>(heroSelector: string, active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const header = ref.current;
    const hero = document.querySelector(heroSelector);
    if (!active || !header) return;
    // Pages without a hero show the solid bar from the start.
    if (!hero) {
      header.setAttribute("data-solid", "");
      return;
    }
    let observer: IntersectionObserver | undefined;
    // Measure a frame later: the page is revealed by the theme attribute on <html>, which the site
    // provider sets in its own effect after this one. Measure the bar in its transparent state.
    const frame = requestAnimationFrame(() => {
      header.removeAttribute("data-solid");
      observer = new IntersectionObserver(
        ([entry]) => header.toggleAttribute("data-solid", !entry.isIntersecting),
        // The hero counts as gone once its bottom edge passes under the header bar.
        { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
      );
      observer.observe(hero);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [heroSelector, active]);
  return ref;
}
