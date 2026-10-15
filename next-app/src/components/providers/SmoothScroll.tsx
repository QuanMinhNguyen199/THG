"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  // Read once on the client; Lenis is created in an effect, so this never affects SSR markup.
  const [smooth] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    // GSAP's ticker drives Lenis, so smooth scrolling and ScrollTrigger update in the same frame.
    const raf = (time: number) => lenis.raf(time * 1000);
    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      offScroll();
      gsap.ticker.remove(raf);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.1, smoothWheel: smooth, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}
