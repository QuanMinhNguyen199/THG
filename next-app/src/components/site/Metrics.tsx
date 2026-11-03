"use client";

import { animate, type JSAnimation } from "animejs";
import { useEffect, useRef } from "react";
import type { Metric } from "@/content/blocks";
import { useSite } from "./SiteContext";
import { useContent } from "../cms/EditorBridge";

const format = (m: Metric, value: number) => String(Math.round(value)).padStart(m.minDigits ?? 1, "0");
// Editors type "Level", not "Level ": a prefix ending in a letter gets its space here, a symbol does not.
const lead = (m: Metric) => (m.prefix ? m.prefix.trim() + (/\p{L}$/u.test(m.prefix.trim()) ? " " : "") : "");
const finalText = (m: Metric) =>
  `${lead(m)}${format(m, m.value)}${m.suffix ?? ""}${m.unit ?? ""}`;

/** Without items it shows the GEOagents page's metrics (pages/geoagents.json). */
export function Metrics({ items, id = "metrics", label: name }: { items?: Metric[]; id?: string; label?: string }) {
  const { metrics: own } = useContent().geoagents;
  const metrics = items ?? own.items;
  const label = name ?? own.label;
  const { pausedRef } = useSite();
  const section = useRef<HTMLElement>(null);
  const counters = useRef<(HTMLSpanElement | null)[]>([]);

  // Count up every time the band scrolls into view, and quietly reset to zero once it has fully
  // left, so the count also plays when the page was reloaded mid-scroll, on tall screens where the
  // band is visible on load, and on every return visit while scrolling.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const nodes = counters.current;
    let running: JSAnimation[] = [];
    let played = false;

    // Reduced motion and the pause control keep the final values (also the server HTML).
    // Checked at call time: the provider's paused state is set by a parent effect that runs later.
    const still = () => pausedRef.current || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (i: number, value: number) => {
      const node = nodes[i];
      if (node) node.textContent = format(metrics[i], value);
    };
    const stop = () => {
      running.forEach((a) => a.cancel());
      running = [];
    };
    const play = () => {
      stop();
      played = true;
      if (still()) return metrics.forEach((m, i) => show(i, m.value));
      running = metrics.map((m, i) => {
        const counter = { value: 0 };
        show(i, 0);
        return animate(counter, {
          value: m.value,
          duration: 1600,
          delay: i * 140,
          ease: "outExpo",
          onUpdate: () => show(i, counter.value),
          onComplete: () => show(i, m.value),
        });
      });
    };
    const reset = () => {
      stop();
      played = false;
      metrics.forEach((m, i) => show(i, still() ? m.value : 0));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) {
          if (!played) play();
        } else if (!entry.isIntersecting) {
          reset(); // fully offscreen: nobody sees the jump back to zero
        }
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
      metrics.forEach((m, i) => show(i, m.value));
    };
  }, [pausedRef, metrics]);

  return (
    <section ref={section} className="metrics wrap" id={id} aria-label={label}>
      {metrics.map((m, i) => (
        <div key={m.label}>
          <strong>
            {/* Screen readers get the final value, never the intermediate counts. */}
            <span className="sr-only">{finalText(m)}</span>
            <span aria-hidden="true">
              {lead(m)}
              <span
                ref={(node) => {
                  counters.current[i] = node;
                }}
              >
                {format(m, m.value)}
              </span>
              {m.suffix}
              {m.unit && <small>{m.unit}</small>}
            </span>
          </strong>
          <span>{m.label}</span>
        </div>
      ))}
    </section>
  );
}
