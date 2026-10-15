"use client";

import { animate } from "animejs";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createTowerState, drawTower } from "./art";
import type { StageColors } from "./DiveScene";
import { layers } from "./content";
import { Lines } from "./Sections";
import { useSite } from "./SiteContext";
import { useArtCanvas } from "./useArtCanvas";

// The AI network view is WebGL; it only loads when a visitor picks it.
const DiveScene = dynamic(() => import("./DiveScene"), { ssr: false });
const STAGE_FALLBACK: StageColors = { ink: "#8a8a8f", accent: "#c1152b", node: "#cbd5df", pulse: "#ffffff" };

type ArtMode = "tower" | "dive";
const MODE_KEY = "geo-layers-mode";
const FLOORS = layers.length;
export function Architecture() {
  const { theme, paused, pausedRef, accentRef, inkRef } = useSite();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const direction = useRef(1);
  const scene = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tower = useRef(createTowerState(FLOORS));
  const coreProgress = useRef(0);
  const [mode, setMode] = useState<ArtMode>("tower");
  const [inView, setInView] = useState(false);
  const art = useRef<HTMLDivElement>(null);
  const [stageColors, setStageColors] = useState<StageColors>(STAGE_FALLBACK);

  // The dive stage takes its palette from the concept (CSS tokens on the art panel).
  useEffect(() => {
    const el = art.current;
    if (!el || mode !== "dive") return;
    const cs = getComputedStyle(el);
    const read = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    setStageColors({
      ink: read("--stage-ink", STAGE_FALLBACK.ink),
      accent: read("--stage-accent", STAGE_FALLBACK.accent),
      node: read("--stage-node", STAGE_FALLBACK.node),
      pulse: read("--stage-pulse", STAGE_FALLBACK.pulse),
    });
  }, [theme, mode]);

  // Restore the chosen view (?layers=dive wins, then the saved choice).
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = new URLSearchParams(location.search).get("layers") ?? localStorage.getItem(MODE_KEY);
    } catch {}
    if (saved === "dive") setMode("dive");
  }, []);
  const chooseMode = (next: ArtMode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {}
    const url = new URL(location.href);
    if (next === "dive") url.searchParams.set("layers", "dive");
    else url.searchParams.delete("layers");
    history.replaceState(null, "", url);
  };

  // The WebGL view renders frames only while the section is on screen.
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useArtCanvas(
    canvas,
    (surface, time) => {
      const state = tower.current;
      state.ink = inkRef.current;
      state.active = activeRef.current;
      drawTower(surface, time, (alpha = "") => accentRef.current + alpha, state, pausedRef.current);
    },
    () => {
      const s = tower.current;
      return `${activeRef.current}:${s.angle.toFixed(4)}:${s.emphasis.map((e) => e.toFixed(3)).join()}:${accentRef.current}:${inkRef.current}`;
    },
  );

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
    const g = geometry();
    if (!g || g.slot <= 0) return;
    scrollTo({ top: g.top + g.slot * i, behavior: pausedRef.current ? "instant" : "smooth" });
  }, [geometry, pausedRef]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const g = geometry();
      if (!g || g.slot <= 0) return;
      const progress = Math.min(FLOORS - 1, Math.max(0, (scrollY - g.top) / g.slot));
      coreProgress.current = progress;
      // A narrow deadband prevents panel flicker when a trackpad hovers at a boundary.
      if (Math.abs(progress - activeRef.current) > 0.56) select(Math.round(progress));
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
    const motion = animate(el.querySelectorAll(".panel-symbol,h3,p"), {
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
    <section ref={scene} className={`architecture-scroll${mode === "dive" ? " is-core-view" : ""}`} id="architecture" aria-label="Khám phá bốn tầng tổ chức">
      <div ref={stage} className="architecture wrap">
        <div
          ref={art}
          className={`architecture-art${mode === "dive" ? " is-dive" : ""}`}
          data-floor={`${String(active + 1).padStart(2, "0")} / ${layer.floor}`}
        >
          <div className="layers-mode" role="group" aria-label="Kiểu minh họa">
            <button type="button" aria-pressed={mode === "tower"} onClick={() => chooseMode("tower")}>
              Tháp 4 tầng
            </button>
            <button type="button" aria-pressed={mode === "dive"} onClick={() => chooseMode("dive")}>
              GEO Core
            </button>
          </div>
          {/* The tower canvas stays mounted (hidden) so switching back is instant. */}
          <canvas ref={canvas} id="globe" aria-label="Tháp bốn tầng tổ chức xoay quanh lõi GEO" />
          {mode === "dive" && (
            <div
              className="dive-stage"
              role="img"
              aria-label={`Minh họa GEO Core, tầng ${active + 1} trên 4: ${layer.tab}`}
            >
              <DiveScene active={active} progress={coreProgress} still={paused} visible={inView} colors={stageColors} />
            </div>
          )}
          <div className="art-caption">
            <span>{mode === "dive" ? "GEO CORE / AI NATIVE" : "GEO CORE"}</span>
            <span>HUMAN × INTELLIGENCE</span>
          </div>
        </div>
        <div className="architecture-copy">
          <h2>
            Một hệ thống.
            <br />
            <span>4 tầng tổ chức.</span>
          </h2>
          <p className="intro">
            Từ định hướng đến hành động.
            <br />
            Mỗi tầng một vai trò. Cùng một mục tiêu.
          </p>
          <div className="layer-layout">
            <div className="tabs" role="tablist" aria-label="Tầng tổ chức" aria-orientation="vertical">
              {layers.map((l, i) => (
                <button
                  key={l.tab}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  id={`tab-${i}`}
                  role="tab"
                  aria-selected={active === i}
                  aria-controls="layer-panel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <span>0{i + 1}</span>
                  {l.tab}
                </button>
              ))}
            </div>
            <div ref={panel} id="layer-panel" role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0}>
              <span className="panel-symbol">↗</span>
              <h3>
                <Lines lines={layer.title} />
              </h3>
              <p>{layer.body}</p>
            </div>
          </div>
          <div className="scroll-cue">
            <span className="floor-progress">
              <i />
            </span>
            <span id="floor-status">0{active + 1} / 04 — Cuộn để chuyển tầng</span>
          </div>
        </div>
      </div>
    </section>
  );
}
