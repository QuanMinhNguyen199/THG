"use client";

// A simulated product clip: a GEO Agent window that plays one scripted task, step by step, then
// loops, like a short screen recording. Everything shown is generic and labelled as a simulation;
// the task wording is the site's existing description of what GEO Agent does for an office. It
// plays only while on screen and holds on its last frame when motion is reduced.
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteContext";

const STEPS = [
  { at: 0, who: "in", text: "Công văn đến: Đề nghị báo cáo tiến độ hồ sơ quý III." },
  { at: 1, who: "agent", text: "Đang đọc văn bản…", busy: true },
  { at: 2, who: "agent", text: "Bóc tách 3 nhiệm vụ từ công văn đến." },
  { at: 3, who: "agent", text: "Đề xuất người phụ trách cho từng nhiệm vụ." },
  { at: 4, who: "human", text: "Cán bộ xem xét và phê duyệt." },
] as const;
const STEP_MS = 1500;
const HOLD = 3; // steps the finished clip holds before looping

export function HomeDemo() {
  const { paused } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(STEPS.length - 1);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) {
      setStep(STEPS.length - 1);
      return;
    }
    setStep(0);
    let n = 0;
    const id = setInterval(() => {
      n = (n + 1) % (STEPS.length + HOLD);
      setStep(Math.min(n, STEPS.length - 1));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [paused, inView]);

  const progress = (step + 1) / STEPS.length;

  return (
    <div className="demo-clip" ref={root} role="img" aria-label="Mô phỏng GEO Agent tiếp nhận công văn, bóc tách nhiệm vụ và chờ cán bộ phê duyệt">
      <div className="demo-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>GEO Agent · Văn phòng</span>
      </div>
      <ol className="demo-feed" aria-hidden="true">
        {STEPS.map((s, i) => (
          <li key={s.at} className={`demo-msg is-${s.who}${i <= step ? " is-shown" : ""}${"busy" in s && i === step ? " is-busy" : ""}`}>
            <span className="demo-who">{s.who === "in" ? "Văn bản" : s.who === "agent" ? "GEO Agent" : "Cán bộ"}</span>
            <p>{s.text}</p>
            {s.at === 2 && (
              <div className="demo-tasks">
                <span>Tổng hợp số liệu</span>
                <span>Rà soát hồ sơ</span>
                <span>Soạn báo cáo</span>
              </div>
            )}
            {s.at === 4 && <span className="demo-approve">Phê duyệt</span>}
          </li>
        ))}
      </ol>
      <div className="demo-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
