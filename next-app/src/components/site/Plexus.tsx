"use client";

// Red plexus network for the Corporate concept: drifting nodes linked when close, gently drawn
// toward the pointer. Canvas 2D, at most 60 fps, idle offscreen, frozen when motion is paused.
// Where the network shows is decided by a CSS mask on the canvas, so copy stays readable.

import { useEffect, useRef } from "react";
import { FRAME_MS, isScrolling } from "./frameBudget";
import { useSite } from "./SiteContext";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

export function Plexus({
  className,
  density = 1,
  color = "#c1152b",
}: {
  className?: string;
  /** Nodes per 10,000 px² of canvas (roughly). */
  density?: number;
  color?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { pausedRef } = useSite();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let visible = true;
    let raf = 0;
    let last = 0;
    let drawn = false;
    const pointer = { x: -9999, y: -9999 };
    const LINK = 120;

    const seed = (n: number) => {
      // Seeded, so the network looks the same on every visit.
      let s = 7 + n;
      return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      if (r.width === w && r.height === h) return;
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = seed(Math.round(w));
      const count = Math.round(((w * h) / 10000) * density);
      nodes = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.25,
        vy: (rand() - 0.5) * 0.25,
        r: 1.2 + rand() * 2.2,
      }));
      drawn = false;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = dx * dx + dy * dy;
          if (d > LINK * LINK) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d) / LINK) * 0.55;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // Lines to the pointer make the network feel responsive.
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < LINK * 1.3) {
          ctx.globalAlpha = (1 - pd / (LINK * 1.3)) * 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const n of nodes) {
        // Drift, a little pull toward the pointer, and wrap at the edges.
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 160 && d > 1) {
          n.vx += (dx / d) * 0.012;
          n.vy += (dy / d) * 0.012;
        }
        n.vx *= 0.99;
        n.vy *= 0.99;
        const speed = Math.hypot(n.vx, n.vy);
        if (speed < 0.08) {
          n.vx += (Math.random() - 0.5) * 0.02;
          n.vy += (Math.random() - 0.5) * 0.02;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      if (!visible || document.hidden) return;
      if (drawn && isScrolling()) return;
      if (pausedRef.current) {
        if (!drawn) draw();
        drawn = true;
        return;
      }
      step();
      draw();
      drawn = true;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [density, color, pausedRef]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
