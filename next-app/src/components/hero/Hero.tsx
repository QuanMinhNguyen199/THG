"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

// WebGL never renders on the server; the CSS glow stands in while the chunk loads or if WebGL fails.
const CoreScene = dynamic(() => import("./CoreScene"), {
  ssr: false,
  loading: () => <CoreFallback />,
});

function CoreFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 m-auto size-40 rounded-full bg-crimson-bright/40 blur-3xl"
    />
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(true);

  // Stop rendering WebGL frames once the hero scrolls away.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const el = headline.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(el, {
          type: "words,chars",
          autoSplit: true, // re-splits after font load / resize and replays from the right state
          onSplit(self) {
            el.setAttribute("data-split-ready", "");
            return gsap.from(self.chars, {
              opacity: 0,
              filter: "blur(14px)",
              yPercent: 35,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.035,
              delay: 0.15,
              clearProps: "filter", // leave no blur filter on idle text
            });
          },
        });

        gsap.from("[data-hero-fade]", {
          opacity: 0,
          y: 24,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.75,
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.setAttribute("data-split-ready", "");
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-svh items-center overflow-hidden px-6 py-28 md:px-12"
    >
      {/* Ambient red wash behind the 3D core */}
      <div
        aria-hidden
        className="absolute right-[-10%] top-1/2 -z-10 size-[60vmax] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(193,21,43,0.18),transparent_60%)]"
      />

      <div className="absolute inset-0 -z-10 md:left-[38%]">
        <CoreScene eventSource={root} frameloop={inView && !reduced ? "always" : "demand"} />
      </div>

      <div className="relative max-w-2xl">
        <p data-hero-fade className="mb-6 text-xs tracking-[0.3em] text-white/60">
          WORKFORCE FOR MISSION-CRITICAL OPERATIONS
        </p>
        <h1
          ref={headline}
          data-split
          className="font-display text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl"
        >
          GEO<span className="text-crimson-bright">agents</span>
        </h1>
        <p data-hero-fade className="mt-8 max-w-md text-base leading-relaxed text-white/65">
          Không chỉ là công cụ hỏi đáp. Đây là đội ngũ AI đồng hành cùng tổ chức — từ quản trị,
          quản lý đến thực thi. Dữ liệu thuộc về bạn. Quyết định nằm trong tay bạn.
        </p>
        <a
          data-hero-fade
          href="#layers"
          className="mt-10 inline-flex items-center gap-4 bg-crimson px-6 py-4 text-sm font-medium transition-[box-shadow,background-color] duration-300 hover:bg-[#9e1023] hover:shadow-[0_0_32px_rgba(193,21,43,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson-bright"
        >
          Khám phá GEOagents <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
