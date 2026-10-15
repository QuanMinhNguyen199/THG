"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Surface } from "./art";
import { FRAME_MS, fullyInView, isScrolling } from "./frameBudget";
import { useSite } from "./SiteContext";

/**
 * Runs a canvas drawing loop that matches the static site:
 * HiDPI-aware sizing, at most 60 fps, time that stops while motion is paused, frames skipped offscreen,
 * and redraws only when the size, clock or `signature` changes.
 */
export function useArtCanvas(
  ref: RefObject<HTMLCanvasElement | null>,
  draw: (surface: Surface, time: number) => void,
  signature: () => string,
) {
  const { pausedRef } = useSite();
  const drawRef = useRef(draw);
  const signatureRef = useRef(signature);
  useEffect(() => {
    drawRef.current = draw;
    signatureRef.current = signature;
  });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let visible = true;
    let time = 0;
    let last = performance.now();
    let cache = "";
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (w === r.width && h === r.height) return;
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cache = "";
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    const loop = (now: number) => {
      // Cap at 60 fps: high-refresh screens would otherwise redraw the canvas twice as often.
      if (now - last < FRAME_MS) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Scrolling past: hold the last frame. Pinned (fully on screen): the scroll drives the scene.
      const hold = !!cache && isScrolling() && !fullyInView(canvas);
      if (!document.hidden && !hold && (visible || !cache)) {
        if (!pausedRef.current) time += dt;
        const key = `${w}:${h}:${time}:${signatureRef.current()}`;
        if (key !== cache) {
          drawRef.current({ ctx, w, h }, time);
          cache = key;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [ref, pausedRef]);
}
