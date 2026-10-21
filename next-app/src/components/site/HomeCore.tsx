"use client";

// The home page's 3D showcase: the GEO core model (hero/CoreScene), tilting with the pointer over
// its whole panel. It loads only near the viewport, runs only while visible, freezes for reduced
// motion, and devices without a real GPU get a still image instead (stackRenderer).
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useSite } from "./SiteContext";
import { chooseRenderer } from "./stackRenderer";

const CoreScene = dynamic(() => import("../hero/CoreScene"), { ssr: false });

export function HomeCore() {
  const { paused } = useSite();
  const panel = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);

  useEffect(() => setGl(chooseRenderer() === "gl"), []);
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="home-core-stage" ref={panel}>
      {gl === false && <img className="home-core-still" src={asset("/media/case-city.jpg")} alt="" />}
      {gl && near && <CoreScene eventSource={panel} frameloop={inView && !paused ? "always" : "demand"} />}
      <span className="home-core-hint" aria-hidden="true">
        Di chuột để xoay mô hình
      </span>
    </div>
  );
}
