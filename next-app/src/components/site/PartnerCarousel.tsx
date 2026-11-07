"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function PartnerCarousel({ children }: { children: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const update = () => setEdges({
      start: element.scrollLeft <= 1,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
    });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, []);

  const move = (direction: number) => {
    const element = row.current;
    if (!element) return;
    const list = element.querySelector("ul");
    const gap = list ? parseFloat(getComputedStyle(list).columnGap) || 0 : 0;
    element.scrollBy({ left: direction * (element.clientWidth + gap), behavior: "instant" });
  };

  return (
    <div className="partner-carousel">
      <button type="button" className="partner-nav" aria-label="Xem đối tác phía trước" aria-controls={id} disabled={edges.start} onClick={() => move(-1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
      </button>
      <div className="partner-marquee" id={id} ref={row}>{children}</div>
      <button type="button" className="partner-nav" aria-label="Xem đối tác tiếp theo" aria-controls={id} disabled={edges.end} onClick={() => move(1)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
      </button>
    </div>
  );
}
