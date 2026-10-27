"use client";

// The home page's four-tier picture: the same four floors as the GEOagents architecture, drawn as
// thin stacked decks with each tier's units standing on it (3, 3, 5 and 4, as on GEOagents). One
// tier is in focus at a time: its deck lifts, takes a red perimeter and a red focal unit, and the
// cables down to the next tier light. Focus moves on its own while the picture is on screen, and
// follows the pointer over the tier list beside it. Paused or reduced motion holds the first tier.
// Plain SVG: no text sits on the tilted geometry; the focused tier is named in a flat caption.
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteContext";

const UNITS = [3, 3, 5, 4];
const STEP_MS = 2600;

// Deck geometry in floor units, projected with a shallow top-down view so four decks fit one
// above another: screen x = (x − z)·C, screen y = (x + z)·K − height.
const W = 300;
const D = 190;
const C = 0.866;
const K = 0.3;
const SLAB = 5;
const GAP = 92;
const OX = 215;
const OY = 40;
const UNIT_H = 14;

type P = [number, number];
const at = (x: number, z: number, y: number, deck: number): P => [OX + (x - z) * C, OY + deck * GAP + (x + z) * K - y];
const poly = (pts: P[]) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");

/** The top and the two visible sides of a box on a deck. */
function box(x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, deck: number) {
  return {
    top: poly([at(x0, z0, y1, deck), at(x1, z0, y1, deck), at(x1, z1, y1, deck), at(x0, z1, y1, deck)]),
    front: poly([at(x0, z1, y1, deck), at(x1, z1, y1, deck), at(x1, z1, y0, deck), at(x0, z1, y0, deck)]),
    side: poly([at(x1, z0, y1, deck), at(x1, z1, y1, deck), at(x1, z1, y0, deck), at(x1, z0, y0, deck)]),
  };
}

/** Unit footprints along a deck's long side, centred in depth. */
function units(n: number) {
  const margin = 26;
  const gap = 12;
  const w = (W - margin * 2 - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => {
    const x0 = margin + i * (w + gap);
    return { x0, x1: x0 + w, z0: D * 0.3, z1: D * 0.7, mid: x0 + w / 2 };
  });
}

export function HomeTiers({ names }: { names: { product: string; label: string }[] }) {
  const { paused } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    // The tier list sits in the copy column beside this picture.
    const items = [...(el.closest("section")?.querySelectorAll<HTMLLIElement>(".home-tiers li") ?? [])];
    const off = items.map((li, i) => {
      const enter = () => setHover(i);
      const leave = () => setHover(null);
      li.addEventListener("pointerenter", enter);
      li.addEventListener("pointerleave", leave);
      return () => {
        li.removeEventListener("pointerenter", enter);
        li.removeEventListener("pointerleave", leave);
      };
    });
    return () => {
      io.disconnect();
      off.forEach((f) => f());
    };
  }, []);

  const still = paused || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (!inView || still || hover !== null) return;
    const id = setInterval(() => setActive((a) => (a + 1) % UNITS.length), STEP_MS);
    return () => clearInterval(id);
  }, [inView, still, hover]);

  const focus = hover ?? active;

  // Mark the focused tier in the list too.
  useEffect(() => {
    const items = root.current?.closest("section")?.querySelectorAll(".home-tiers li");
    items?.forEach((li, i) => li.classList.toggle("is-focus", i === focus));
  }, [focus]);

  const decks = UNITS.map(units);
  // Cables: from each unit straight up to the underside of the deck above. Drawn over the lower
  // deck and under the upper one, so they read as running between the two.
  const cables = (d: number) =>
    decks[d + 1].map((u, i) => {
      const a = at(u.mid, D * 0.5, UNIT_H, d + 1);
      const b = at(u.mid, D * 0.5, -SLAB, d);
      return <path key={i} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`} />;
    });

  return (
    <div className="home-core-stage home-tiers-stage" ref={root}>
      <svg className="tiers-art" viewBox="0 0 520 480" role="img" aria-label="Bốn tầng GEOagents xếp chồng: Quản trị, Quản lý, Thực thi, Dịch vụ">
        {/* lower decks first, so each deck covers the one beneath it */}
        {[...decks.keys()].reverse().map((d) => {
          const slab = box(0, 0, W, D, -SLAB, 0, d);
          const on = d === focus;
          const focal = Math.floor(decks[d].length / 2);
          return (
            <g key={d}>
              {d < decks.length - 1 && <g className={`tiers-cables${on ? " is-lit" : ""}`}>{cables(d)}</g>}
              <g className={`tiers-deck${on ? " is-focus" : ""}`}>
                <polygon className="deck-side" points={slab.side} />
                <polygon className="deck-front" points={slab.front} />
                <polygon className="deck-top" points={slab.top} />
                {decks[d].map((u, i) => {
                  const b = box(u.x0, u.z0, u.x1, u.z1, 0, UNIT_H, d);
                  return (
                    <g key={i} className={`tiers-unit${on && i === focal ? " is-focal" : ""}`}>
                      <polygon className="unit-side" points={b.side} />
                      <polygon className="unit-front" points={b.front} />
                      <polygon className="unit-top" points={b.top} />
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
      <p className="tiers-caption" aria-live="off">
        <span>{String(focus + 1).padStart(2, "0")} / 04</span>
        <strong>{names[focus]?.product}</strong>
        {names[focus]?.label}
      </p>
    </div>
  );
}
