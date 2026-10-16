"use client";

// Silk-like red/pink ribbon of fine lines (concept 4). Each ribbon is a family of sine curves whose
// phase drifts along the family, so the bundle twists. Canvas 2D, at most 60 fps, idle offscreen,
// frozen when motion is paused. The pointer nudges the twist.

import { useEffect, useRef } from "react";
import { FRAME_MS, isScrolling } from "./frameBudget";
import { useSite } from "./SiteContext";

type Ribbon = { y: number; amp: number; freq: number; twist: number; speed: number; lines: number; spread: number; hue: [number, number] };

export function Waves({ className, ribbons }: { className?: string; ribbons: Ribbon[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { pausedRef } = useSite();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let t = 0;
    let visible = true;
    let drawn = false;
    let nudge = 0;
    let nudgeTarget = 0;

    const resize = () => {
      const r = el.getBoundingClientRect();
      if (r.width === w && r.height === h) return;
      w = r.width;
      h = r.height;
      // Hairlines alias visibly at 1x on high-density screens; 1.5x smooths them while keeping the
      // fill cost well below full 2x/3x density.
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawn = false;
    };

    // Lines are grouped into a few colour bands and each band is stroked once, so a frame costs
    // ~12 stroke calls instead of one per line; quadratic curves keep them smooth with fewer points.
    const BANDS = 6;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const step = Math.max(14, w / 64);
      ctx.lineWidth = 1;
      for (const rb of ribbons) {
        const [a, b] = rb.hue;
        for (let band = 0; band < BANDS; band++) {
          const edge = (band + 0.5) / BANDS; // 0 = middle of the bundle (deep red), 1 = edges (pink)
          ctx.strokeStyle = `hsla(${a + (b - a) * edge}, 78%, ${46 + edge * 30}%, ${0.55 - edge * 0.35})`;
          ctx.beginPath();
          for (let i = 0; i < rb.lines; i++) {
            const f = i / (rb.lines - 1);
            if (Math.min(BANDS - 1, Math.floor(Math.abs(f - 0.5) * 2 * BANDS)) !== band) continue;
            const phase = t * rb.speed + f * rb.twist + nudge;
            const yAt = (x: number) => {
              const u = x / w;
              const envelope = Math.sin(Math.PI * Math.min(1, Math.max(0, u * 1.1)));
              return (
                rb.y * h +
                Math.sin(u * Math.PI * rb.freq + phase) * rb.amp * h * (0.55 + 0.45 * envelope) +
                (f - 0.5) * rb.spread * h * Math.cos(u * Math.PI * 1.3 + phase * 0.5)
              );
            };
            let px = -20;
            let py = yAt(px);
            ctx.moveTo(px, py);
            for (let x = px + step; x <= w + 20 + step; x += step) {
              const y = yAt(x);
              ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
              px = x;
              py = y;
            }
          }
          ctx.stroke();
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!visible || document.hidden) return;
      // The ribbon holds still while the page scrolls (see frameBudget.ts).
      if (drawn && isScrolling()) {
        last = 0; // resume without a time jump
        return;
      }
      if (pausedRef.current) {
        if (!drawn) draw();
        drawn = true;
        return;
      }
      t += dt;
      nudge += (nudgeTarget - nudge) * Math.min(1, dt * 2);
      draw();
      drawn = true;
    };
    const onMove = (e: PointerEvent) => {
      nudgeTarget = (e.clientX / innerWidth - 0.5) * 1.2;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
    };
  }, [ribbons, pausedRef]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
