"use client";

// Document-level motion layered on the sections (ported from dist/app.js and dist/effects.js).
// Every effect is decorative, reads `paused`, and undoes its inline styles on cleanup.
import { animate, utils } from "animejs";
import { useEffect, useRef } from "react";
import { useSite } from "./SiteContext";

const REVEAL = ".metrics,.architecture-copy,.section-heading,.pillars article,.project,.cta-inner";

export function ConceptEffects() {
  const { theme, paused } = useSite();
  useEntranceReveal(theme === "corporate", paused);
  useTechPointer(theme === "tech" && !paused);
  useIndustrialParallax(theme === "industrial" && !paused);
  return null;
}

/** Default entrance on the shared page: blocks rise slightly the first time they enter. */
function useEntranceReveal(skip: boolean, paused: boolean) {
  const skipRef = useRef(skip);
  const pausedRef = useRef(paused);
  useEffect(() => {
    skipRef.current = skip;
    pausedRef.current = paused;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (!pausedRef.current && !skipRef.current) {
            animate(e.target, { y: [24, 0], opacity: [0.65, 1], duration: 700, ease: "outExpo" });
          }
          observer.unobserve(e.target);
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(REVEAL).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Pausing settles any entrance mid-flight.
  useEffect(() => {
    if (!paused) return;
    const targets = document.querySelectorAll<HTMLElement>(REVEAL);
    utils.remove(targets);
    targets.forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
  }, [paused]);
}

/** Dark Tech: the background grid tilts toward the cursor; cards light up under it. */
function useTechPointer(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const grid = document.querySelector<HTMLElement>(".bg-grid");
    const fine = matchMedia("(pointer: fine)");
    const tilt = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (!fine.matches) return;
      target.x = (e.clientX / innerWidth) * 2 - 1;
      target.y = (e.clientY / innerHeight) * 2 - 1;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".project-visual,.pillars article");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--px", `${e.clientX - r.left}px`);
        card.style.setProperty("--py", `${e.clientY - r.top}px`);
      }
    };
    let written = "";
    const frame = () => {
      tilt.x += (target.x - tilt.x) * 0.06;
      tilt.y += (target.y - tilt.y) * 0.06;
      const x = tilt.x.toFixed(3);
      const y = tilt.y.toFixed(3);
      const shift = ((scrollY * 0.2) % 72).toFixed(1);
      // Skip style writes while nothing moves; each write invalidates style for the grid.
      const next = `${x}:${y}:${shift}`;
      if (next !== written) {
        written = next;
        // On the grid itself (not <html>), so only its style is recalculated each frame.
        grid?.style.setProperty("--tilt-x", x);
        grid?.style.setProperty("--tilt-y", y);
        grid?.style.setProperty("--grid-shift", shift);
      }
      raf = requestAnimationFrame(frame);
    };
    addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
}

/** Industrial: depth layers drift at different speeds. `translate` composes with existing transforms. */
function useIndustrialParallax(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const spec: [string, number, boolean?][] = [
      [".hero-video", 0.28, true],
      [".hero-copy", 0.12, true],
      [".section-heading", -0.06],
      [".pillars svg", -0.1],
      [".document,.blueprint", -0.12],
      [".metrics strong", -0.05],
    ];
    const layers = spec.flatMap(([selector, speed, page]) =>
      [...document.querySelectorAll<HTMLElement>(selector)].map((el) => ({ el, speed, page: !!page, offset: 0 })),
    );
    let raf = 0;
    const frame = () => {
      const middle = innerHeight / 2;
      layers.forEach((l) => {
        let offset: number;
        if (l.page) {
          if (scrollY > innerHeight * 1.3 && l.offset) return;
          offset = Math.min(scrollY, innerHeight * 1.3) * l.speed;
        } else {
          // Subtract our own offset so the measurement never feeds back into itself.
          const r = l.el.getBoundingClientRect();
          const top = r.top - l.offset;
          if (top > innerHeight + 200 || top + r.height < -200) return;
          offset = (top + r.height / 2 - middle) * l.speed;
        }
        l.offset = offset;
        l.el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      layers.forEach((l) => (l.el.style.translate = ""));
    };
  }, [enabled]);
}
