"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";

const SPRING = { stiffness: 170, damping: 18, mass: 0.4 };
const MAX_TILT = 11; // degrees
const MAGNET = 8; // px the card leans toward the cursor

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Pointer position inside the card, 0..1 on each axis; 0.5 is the resting centre.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const lit = useSpring(0, { stiffness: 120, damping: 20 });

  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const x = useSpring(useTransform(px, [0, 1], [-MAGNET, MAGNET]), SPRING);
  const y = useSpring(useTransform(py, [0, 1], [-MAGNET, MAGNET]), SPRING);

  const spotX = useTransform(px, (v) => `${v * 100}%`);
  const spotY = useTransform(py, (v) => `${v * 100}%`);
  const borderGlow = useMotionTemplate`radial-gradient(360px circle at ${spotX} ${spotY}, rgba(193,21,43,0.9), transparent 45%)`;
  const surfaceGlow = useMotionTemplate`radial-gradient(520px circle at ${spotX} ${spotY}, rgba(193,21,43,0.12), transparent 50%)`;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    // Touch and pen keep the static card; tilt only follows a hovering mouse.
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    lit.set(1);
  }

  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
    lit.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={reduced ? undefined : { rotateX, rotateY, x, y, transformPerspective: 900 }}
      className={`group relative rounded-2xl p-px ${className}`}
    >
      {/* 1px border: a resting hairline plus the cursor spotlight showing through the padding. */}
      <div aria-hidden className="absolute inset-0 rounded-2xl bg-white/10" />
      <motion.div aria-hidden className="absolute inset-0 rounded-2xl" style={{ background: borderGlow, opacity: lit }} />

      <div className="relative h-full overflow-hidden rounded-[15px] bg-card/80 backdrop-blur-xl">
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: surfaceGlow, opacity: lit }} />
        <div className="relative">{children}</div>
      </div>
    </motion.div>
  );
}
