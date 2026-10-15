"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { tiers } from "@/content/site";

const GAP = 78; // vertical (translateZ) distance between stacked tiers, px
const DROP = 520; // how far above its slot each tier starts, px
const DROP_SLOT = 1.3; // timeline seconds per tier: 1s fall + 2 × 0.15s settle bounce
const STACK_HEIGHT = GAP * (tiers.length - 1) + 40;

/** Laser positions on the card plane, relative to the card centre (px). */
const LASERS = [
  { x: 0, y: 0, dir: 1 },
  { x: -96, y: -96, dir: -1 },
  { x: 96, y: 96, dir: 1 },
  { x: 96, y: -96, dir: -1 },
];

export function LayerStack() {
  const root = useRef<HTMLElement>(null);
  const [scrollTier, setScrollTier] = useState(tiers.length - 1);
  const [hoverTier, setHoverTier] = useState<number | null>(null);
  const active = hoverTier ?? scrollTier;

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-tier]");
      // Final resting heights: Governance (index 0) sits on top of the stack.
      const restZ = (i: number) => (tiers.length - 1 - i) * GAP;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Lasers run on their own clock, independent of scroll scrubbing.
        gsap.utils.toArray<HTMLElement>("[data-pulse]").forEach((pulse, i) => {
          const up = LASERS[i % LASERS.length].dir > 0;
          gsap.fromTo(
            pulse,
            { yPercent: up ? 100 : -100 },
            { yPercent: up ? -100 : 100, duration: 1.6 + i * 0.25, ease: "none", repeat: -1, delay: i * 0.3 },
          );
        });

        gsap.set(cards, { z: (i) => restZ(i) + DROP, opacity: 0 });
        // Fade each laser itself: opacity on a preserve-3d parent would flatten the 3D stack.
        gsap.set("[data-laser]", { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.in" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
          // Read the (scrub-smoothed) timeline clock, so the highlight follows what is on screen.
          onUpdate() {
            const landed = Math.floor((tl.time() + 0.001) / DROP_SLOT);
            setScrollTier(tiers.length - Math.min(tiers.length, Math.max(1, landed)));
          },
        });

        // Drop bottom-up so every tier lands on the one beneath it.
        [...cards].reverse().forEach((card) => {
          const i = cards.indexOf(card);
          tl.to(card, { z: restZ(i), opacity: 1, duration: 1 }).to(
            card,
            { z: restZ(i) + 10, duration: 0.15, ease: "power1.out", yoyo: true, repeat: 1 },
          );
        });
        tl.to("[data-laser]", { opacity: 1, duration: 0.6, ease: "none", stagger: 0.1 });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { z: (i) => restZ(i), opacity: 1 });
      });

      // Pinning adds scroll height; recalculate once fonts settle the layout.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root },
  );

  return (
    <section
      id="layers"
      ref={root}
      aria-labelledby="layers-title"
      className="relative flex min-h-svh items-center overflow-hidden px-6 py-10 md:px-12 md:py-20"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12">
        {/* On phones the column dissolves into the grid so the stage can sit between heading and copy. */}
        <div className="max-md:contents">
          <p className="font-display text-xs md:mb-4 tracking-[0.3em] text-crimson-bright">KIẾN TRÚC</p>
          <h2 id="layers-title" className="font-display text-4xl font-medium leading-tight md:text-5xl">
            Một hệ thống.
            <br />
            <span className="text-crimson-bright">4 tầng tổ chức.</span>
          </h2>

          {/* Hover targets only matter with a pointer; on phones the stack itself carries the sequence. */}
          <ul className="mt-10 hidden border-l border-white/10 md:block">
            {tiers.map((tier, i) => (
              <li key={tier.code}>
                <button
                  type="button"
                  aria-pressed={active === i}
                  onPointerEnter={() => setHoverTier(i)}
                  onPointerLeave={() => setHoverTier(null)}
                  onFocus={() => setHoverTier(i)}
                  onBlur={() => setHoverTier(null)}
                  className={`relative block w-full py-3 pl-6 text-left text-base transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-crimson-bright ${
                    active === i ? "text-white" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute -left-px top-2 h-[calc(100%-1rem)] w-0.5 bg-crimson-bright transition-[opacity,box-shadow] duration-300 ${
                      active === i ? "opacity-100 shadow-[0_0_12px_#c1152b]" : "opacity-0"
                    }`}
                  />
                  <span className="mr-4 font-display text-xs text-white/40">0{i + 1}</span>
                  {tier.name}
                </button>
              </li>
            ))}
          </ul>

          <div aria-live="polite" className="mt-6 min-h-28 max-md:order-last">
            <h3 className="text-lg font-medium">{tiers[active].title}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{tiers[active].body}</p>
          </div>
        </div>

        {/* Isometric stage: the inner plane is rotated, cards stack along its Z axis. */}
        <div className="relative h-[300px] [perspective:1800px] md:h-[560px]" aria-hidden>
          <div className="absolute left-1/2 top-[58%] size-0 scale-[0.6] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-42deg)] md:scale-100">
            {tiers.map((tier, i) => (
              <div
                key={tier.code}
                data-tier
                onPointerEnter={() => setHoverTier(i)}
                onPointerLeave={() => setHoverTier(null)}
                className="absolute -left-32 -top-32 size-64"
              >
                <div
                  className={`relative size-full rounded-xl border backdrop-blur-md transition-[filter,background-color,border-color] duration-500 ${
                    active === i
                      ? "border-crimson-bright/90 bg-crimson/15 [filter:drop-shadow(0_0_26px_rgba(193,21,43,0.85))]"
                      : "border-white/15 bg-white/[0.04] [filter:brightness(0.75)]"
                  }`}
                >
                  <div className="absolute inset-3 rounded-lg bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <span className="absolute bottom-4 left-4 font-mono text-[10px] tracking-[0.2em] text-white/70">
                    0{i + 1} / {tier.code}
                  </span>
                  <span
                    className={`absolute right-4 top-4 size-2 rounded-full ${
                      active === i ? "bg-crimson-bright shadow-[0_0_10px_#c1152b]" : "bg-white/30"
                    }`}
                  />
                </div>
              </div>
            ))}

            {/* Lasers stand upright along the stack (rotateX(-90deg) turns height into Z). */}
            <div className="[transform-style:preserve-3d]">
              {LASERS.map((laser, i) => (
                <div
                  key={i}
                  data-laser
                  className="absolute w-0.5 origin-bottom overflow-hidden bg-crimson-bright/15"
                  style={{
                    height: STACK_HEIGHT,
                    left: laser.x - 1,
                    top: laser.y - STACK_HEIGHT,
                    transform: "rotateX(-90deg)",
                  }}
                >
                  <div
                    data-pulse
                    className="h-1/3 w-full bg-[linear-gradient(transparent,#e8475b,transparent)] shadow-[0_0_12px_#c1152b]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
