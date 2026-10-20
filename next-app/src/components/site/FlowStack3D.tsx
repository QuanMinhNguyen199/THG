"use client";

// Narrow screens: the four tiers as a stack of solid decks, one per tier, each named on its front
// edge, with each unit as a block standing on its deck. Governance is one unit but reads as several
// components, so its deck carries a row of blocks that act together. Cables run between decks for
// every hand-off; the picked unit's lineage lights up. The deck in view glows and its blocks rise; the picked unit rises highest.
// Spacing comes from the space available, so decks never overlap on screen. Text never sits on the
// tilted geometry (it would read soft): tier names and the picked unit's label are a flat column on
// the right, and the lit lineage and the leader line are drawn in a flat overlay from measured
// block positions.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { layers } from "./content";
import { WAVES, litTiming, seedOf } from "./flowSignals";
import type { StackGL } from "./FlowStackGL";
import { chooseRenderer, rememberCSS } from "./stackRenderer";

type Unit = { title: string; role: string; work: [string, string][] };
type Pick = { col: number; i: number };
type Trace = { id: string; c: number; a: number; b: number };
type Point = { x: number; y: number };
type Lines = { tiles: Record<string, Point> };


// View: rotateX(TILT) rotateZ(-TURN), matching the CSS. A shallow turn keeps each deck's footprint
// short on screen, which is what lets four decks fit one above another.
const TILT = (62 * Math.PI) / 180;
const TURN = (14 * Math.PI) / 180;
const DEPTH = 0.46; // broad architectural planes, not tall keycaps
const SLAB = 3;
const RISE = { rest: 2, lit: 3, active: 3, picked: 5 };
const CLEAR = 18; // open space between thin floors
const LIFT = 2;

// Trunk lines between neighbouring decks (infrastructure, not hand-offs between particular units):
// where they leave the deck above and land on the deck below, as shares of each deck's width.
// WebGL start-up check: below MIN_FPS this visit falls back to CSS; below KEEP_CSS_FPS the device
// also gets CSS from the start next time.
const MIN_FPS = 45;
const KEEP_CSS_FPS = 30;

const TRUNKS: [number, number][] = [[0.08, 0.08], [0.92, 0.92]];

/**
 * A cable from a block down to a block on the next deck: it leaves sideways, sags and swings back,
 * with a bend that varies per hand-off (fixed, so a cable never jumps between renders).
 */
function cable(p: Point, q: Point, c: number, a: number, b: number) {
  const seed = ((c * 7 + a * 13 + b * 29) % 11) / 10; // 0..1
  const side = (a + b + c) % 2 ? 1 : -1;
  const swing = (5 + seed * 8) * side;
  const dy = q.y - p.y;
  return `M${p.x} ${p.y} C${p.x + swing} ${p.y + dy * 0.55}, ${q.x - swing * 0.8} ${q.y - dy * 0.6}, ${q.x} ${q.y}`;
}

/**
 * Lights on one cable (flowSignals), exactly as on the desktop board's conduits: every cable is
 * always active, carrying one bright light with its red halo that drifts at a constant pace, on the
 * cable's own lag and speed, so the whole stack keeps flowing whichever tier is picked.
 */
/**
 * Lights on one cable, exactly as on the desktop board's conduits (flowSignals): three bursting
 * waves per cycle, a bright core over a red halo, each cable on its own lag and pace.
 */
function signals(d: string, c: number, seed: number, _lit?: boolean) {
  return WAVES.map((w) => {
    const style = litTiming(c, w, seed);
    return (
      <g key={w}>
        <path className="flow-pulse-halo" pathLength={1} style={style} d={d} />
        <path className="flow-pulse" pathLength={1} style={style} d={d} />
      </g>
    );
  });
}

/** Leftmost and rightmost block centres on one deck. */
function span(tiles: Record<string, Point>, col: number) {
  const xs = Object.entries(tiles).filter(([k]) => k.startsWith(`${col}-`)).map(([, p]) => p);
  if (!xs.length) return null;
  const l = xs.reduce((m, p) => (p.x < m.x ? p : m));
  const r = xs.reduce((m, p) => (p.x > m.x ? p : m));
  return { l, r };
}
const lerp = (s: { l: Point; r: Point }, f: number): Point => ({ x: s.l.x + (s.r.x - s.l.x) * f, y: s.l.y + (s.r.y - s.l.y) * f });

