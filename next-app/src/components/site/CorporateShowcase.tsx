"use client";

// Product-in-action pieces for the Corporate concept: a live demo panel in the hero, the three
// steps as a scroll-pinned flow, the data-sovereignty diagram and the case-card tilt.
// All use one illustrative document (fictional, labelled "minh họa"), so the story is continuous.

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useSite } from "./SiteContext";

type Clause = { lead: string; mark: string; tail: string; task: string; owner: string; due: string };

/** Illustrative directive. Fictional content, shown as "Văn bản minh họa". */
const SAMPLE: { title: string; clauses: Clause[] } = {
  title: "V/v rà soát hồ sơ tồn đọng quý IV",
  clauses: [
    {
      lead: "1. Giao ",
      mark: "Phòng Quản lý đô thị chủ trì rà soát hồ sơ tồn đọng",
      tail: ", hoàn thành trước 15/11.",
      task: "Rà soát hồ sơ tồn đọng",
      owner: "P. Quản lý đô thị",
      due: "15/11",
    },
    {
      lead: "2. ",
      mark: "Văn phòng tổng hợp báo cáo tiến độ",
      tail: " hằng tuần, gửi lãnh đạo.",
      task: "Báo cáo tiến độ",
      owner: "Văn phòng",
      due: "Thứ Sáu",
    },
    {
      lead: "3. ",
      mark: "Phòng Tài chính bố trí kinh phí thực hiện",
      tail: ", xong trước 30/11.",
      task: "Bố trí kinh phí",
      owner: "P. Tài chính",
      due: "30/11",
    },
  ],
};

