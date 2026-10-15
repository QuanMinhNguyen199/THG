"use client";

import { animate, utils, type JSAnimation } from "animejs";
import { useEffect, useRef } from "react";
import { ContactList } from "./Contacts";
import { useSite } from "./SiteContext";

export function Footer() {
  const { paused, togglePaused } = useSite();
  const clip = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  // The wordmark waits below its clip edge and rises with a small overshoot once the page end is reached.
  useEffect(() => {
    const box = clip.current;
    const el = word.current;
    if (!box || !el) return;
    let raised: boolean | null = null;
    let motion: JSAnimation | undefined;
    let frame = 0;

    const set = (next: boolean) => {
      if (next === raised) return;
      raised = next;
      motion?.cancel();
      motion = next
        ? animate(el, { y: "0%", duration: 900, ease: "outBack(1.6)" })
        : animate(el, { y: "105%", duration: 450, ease: "inCubic" });
    };
    const update = () => {
      frame = 0;
      const r = box.getBoundingClientRect();
      // Hysteresis keeps the word from flickering when the scroll position hovers near the end.
      if (r.bottom <= innerHeight + 4) set(true);
      else if (r.bottom > innerHeight + r.height * 0.5) set(false);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    if (paused) {
      utils.set(el, { y: "0%" });
      return;
    }
    if (box.getBoundingClientRect().bottom > innerHeight + 4) {
      utils.set(el, { y: "105%" });
      raised = false;
    }
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      motion?.cancel();
    };
  }, [paused]);

  return (
    <footer id="about">
      <div className="wrap footer-top">
        <p>
          Công nghệ có tầm nhìn.
          <br />
          <span>Vận hành có chủ quyền.</span>
        </p>
      </div>
      <ContactList className="wrap footer-contacts" />
      <div className="wrap footer-bottom">
        <span>© 2026 THEHEGEO</span>
        <span>HUMAN-LED. AI-POWERED.</span>
        <button id="motion" aria-pressed={paused} onClick={togglePaused}>
          {paused ? "Bật chuyển động " : "Tạm dừng chuyển động "}
          <span>{paused ? "▷" : "Ⅱ"}</span>
        </button>
      </div>
      <div ref={clip} className="footer-word-clip" aria-hidden="true">
        <div ref={word} className="footer-word">
          THEHEGEO
        </div>
      </div>
    </footer>
  );
}
