"use client";

import { animate, type JSAnimation } from "animejs";
import { useEffect, useRef } from "react";
import { metrics } from "./content";
import { useSite } from "./SiteContext";

type Metric = (typeof metrics)[number];
const format = (m: Metric, value: number) => String(Math.round(value)).padStart("pad" in m ? (m.pad ?? 1) : 1, "0");
const finalText = (m: Metric) =>
  `${"prefix" in m ? m.prefix : ""}${format(m, m.to)}${"suffix" in m ? m.suffix : ""}${"unit" in m ? m.unit : ""}`;

export function Metrics() {
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
      if (still()) return metrics.forEach((m, i) => show(i, m.to));
      running = metrics.map((m, i) => {
        const counter = { value: 0 };
        show(i, 0);
        return animate(counter, {
          value: m.to,
          duration: 1600,
          delay: i * 140,
          ease: "outExpo",
          onUpdate: () => show(i, counter.value),
          onComplete: () => show(i, m.to),
        });
      });
    };
    const reset = () => {
      stop();
      played = false;
      metrics.forEach((m, i) => show(i, still() ? m.to : 0));
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
      metrics.forEach((m, i) => show(i, m.to));
    };
  }, [pausedRef]);

  return (
    <section ref={section} className="metrics wrap" id="metrics" aria-label="Các đặc tính GEOagents">
      {metrics.map((m, i) => (
        <div key={m.label}>
          <strong>
            {/* Screen readers get the final value, never the intermediate counts. */}
            <span className="sr-only">{finalText(m)}</span>
            <span aria-hidden="true">
              {"prefix" in m && m.prefix}
              <span
                ref={(node) => {
                  counters.current[i] = node;
                }}
              >
                {format(m, m.to)}
              </span>
              {"suffix" in m && m.suffix}
              {"unit" in m && <small>{m.unit}</small>}
            </span>
          </strong>
          <span>{m.label}</span>
        </div>
      ))}
    </section>
  );
}