/** Deck size and deck spacing that fit the stack in its box without decks overlapping. */
function fit(width: number, height: number, floors: number) {
  const footprint = (Math.sin(TURN) + DEPTH * Math.cos(TURN)) * Math.cos(TILT); // on-screen height per px of deck width
  const across = Math.cos(TURN) + DEPTH * Math.sin(TURN); // on-screen width per px of deck width
  const tall = (RISE.picked + LIFT) * Math.sin(TILT) + SLAB * Math.cos(TILT);
  const byHeight = (height - 20 - floors * (tall + CLEAR)) / (floors * footprint);
  const w = Math.max(120, Math.min((width * 0.94) / across, byHeight, 240));
  const step = (w * footprint + tall + CLEAR) / Math.sin(TILT); // translateZ between decks
  return { w: Math.round(w), d: Math.round(w * DEPTH), step: Math.round(step) };
}

export function FlowStack3D({
  units,
  pick,
  active,
  traced,
  links,
  inLine,
  onChoose,
  onTier,
}: {
  units: Unit[][];
  pick: Pick;
  active: number;
  traced: Trace[];
  links: [number, number][][];
  inLine: (col: number, i: number) => boolean;
  onChoose: (col: number, i: number) => void;
  onTier: (col: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const gl = useRef<StackGL | null>(null);
  const [webgl, setWebgl] = useState(false);
  const [size, setSize] = useState({ w: 180, d: 58, step: 90 });
  const [lines, setLines] = useState<Lines | null>(null);

  // Block centres (top faces) and the label's left edge, relative to the component.
  const measure = useCallback(() => {
    const el = root.current;
    if (!el || el.offsetParent === null) return; // hidden on wide screens
    const box = el.getBoundingClientRect();
    const tiles: Record<string, Point> = {};
    el.querySelectorAll<HTMLElement>("[data-tile]").forEach((t) => {
      const r = t.querySelector(".s3-top")!.getBoundingClientRect();
      tiles[t.dataset.tile!] = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    setLines({ tiles });
    gl.current?.update();
  }, []);

  // Capable devices draw the stack with WebGL (lit solids, real shadows); the CSS stack stays as
  // the tappable, focusable layer above it. Decided when the page opens: a device without a real
  // GPU never loads three.js, and one that cannot hold the frame rate falls back to CSS.
  useEffect(() => {
    const el = root.current;
    if (!el || el.offsetParent === null || chooseRenderer() !== "gl") return;
    let cancelled = false;
    import("./FlowStackGL").then(async ({ mountStackGL }) => {
      if (cancelled || !scene.current || !world.current) return;
      const stack = mountStackGL(scene.current, world.current);
      gl.current = stack;
      setWebgl(true);
      const fps = await stack.probe();
      if (cancelled) return;
      el.dataset.renderFps = String(Math.round(fps)); // read by QA; harmless otherwise
      if (fps < MIN_FPS) {
        if (fps < KEEP_CSS_FPS) rememberCSS();
        stack.dispose();
        gl.current = null;
        setWebgl(false);
      }
    }).catch(() => {
      // A shader/context failure must leave the interactive CSS stack usable.
      gl.current?.dispose();
      gl.current = null;
      if (!cancelled) setWebgl(false);
    });
    return () => {
      cancelled = true;
      gl.current?.dispose();
      gl.current = null;
    };
  }, []);

  // Size the stack to its box (what the pinned scene leaves over).
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.offsetParent !== null) setSize(fit(el.clientWidth, el.clientHeight, units.length));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [units.length]);

  // Decks and blocks glide when the tier or pick changes: keep measuring until they settle.
  useLayoutEffect(() => {
    let frame = 0;
    const end = performance.now() + 700;
    const tick = () => {
      measure();
      if (performance.now() < end) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [measure, active, pick.col, pick.i, size]);

  // Governance hands work down from a different component for each unit below it.
  const at = (col: number, i: number, _to?: number) => lines?.tiles[`${col}-${i}`];
  const last = units.length - 1;
  // Shift the stack down by half its on-screen height so its middle sits at the box's middle.
  const centre = Math.round(((last * size.step + LIFT) / 2) * Math.sin(TILT));

  // Every cable once: trunk lines, then hand-offs at rest, then the lit lineage (drawn last, on top).
  type Cable = { key: string; d: string; c: number; seed: number; lit: boolean; className: string };
  const cables: Cable[] = [];
  if (lines) {
    units.slice(0, -1).forEach((_, c) => {
      const top = span(lines.tiles, c);
      const bottom = span(lines.tiles, c + 1);
      if (!top || !bottom) return;
      TRUNKS.forEach(([f, g], n) => {
        const d = cable(lerp(top, f), lerp(bottom, g), c + 3, n, n * 2 + 1);
        cables.push({ key: `t${c}-${n}`, d, c, seed: seedOf(c + 5, n, n * 2 + 1), lit: false, className: "s3-cable is-trunk" });
      });
    });
    links.forEach((row, c) =>
      row.forEach(([a, b]) => {
        const p = at(c, a, b);
        const q = at(c + 1, b);
        if (p && q) cables.push({ key: `r${c}-${a}-${b}`, d: cable(p, q, c, a, b), c, seed: seedOf(c, a, b), lit: false, className: "s3-cable" });
      }),
    );
    traced.forEach((t) => {
      const p = at(t.c, t.a, t.b);
      const q = at(t.c + 1, t.b);
      if (p && q)
        cables.push({ key: `l${t.id}`, d: cable(p, q, t.c, t.a, t.b), c: t.c, seed: seedOf(t.c, t.a, t.b), lit: true, className: "s3-beam" });
    });
  }

  const litSeeds = new Set(cables.filter((k) => k.lit).map((k) => k.seed));
  return (
    <div className={`s3${webgl ? " is-gl" : ""}`} ref={root}>
      {/* flat layers behind the stack: cables pass behind the decks and plug in under the blocks.
          The cables are one static layer; the moving lights are another, on their own compositing
          layer, so a light moving never repaints the cables. */}
      {lines && (
        <>
          <svg className="s3-lines" aria-hidden="true" focusable="false">
            {/* each cable is a conduit like the desktop board's: a dark casing around a red core */}
            {cables.map((k) => (
              <g key={k.key}>
                <path className="s3-cable-case" d={k.d} />
                <path className={k.className} d={k.d} />
                <path className="s3-cable-hl" d={k.d} />
              </g>
            ))}
          </svg>
          <svg className="s3-lines is-live" aria-hidden="true" focusable="false">
            {cables.filter((k) => k.lit || !litSeeds.has(k.seed)).map((k) => (
              <g key={k.key}>{signals(k.d, k.c, k.seed, k.lit)}</g>
            ))}
          </svg>
        </>
      )}
      <div className="s3-scene" ref={scene}>
        <div
          ref={world}
          className="s3-world"
          style={{ width: size.w, height: size.d, "--slab": `${SLAB}px`, "--centre": `${centre}px` } as CSSProperties}
        >
          {units.map((row, col) => {
            const z = (last - col) * size.step + (col === active ? LIFT : 0);
            return (
              <div key={col} className={`s3-deck${col === active ? " is-active" : ""}`} style={{ transform: `translateZ(${z}px)` }}>
                <i className="s3-face is-front">
                  <span>{layers[col].product}</span>
                </i>
                <i className="s3-face is-left" />
                {row.map((u, i) => {
                  const lit = inLine(col, i);
                  const isPick = col === pick.col && i === pick.i;
                  const h = isPick ? RISE.picked : col === active ? RISE.active : lit ? RISE.lit : RISE.rest;
                  return (
                    <button
                      key={u.title}
                      type="button"
                      data-tile={`${col}-${i}`}
                      className={`s3-block${lit ? " is-lit" : ""}${isPick ? " is-picked" : ""}`}
                      style={{ "--h": `${h}px` } as CSSProperties}
                      aria-pressed={isPick}
                      aria-label={`${u.title}, tầng ${layers[col].tab}`}
                      onClick={() => onChoose(col, i)}
                    >
                      <i className="s3-top" />
                      <i className="s3-face is-front" />
                      <i className="s3-face is-left" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>


      {/* flat column: the tiers in a plain stack (nothing to collide); the picked tier opens into
          the unit's label */}
      <div className="s3-column">
        {units.map((_, col) => (
          <div key={col} className={`s3-row${col === active ? " is-active" : ""}`} style={{ top: lines ? `${span(lines.tiles, col)?.r.y ?? 0}px` : `${15 + col * 23}%` }}>
            <button type="button" className="s3-tier" onClick={() => onTier(col)} aria-current={col === active ? "step" : undefined}>
              <strong className="s3-tier-product">{layers[col].product}</strong>
              <span className="s3-tier-caption">{layers[col].tab}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
