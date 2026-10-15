"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useSite } from "./SiteContext";

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

const MP4 = 'video/mp4; codecs="avc1.640028"';
const WEBM = 'video/webm; codecs="vp9"';

/** Clicks on these keep their own behaviour and show the normal pointer. */
const INTERACTIVE = "a,button";

/**
 * Full-bleed video stage (Mercedes-style). Over the video a custom cursor follows the mouse and
 * shows the play/pause state; clicking the stage toggles playback. A real button in the bottom bar
 * offers the same control to keyboard and touch users.
 */
export function Hero() {
  const { paused: motionPaused } = useSite();
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cursorOn, setCursorOn] = useState(false);
  const [feedback, setFeedback] = useState<{ id: number; action: "play" | "pause"; x: number; y: number } | null>(null);
  const feedbackElement = useRef<HTMLDivElement>(null);
  const feedbackSequence = useRef(0);
  // An explicit play/pause from the viewer wins over the automatic rules until motion settings change.
  const choice = useRef<"play" | "pause" | null>(null);
  const inView = useRef(true);

  const visibleNow = useCallback(() => {
    const rect = section.current?.getBoundingClientRect();
    return !!rect && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
  }, []);

  const sync = useCallback(() => {
    const v = video.current;
    if (!v) return;
    const wanted = choice.current === "play";
    if (wanted && inView.current && visibleNow() && !document.hidden) {
      if (v.paused) v.play().catch(() => setPlaying(!v.paused));
    }
    else v.pause();
  }, [visibleNow]);

  // Start paused and reset to paused when site-wide motion settings change.
  useEffect(() => {
    choice.current = null;
    sync();
  }, [motionPaused, sync]);

  // Stop decoding while the hero is offscreen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [sync]);

  // Some browsers refuse the first play() (power saving, data saver, a slow first load). Retry when
  // the video can play, and on the visitor's first interaction, as long as playback is still wanted.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // Read the actual media state when the component mounts.
    setPlaying(!v.paused);
    const retry = () => {
      if (v.paused) sync();
    };
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const once = (event: Event) => {
      events.forEach((e) => removeEventListener(e, once));
      // An explicit hero interaction owns playback; a retry must not play just before its pause/play click.
      if (event.target instanceof Element && event.target.closest(".hero")) return;
      retry();
    };
    v.addEventListener("canplay", retry);
    events.forEach((e) => addEventListener(e, once, { passive: true }));
    return () => {
      v.removeEventListener("canplay", retry);
      events.forEach((e) => removeEventListener(e, once));
    };
  }, [sync]);

  const toggle = useCallback((event?: MouseEvent<HTMLElement>) => {
    const v = video.current;
    const rect = section.current?.getBoundingClientRect();
    if (!v || !rect) return;
    const action = v.paused ? "play" : "pause";
    choice.current = action;
    sync();
    const directStageClick = event && event.detail > 0 && !(event.target as Element).closest(INTERACTIVE);
    setFeedback({
      id: ++feedbackSequence.current,
      action,
      x: directStageClick ? event.clientX - rect.left : rect.width / 2,
      y: directStageClick ? event.clientY - rect.top : rect.height / 2,
    });
  }, [sync]);

  useEffect(() => {
    const element = feedbackElement.current;
    if (!feedback || !element) return;
    const reduced = motionPaused || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = element.animate(reduced ? [
      { opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 },
    ] : [
      { opacity: 0, transform: "translate(-50%, -50%) scale(0.8)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.2 },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.12)" },
    ], { duration: reduced ? 180 : 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" });
    const ring = element.querySelector(".hero-feedback-ring");
    const pulse = !reduced ? ring?.animate([
      { opacity: 0.8, transform: "scale(0.85)" }, { opacity: 0, transform: "scale(1.5)" },
    ], { duration: 500, easing: "ease-out", fill: "both" }) : undefined;
    if (ring instanceof HTMLElement) ring.hidden = reduced;
    animation.onfinish = () => setFeedback(current => current?.id === feedback.id ? null : current);
    return () => { animation.onfinish = null; animation.cancel(); pulse?.cancel(); };
  }, [feedback, motionPaused]);

  // Custom cursor: eased toward the pointer; only for fine pointers over the bare stage.
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!cursorOn) return;
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.22;
      pos.current.y += (target.current.y - pos.current.y) * 0.22;
      if (cursor.current) cursor.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursorOn]);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !section.current) return;
    const r = section.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const overControl = !!(e.target as Element).closest(INTERACTIVE);
    if (!cursorOn && !overControl) pos.current = { x, y }; // appear under the pointer, not fly in
    target.current = { x, y };
    setCursorOn(!overControl);
  };
  const onStageClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as Element).closest(INTERACTIVE)) return;
    toggle(e);
  };

  const label = playing ? "Tạm dừng" : "Phát";

  return (
    // The stage click mirrors the visible toggle button, which is the keyboard-accessible control.
    <section
      ref={section}
      className={`hero${cursorOn ? " has-cursor" : ""}${feedback ? " is-video-feedback" : ""}`}
      id="geoagents"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setCursorOn(false)}
      onClick={onStageClick}
    >
      <video
        ref={video}
        className="hero-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/hero-poster.jpg"
        aria-hidden="true"
        onPlay={() => {
          if (!visibleNow() || !inView.current || document.hidden) { video.current?.pause(); return; }
          setPlaying(true);
        }}
        onPause={() => setPlaying(false)}
      >
        {/* H.264 first (widest support); VP9 WebM for browsers without H.264. Phones get 720p. */}
        <source src="/media/hero-720.mp4" type={MP4} media="(max-width: 900px)" />
        <source src="/media/hero-720.webm" type={WEBM} media="(max-width: 900px)" />
        <source src="/media/hero-1080.mp4" type={MP4} />
        <source src="/media/hero-1080.webm" type={WEBM} />
      </video>
      <div className="hero-shade" />

      <div className="hero-copy">
        <h1>
          GEO<span>agents</span>
          <i>®</i>
        </h1>
        <p className="hero-subtitle">WORKFORCE FOR MISSION-CRITICAL OPERATIONS</p>
        <p className="hero-description">
          Không chỉ là công cụ hỏi đáp. Đây là đội ngũ AI đồng hành cùng tổ chức — từ quản trị, quản lý đến
          thực thi. Dữ liệu thuộc về bạn. Quyết định nằm trong tay bạn.
        </p>
        <div className="hero-actions">
          <a className="button" href="#architecture">
            Khám phá GEOagents{" "}
            <svg viewBox="0 0 24 24">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </a>
          <a className="button button-ghost" href="#cta">
            Đặt lịch tư vấn
          </a>
        </div>
      </div>

      <div className="hero-bottom">
        <span>
          <button
            type="button"
            className="hero-toggle"
            aria-pressed={!playing}
            aria-label={playing ? "Tạm dừng video" : "Phát video"}
            onClick={toggle}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="hero-status"><i className="status-dot" /> AI CHỦ QUYỀN. CON NGƯỜI LÀM CHỦ.</span>
        </span>
        <a href="#metrics">
          CUỘN ĐỂ KHÁM PHÁ <span className="scroll-line" />
        </a>
      </div>

      <div ref={cursor} className={`hero-cursor${cursorOn ? " is-visible" : ""}`} aria-hidden="true">
        <span className="hero-cursor-ring">{playing ? <PauseIcon /> : <PlayIcon />}</span>
        <span className="hero-cursor-label">{label}</span>
      </div>
      {feedback && (
        <div key={feedback.id} ref={feedbackElement} className="hero-click-feedback" data-action={feedback.action}
          style={{ left: feedback.x, top: feedback.y }} aria-hidden="true">
          <span className="hero-feedback-ring" />
          {feedback.action === "pause" ? <PauseIcon /> : <PlayIcon />}
        </div>
      )}
    </section>
  );
}
