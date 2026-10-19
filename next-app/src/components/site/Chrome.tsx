"use client";

// Page-level fixtures that sit outside the sections: theme announcement, scroll light band, back-to-top sphere.
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteContext";

/** Announces theme changes (Dark Tech / Industrial) to screen readers. */
export function ThemeDock() {
  const { announcement } = useSite();
  return (
    <span className="sr-only" id="theme-announcement" aria-live="polite">
      {announcement}
    </span>
  );
}

/** A faint band and edge line that follow document progress; hidden while motion is paused. */
export function ScrollLight() {
  const { paused } = useSite();

  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(1, root.scrollHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / range));
      // Set on the light itself (not <html>), so only this element's style is recalculated.
      light.current?.style.setProperty("--page-progress", String(progress));
      light.current?.style.setProperty("--light-y", `${progress * 115 - 15}vh`);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);

  return (
    <div ref={light} className="scroll-light" aria-hidden="true" style={{ opacity: paused ? 0 : 1 }}>
      <i />
    </div>
  );
}

/**
 * Floating "back to top" sphere: appears once the hero is mostly scrolled past, and its ring
 * fills with page progress. Replaces the old link at the bottom of the footer.
 */
export function BackToTop() {
  const { pausedRef } = useSite();
  const [shown, setShown] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / range));
      setShown(scrollY > innerHeight * 0.6);
      ring.current?.style.setProperty("stroke-dashoffset", String(RING * (1 - progress)));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);

  return (
    <button
      type="button"
      className={`to-top${shown ? " is-shown" : ""}`}
      aria-label="Trở về đầu trang"
      tabIndex={shown ? 0 : -1}
      onClick={() => scrollTo({ top: 0, behavior: pausedRef.current ? "instant" : "smooth" })}
    >
      <svg className="to-top-ring" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="28" />
        <circle ref={ring} cx="30" cy="30" r="28" style={{ strokeDasharray: RING, strokeDashoffset: RING }} />
      </svg>
      <span className="to-top-sphere" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}

const RING = 2 * Math.PI * 28;