/** True while the element is on screen. */
function useInView(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

function Doc({ marked }: { marked: (i: number) => boolean }) {
  return (
    <div className="ca-doc">
      <p className="ca-doc-title">{SAMPLE.title}</p>
      {SAMPLE.clauses.map((c, i) => (
        <p key={i} className="ca-doc-line">
          {c.lead}
          <mark className={marked(i) ? "is-on" : undefined}>{c.mark}</mark>
          {c.tail}
        </p>
      ))}
      <span className="ca-doc-stamp">Văn bản minh họa</span>
    </div>
  );
}

/* ------------------------------------------------------------------ 1. Hero demo panel */

const HERO_STATUS = [
  "đang đọc văn bản…",
  "tách nhiệm vụ 1/3",
  "tách nhiệm vụ 2/3",
  "tách nhiệm vụ 3/3 · chờ người duyệt",
  "3/3 đã duyệt · đang theo dõi",
  "3/3 đã duyệt · đang theo dõi",
];

/** Reads the sample document, extracts three tasks, and gets them approved; loops while visible. */
export function HeroDemo() {
  const { paused } = useSite();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box);
  const [phase, setPhase] = useState(4);

  useEffect(() => {
    if (paused) {
      setPhase(4);
      return;
    }
    if (!inView) return;
    setPhase(0);
    const id = setInterval(() => setPhase((p) => (p + 1) % HERO_STATUS.length), 1300);
    return () => clearInterval(id);
  }, [paused, inView]);

  return (
    <div className="ca-demo-panel" ref={box} aria-label="Minh họa: GEO Agent tách nhiệm vụ từ một văn bản" role="img">
      <div className="ca-window-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>geo-agent · văn bản đến</span>
      </div>
      <div className="ca-demo-body" aria-hidden="true">
        <Doc marked={(i) => phase > i} />
        <ul className="ca-board">
          {SAMPLE.clauses.map((c, i) => (
            <li key={c.task} className={phase > i ? "is-in" : undefined}>
              <b>{c.task}</b>
              <span>{c.owner}</span>
              <span>Hạn {c.due}</span>
              <em className={phase >= 4 ? "is-ok" : undefined}>{phase >= 4 ? "Đã duyệt" : "Chờ duyệt"}</em>
            </li>
          ))}
        </ul>
      </div>
      <p className="ca-console" aria-hidden="true">
        <span>[agent]</span> {HERO_STATUS[phase]}
        <i className="ca-caret" />
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ 2. Pinned three-step flow */

const STEP_COPY = [
  { title: "1.Đọc.", body: "Kết nối hệ thống văn bản, bóc tách nhiệm vụ từ từng văn bản" },
  { title: "2.Đề xuất.", body: "Đề xuất người phụ trách và hạn; người có thẩm quyền duyệt" },
  { title: "3. Theo đến cùng.", body: "Theo dõi, kiểm đếm, đôn đốc, báo cáo và tính KPI/OKR" },
];

/**
 * The section is tall and its stage sticks; scroll position (not hijacked) picks the step.
 * Each step shows the same sample document one stage further along.
 */
export function StepFlow({ icons }: { icons: ReactNode[] }) {
  const scene = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = scene.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, -r.top / travel));
      setStep(Math.min(2, Math.floor(progress * 3)));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
    };
  }, []);

  const jump = (i: number) => {
    const el = scene.current;
    if (!el) return;
    const travel = el.offsetHeight - innerHeight;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY + (travel * (i + 0.5)) / 3, behavior: "smooth" });
  };

  return (
    <div className="ca-flow" ref={scene}>
      <div className="ca-flow-stage">
        <ol className="ca-flow-steps">
          {STEP_COPY.map((s, i) => (
            <li key={s.title} className={`ca-step${step === i ? " is-active" : ""}`}>
              <button type="button" onClick={() => jump(i)} aria-current={step === i ? "step" : undefined}>
                {icons[i]}
                <span>
                  <b className="ca-step-title">{s.title}</b>
                  <span className="ca-step-body">{s.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="ca-flow-view" aria-live="polite">
          <span className="ca-sr">{`Bước ${step + 1}: ${STEP_COPY[step].title}`}</span>
          <div className={`ca-panel${step === 0 ? " is-active" : ""}`} aria-hidden={step !== 0}>
            <p className="ca-panel-label">[agent] đọc văn bản, bôi đỏ nhiệm vụ</p>
            <Doc marked={() => step === 0} />
          </div>

          <div className={`ca-panel${step === 1 ? " is-active" : ""}`} aria-hidden={step !== 1}>
            <p className="ca-panel-label">[agent] đề xuất · chờ người có thẩm quyền duyệt</p>
            <ul className="ca-proposals">
              {SAMPLE.clauses.map((c) => (
                <li key={c.task}>
                  <b>{c.task}</b>
                  <span>
                    Phụ trách: {c.owner} · Hạn {c.due}
                  </span>
                  <em>
                    <span className="ca-wait">Duyệt</span>
                    <span className="ca-done">✓ Đã duyệt</span>
                  </em>
                </li>
              ))}
            </ul>
          </div>

          <div className={`ca-panel${step === 2 ? " is-active" : ""}`} aria-hidden={step !== 2}>
            <p className="ca-panel-label">[agent] theo dõi · đôn đốc · báo cáo</p>
            <ul className="ca-progress">
              {SAMPLE.clauses.map((c, i) => (
                <li key={c.task} style={{ ["--to" as string]: ["100%", "60%", "35%"][i] }}>
                  <span>{c.task}</span>
                  <i />
                  <b>{["Xong", "60%", "35%"][i]}</b>
                </li>
              ))}
            </ul>
            <p className="ca-nudge">Nhắc hạn · Báo cáo tiến độ · còn 2 ngày</p>
            <p className="ca-kpi">
              <b>1/3</b> nhiệm vụ hoàn thành · tự động đưa vào KPI/OKR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 3. Data sovereignty diagram */

type Point = { key: string; title: string; body: string };
// Claims transcribed from the supplied design and the existing pillar copy.
const POINTS: Point[] = [
  { key: "on", title: "Chạy tại chỗ", body: "Mô hình và dữ liệu triển khai trên hạ tầng của quý cơ quan, doanh nghiệp." },
  { key: "lock", title: "Không bị khóa", body: "Không phụ thuộc cloud ngoài, không bị khóa nhà cung cấp — kể cả với chúng tôi." },
  { key: "trace", title: "Con người quyết định, có dấu vết", body: "Người có thẩm quyền duyệt mọi bước quan trọng; mọi hoạt động được lưu vết." },
];

const TILES = [
  { key: "on", label: "Kho văn bản", x: 50, y: 50 },
  { key: "on", label: "GEO Agent", x: 210, y: 50, core: true },
  { key: "trace", label: "Người duyệt", x: 210, y: 210 },
  { key: "trace", label: "Nhật ký", x: 50, y: 210 },
];

export function Sovereignty() {
  const { paused } = useSite();
  const [focus, setFocus] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Gentle pointer tilt (fine pointers only, off while motion is paused).
  useEffect(() => {
    const el = stage.current;
    if (!el || paused || !matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--tx", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
      el.style.setProperty("--ty", `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--tx", "0deg");
      el.style.setProperty("--ty", "0deg");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [paused]);

  return (
    <section className="ca-sov" id="ca-sov">
      <div className="ca-wrap ca-sov-grid">
        <div className="ca-sov-copy" data-reveal>
          <h2>
            Dữ liệu <span>ở lại</span>
            <br />
            với khách hàng
          </h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  className={focus === p.key ? "is-on" : undefined}
                  onPointerEnter={() => setFocus(p.key)}
                  onPointerLeave={() => setFocus(null)}
                  onFocus={() => setFocus(p.key)}
                  onBlur={() => setFocus(null)}
                >
                  <b>{p.title}</b>
                  <span>{p.body}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ca-iso-stage" ref={stage} role="img" aria-label="Sơ đồ: văn bản, GEO Agent, người duyệt và nhật ký đều nằm trong hạ tầng của quý cơ quan; không có đường dữ liệu ra cloud bên ngoài.">
          <div className="ca-iso-tilt" aria-hidden="true">
            <div className={`ca-iso-plane${focus ? ` focus-${focus}` : ""}`}>
              <div className="ca-iso-boundary">
                <span>Hạ tầng của quý cơ quan</span>
              </div>
              <svg className="ca-iso-links" viewBox="0 0 460 460">
                <path d="M95 95H255V255H95Z" />
                <path className="ca-iso-cut" d="M300 300L372 372" />
              </svg>
              {[0, 1, 2, 3, 4].map((d) => (
                <i key={d} className="ca-iso-dot" style={{ animationDelay: `${-d * 1.3}s` }} />
              ))}
              {TILES.map((t) => (
                <div
                  key={t.label}
                  className={`ca-iso-tile${t.core ? " is-core" : ""}${focus === t.key ? " is-on" : ""}`}
                  style={{ left: t.x, top: t.y }}
                >
                  <span className="ca-iso-label">{t.label}</span>
                </div>
              ))}
              <div className={`ca-iso-tile is-outside${focus === "lock" ? " is-on" : ""}`} style={{ left: 360, top: 360 }}>
                <span className="ca-iso-label">Cloud bên ngoài</span>
              </div>
              <b className="ca-iso-x">×</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. Case card tilt */

/** Small perspective tilt on case cards following the pointer; image drifts the other way. */
export function useCaseTilt(root: RefObject<HTMLElement | null>) {
  const { paused } = useSite();
  useEffect(() => {
    const el = root.current;
    if (!el || paused || !matchMedia("(pointer: fine)").matches) return;
    const cards = [...el.querySelectorAll<HTMLElement>(".ca-case")];
    const off: (() => void)[] = [];
    cards.forEach((card) => {
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--rx", `${-y * 6}deg`);
        card.style.setProperty("--ry", `${x * 8}deg`);
        card.style.setProperty("--ix", `${-x * 10}px`);
        card.style.setProperty("--iy", `${-y * 10}px`);
      };
      const leave = () => ["--rx", "--ry", "--ix", "--iy"].forEach((p) => card.style.removeProperty(p));
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      off.push(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        leave();
      });
    });
    return () => off.forEach((f) => f());
  }, [root, paused]);
}
