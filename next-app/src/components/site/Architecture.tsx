"use client";

import { animate } from "animejs";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { layers } from "./content";
import { FlowDiagram } from "./FlowDiagram";
import { useSite } from "./SiteContext";

const FLOORS = layers.length;
export function Architecture() {
  const { paused, pausedRef } = useSite();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const direction = useRef(1);
  const scene = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [inView, setInView] = useState(false);

  // The diagram's signals run only while the section is on screen.
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = useCallback((i: number) => {
    if (i === activeRef.current) return;
    direction.current = i > activeRef.current ? 1 : -1;
    activeRef.current = i;
    setActive(i);
  }, []);

  /** Scroll geometry of the sticky scene: where it starts and how far one tier is. */
  const geometry = useCallback(() => {
    const el = scene.current;
    const st = stage.current;
    if (!el || !st) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + scrollY,
      slot: (el.offsetHeight - st.offsetHeight) / (FLOORS - 1 + 0.35),
      pinned: rect.top <= 2 && rect.bottom >= innerHeight - 2,
    };
  }, []);

  /** Tabs navigate with the browser's interruptible smooth scroll; wheel/touch stay native. */
  const goTo = useCallback((i: number) => {
    if (matchMedia("(max-width: 720px)").matches) {
      select(i);
      return;
    }
    const g = geometry();
    if (!g || g.slot <= 0) return;
    scrollTo({ top: g.top + g.slot * i, behavior: pausedRef.current ? "instant" : "smooth" });
  }, [geometry, pausedRef, select]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (matchMedia("(max-width: 720px)").matches) {
        scene.current?.classList.remove("is-pinned");
        return;
      }
      const g = geometry();
      if (!g || g.slot <= 0) return;
      const progress = Math.min(FLOORS - 1, Math.max(0, (scrollY - g.top) / g.slot));
      // A deadband prevents panel flicker when a trackpad hovers at a boundary.
      // On touch screens the band is wider, so a tier holds a little past its midpoint before the next
      // one takes over (a delay against momentum scrolling).
      const band = matchMedia("(max-width: 720px)").matches ? 0.68 : 0.56;
      if (Math.abs(progress - activeRef.current) > band) select(Math.round(progress));
      // Lets narrow screens move page fixtures (back-to-top) out of the pinned scene's way.
      scene.current?.classList.toggle("is-pinned", g.pinned);
      const bar = scene.current?.querySelector<HTMLElement>(".floor-progress i");
      bar?.style.setProperty("transform", `scaleX(${(progress + 1) / FLOORS})`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    if (scene.current) resize.observe(scene.current);
    if (stage.current) resize.observe(stage.current);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [geometry, select]);

  // Panel copy enters from the direction of travel.
  const shown = useRef(0);
  useEffect(() => {
    if (shown.current === active) return;
    shown.current = active;
    const el = panel.current;
    if (!el || paused) return;
    const motion = animate(el.querySelectorAll("p"), {
      opacity: [0.65, 1],
      y: [direction.current * 6, 0],
      duration: 220,
      ease: "outCubic",
    });
    return () => {
      motion.complete();
    };
  }, [active, paused]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowDown: (i + 1) % FLOORS, ArrowUp: (i + FLOORS - 1) % FLOORS, Home: 0, End: FLOORS - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    goTo(next);
    tabs.current[next]?.focus({ preventScroll: true });
  };

  const layer = layers[active];

  return (
    <section ref={scene} className="architecture-scroll" id="architecture" aria-label="Khám phá bốn tầng tổ chức">
      <div ref={stage} className="architecture wrap">
        <div className="architecture-art is-flow" data-floor={layer.floor}>
          <FlowDiagram active={active} onSelect={goTo} running={inView && !paused} />
          <div className="art-caption">
            <span>GEO AGENT / LUỒNG XỬ LÝ</span>
            <span>HUMAN × INTELLIGENCE</span>
          </div>
        </div>
        <div className="architecture-copy">
          <h2>
            Một hệ thống.{" "}
            <br />
            <span>4 tầng tổ chức.</span>
          </h2>
          <p className="intro">
            Từ định hướng đến hành động.
            <br />
            Mỗi tầng một vai trò. Cùng một mục tiêu.
          </p>
          {/* The four tiers as one readable list: each row names the tier and its GEO product; the
              tier in view opens under its name with its headline and description, full width. */}
          <div className="layer-layout tier-list" role="tablist" aria-label="Tầng tổ chức" aria-orientation="vertical">
            {layers.map((l, i) => (
              <div key={l.tab} className={`tier-item${active === i ? " is-active" : ""}`}>
                <button
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`tab-${i}`}
                  role="tab"
                  className="tier-head"
                  aria-selected={active === i}
                  aria-controls="layer-panel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <span className="tier-names">
                    <strong>{l.product}</strong>
                    <span>{l.tab}</span>
                  </span>
                </button>
                {active === i && (
                  <div ref={panel} id="layer-panel" className="tier-body" role="tabpanel" aria-labelledby={`tab-${i}`}>
                    <p>{l.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="scroll-cue">
            <span className="floor-progress">
              <i />
            </span>
            <span id="floor-status">0{active + 1} / 04 — <span className="floor-cue-desktop">Cuộn để chuyển tầng</span><span className="floor-cue-mobile">Chạm tên tầng để khám phá</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
