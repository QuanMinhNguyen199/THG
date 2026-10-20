import type { CSSProperties } from "react";

// One signal rhythm for both four-tier diagrams (the desktop board and the narrow-screen stack).
// A light crosses a cable in the first quarter of its cycle (flow-run) and waits out the rest; the
// lit lineage hops tier by tier in three waves. Every cable keeps its own lag and a slightly
// different pace (fixed per cable), so the lights drift out of step and the traffic looks organic
// instead of marching in rows.
export const START = 0.3;
export const HOP = 0.3;
export const CYCLE = HOP * 4;
export const WAVES = [0, 1 / 3, 2 / 3].map((f) => f * CYCLE);
export const IDLE = 2.4; // desktop resting conduits: one slower light drifting at a constant pace

// The delay is turned into the same phase taken as already elapsed (a negative delay): a light
// that appears, for instance when a new lineage lights up, is mid-run at once instead of waiting
// for its start; the relative timing between cables is unchanged. Rounded to the millisecond so
// the server and the browser print identical styles.
export const timing = (delay: number, cycle = CYCLE): CSSProperties => {
  const phase = ((delay % cycle) + cycle) % cycle;
  return { animationDelay: `${(phase - cycle).toFixed(3)}s`, animationDuration: `${cycle.toFixed(3)}s` };
};

/** A fixed pseudo-random number in [0, 1) for a seed: the same on every render. */
export const noise = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** A cable's seed from its gap and the units it joins. */
export const seedOf = (c: number, a: number, b: number) => c * 97 + a * 13 + b * 7;

/** A lit lineage light: hops tier by tier, with this cable's own lag and pace (±25%). */
export const litTiming = (c: number, wave: number, seed: number) =>
  timing(START + wave + c * HOP + noise(seed + wave) * 0.45, CYCLE * (0.8 + noise(seed + 1) * 0.5));

/** A resting light in the lineage's style and speed (narrow-screen stack), starting at random. */
export const restTiming = (seed: number) => timing(noise(seed) * CYCLE * 3, CYCLE * (0.8 + noise(seed + 2) * 0.5));

/** A desktop resting conduit's drifting light: random start, pace between 0.65× and 1.45×. */
export const idleTiming = (seed: number) => timing(noise(seed) * IDLE * 2, IDLE * (0.65 + noise(seed + 3) * 0.8));
