"use client";

// Concept 4 ("Agent Native"): its own page, following the supplied design — silk-wave hero,
// a scroll-revealed statement, three isometric principles, four feature rows with product mock
// screens, a hover list of deployments and a wave footer.
// The product screens are built in HTML with fictional sample data (labelled "minh họa"):
// the design's placeholder screenshot is a third-party app UI repeated four times.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ContactList } from "./Contacts";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { Waves } from "./Waves";
import { useStickyHeader } from "./useStickyHeader";

const NAV = [
  { href: "#na-hero", label: "GeoAgent" },
  { href: "#na-features", label: "Ứng dụng" },
  { href: "#na-cases", label: "Dự án" },
  { href: "#na-intro", label: "TheheGEO" },
  // TODO(unconfirmed): no careers page yet; points at the contact strip for now.
  { href: "#na-contact", label: "Tuyển dụng" },
];

const HERO_WAVES = [
  { y: 0.66, amp: 0.13, freq: 1.6, twist: 2.6, speed: 0.22, lines: 70, spread: 0.2, hue: [352, 340] as [number, number] },
  { y: 0.78, amp: 0.09, freq: 2.2, twist: -2.2, speed: -0.16, lines: 46, spread: 0.14, hue: [346, 335] as [number, number] },
];
const FOOT_WAVES = [
  { y: 0.55, amp: 0.2, freq: 1.4, twist: 2.4, speed: 0.2, lines: 60, spread: 0.32, hue: [352, 338] as [number, number] },
];

/**
 * Adds `is-in` when the element scrolls into view, and removes it once the element has left the
 * viewport downward (the visitor scrolled back up past it), so the entrance replays next time.
 * The reset only happens fully offscreen, so nothing visibly snaps back. Paused: always revealed.
 */
function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const { paused } = useSite();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (paused) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= threshold) setInView(true);
        else if (e.intersectionRatio === 0 && e.boundingClientRect.top > 0) setInView(false);
      },
      { threshold: [0, threshold] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [paused, threshold]);
  return [ref, inView] as const;
}

/* ---------------------------------------------------------------- statement */

const LEAD = "Một kiểu trợ lý mới cho bộ máy.";
const REST = "Không gắn AI vào phần mềm cũ. GEO Agent được xây với Agent làm trung tâm ngay từ đầu.";

/** The grey sentence darkens word by word as it scrolls through the viewport. */
function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { paused } = useSite();
  const words = REST.split(" ");
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (paused) {
      setLit(0);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // 0 when the paragraph's top reaches 85% of the viewport, 1 when it reaches 35%.
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (innerHeight * 0.5)));
      setLit(Math.round(p * words.length));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", queue, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
    };
  }, [paused, words.length]);

  return (
    <p className="na-statement" ref={ref}>
      <b>{LEAD}</b>{" "}
      {words.map((w, i) => (
        <span key={i} className={i < lit ? "is-lit" : undefined}>
          {w}{" "}
        </span>
      ))}
    </p>
  );
}

/* ---------------------------------------------------------------- isometric illustrations */

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
/** Isometric projection of (x, y, z) into SVG coordinates around (cx, cy). */
const iso = (x: number, y: number, z: number, cx = 120, cy = 120): [number, number] => [cx + (x - y) * COS, cy + (x + y) * SIN - z];
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Outline of a box: top face plus the two visible sides. */
function Box({ x, y, z, w, d, h, accent }: { x: number; y: number; z: number; w: number; d: number; h: number; accent?: boolean }) {
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z)];
  const right = [iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z)];
  return (
    <g className={accent ? "is-accent" : undefined}>
      <polygon pathLength={1} className="na-face-side" points={pts(left)} />
      <polygon pathLength={1} className="na-face-side2" points={pts(right)} />
      <polygon pathLength={1} className="na-face-top" points={pts(top)} />
    </g>
  );
}

function IsoMachine() {
  // Three stacked slabs (the organisation's layers) with a red dome on top.
  const [cx, cy] = iso(30, 30, 64);
  return (
    <svg viewBox="0 0 240 220" className="na-iso">
      <Box x={-10} y={-10} z={0} w={80} d={80} h={14} />
      <Box x={-4} y={-4} z={24} w={68} d={68} h={14} />
      <Box x={2} y={2} z={48} w={56} d={56} h={14} accent />
      <path pathLength={1} className="na-dome" d={`M${cx - 34} ${cy} A34 20 0 0 1 ${cx + 34} ${cy}`} />
      {[10, 20, 30].map((r) => (
        <path key={r} pathLength={1} className="na-dome-line" d={`M${cx - r} ${cy} A${r} ${r * 0.58} 0 0 1 ${cx + r} ${cy}`} />
      ))}
    </svg>
  );
}

function IsoTeam() {
  // A cluster of cubes: people and agents side by side, joined by a red link.
  const cubes: [number, number, number, boolean][] = [
    [-30, -10, 0, false],
    [20, -30, 0, true],
    [10, 20, 0, false],
    [-12, -12, 34, true],
  ];
  const a = iso(-4, 10, 34);
  const b = iso(40, -10, 34);
  return (
    <svg viewBox="0 0 240 220" className="na-iso">
      {cubes.map(([x, y, z, accent], i) => (
        <Box key={i} x={x} y={y} z={z} w={34} d={34} h={34} accent={accent} />
      ))}
      <path pathLength={1} className="na-link" d={`M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${a[1] - 40} ${b[0]} ${b[1]}`} />
    </svg>
  );
}

function IsoUnlocked() {
  // A rack of servers on the customer's site, with an open padlock.
  const [lx, ly] = iso(56, -6, 70);
  return (
    <svg viewBox="0 0 240 220" className="na-iso">
      {[0, 1, 2, 3].map((k) => (
        <Box key={k} x={-20 + k * 16} y={-30} z={0} w={12} d={70} h={60 + k * 6} accent={k === 1} />
      ))}
      <g className="na-lock">
        <rect pathLength={1} x={lx - 12} y={ly} width={24} height={20} rx={3} />
        <path pathLength={1} d={`M${lx - 7} ${ly} v-8 a7 7 0 0 1 14 0 v-4`} />
      </g>
    </svg>
  );
}

const PRINCIPLES = [
  { art: <IsoMachine />, title: "Xây cho bộ máy", body: "Hiểu văn bản hành chính, cách giao việc và báo cáo của cơ quan Việt Nam." },
  { art: <IsoTeam />, title: "Người và Agent cùng làm", body: "Agent đề xuất và làm, người có thẩm quyền duyệt." },
  { art: <IsoUnlocked />, title: "Không bị khóa", body: "Triển khai tại chỗ, dữ liệu ở lại với cơ quan, kể cả với chúng tôi." },
];

function Principles() {
  const [ref, inView] = useReveal<HTMLDivElement>(0.25);
  return (
    <div className={`na-principles${inView ? " is-in" : ""}`} ref={ref}>
      {PRINCIPLES.map((p, i) => (
        <article key={p.title} style={{ ["--i" as string]: i }}>
          {p.art}
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </article>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- product mock screens */

function Window({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="na-window">
      <div className="na-window-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
        <em>minh họa</em>
      </div>
      <div className="na-window-body">{children}</div>
    </div>
  );
}

function ScreenIntake() {
  return (
    <Window title="GEO Agent · Văn bản đến">
      <div className="na-intake">
        <div className="na-paper n-item">
          <b>Công văn số 128/UBND-VP</b>
          <p>V/v rà soát hồ sơ tồn đọng quý IV</p>
          <p>
            1. <mark>Phòng Quản lý đô thị chủ trì rà soát</mark>, xong trước 15/11.
          </p>
          <p>
            2. <mark>Văn phòng tổng hợp báo cáo tiến độ</mark> hằng tuần.
          </p>
          <p>
            3. <mark>Phòng Tài chính bố trí kinh phí</mark>, xong trước 30/11.
          </p>
        </div>
        <ul className="na-extract">
          {[
            ["Rà soát hồ sơ tồn đọng", "P. Quản lý đô thị", "15/11"],
            ["Báo cáo tiến độ", "Văn phòng", "Hằng tuần"],
            ["Bố trí kinh phí", "P. Tài chính", "30/11"],
          ].map(([t, o, d], i) => (
            <li key={t} className="n-item" style={{ ["--i" as string]: i + 1 }}>
              <b>{t}</b>
              <span>
                {o} · {d}
              </span>
              <em>Đề xuất</em>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

function ScreenBoard() {
  const cols: [string, string[][]][] = [
    ["Mới giao", [["Lập kế hoạch kiểm tra", "Thanh tra"], ["Cập nhật quy chế", "Văn phòng"]]],
    ["Đang làm", [["Rà soát hồ sơ tồn đọng", "P. QLĐT"], ["Bố trí kinh phí", "P. Tài chính"]]],
    ["Chờ duyệt", [["Báo cáo tiến độ tuần", "Văn phòng"]]],
    ["Xong", [["Tổng hợp ý kiến dự thảo", "P. Tư pháp"]]],
  ];
  let n = 0;
  return (
    <Window title="GEO Agent · Bảng việc chung">
      <div className="na-board">
        {cols.map(([name, cards]) => (
          <div key={name} className="na-col">
            <p>
              {name} <span>{cards.length}</span>
            </p>
            {cards.map(([t, o]) => (
              <div key={t} className="na-card n-item" style={{ ["--i" as string]: n++ }}>
                <b>{t}</b>
                <span>{o}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Window>
  );
}

function ScreenChat() {
  return (
    <Window title="GEO Agent · Trao đổi">
      <div className="na-chat">
        <p className="na-msg is-user n-item">Tổng hợp tiến độ rà soát hồ sơ của các phòng, gửi tôi trước 16h.</p>
        <p className="na-msg n-item" style={{ ["--i" as string]: 1 }}>
          Đã nhận. Tôi sẽ tổng hợp từ 3 phòng và nhắc 2 phòng chưa cập nhật.
        </p>
        <div className="na-msg is-ask n-item" style={{ ["--i" as string]: 2 }}>
          <p>
            Hạn 15/11 của Phòng QLĐT khác với hạn 20/11 trong Kế hoạch 45/KH. Anh/chị muốn giữ hạn nào?
          </p>
          <span>
            <i className="na-chip">Giữ 15/11</i>
            <i className="na-chip">Theo 20/11</i>
          </span>
        </div>
        <p className="na-note n-item" style={{ ["--i" as string]: 3 }}>
          Agent dừng lại và hỏi người khi có mâu thuẫn.
        </p>
      </div>
    </Window>
  );
}

function ScreenReport() {
  const units: [string, number][] = [
    ["P. Quản lý đô thị", 92],
    ["Văn phòng", 78],
    ["P. Tài chính", 64],
    ["Thanh tra", 85],
  ];
  return (
    <Window title="GEO Agent · Báo cáo kỳ">
      <div className="na-report">
        <div className="na-kpi n-item">
          <p>Tỷ lệ việc đúng hạn theo đơn vị</p>
          {units.map(([u, v], i) => (
            <div key={u} className="na-bar" style={{ ["--v" as string]: `${v}%`, ["--i" as string]: i }}>
              <span>{u}</span>
              <i />
              <b>{v}%</b>
            </div>
          ))}
        </div>
        <ul className="na-log n-item" style={{ ["--i" as string]: 2 }}>
          <li>
            <b>09:12</b> Agent đề xuất giao <em>Bố trí kinh phí</em> cho P. Tài chính
          </li>
          <li>
            <b>09:40</b> Phó Giám đốc duyệt đề xuất
          </li>
          <li>
            <b>16:05</b> Agent gửi báo cáo tuần cho lãnh đạo
          </li>
        </ul>
      </div>
    </Window>
  );
}

const FEATURES = [
  { title: ["Văn bản đến", "Việc thành hình"], body: "GEO Agent đọc công văn, bóc tách từng nhiệm vụ và đề xuất ai làm, hạn nào.", screen: <ScreenIntake /> },
  { title: ["Một bảng cho", "mọi việc"], body: "Lãnh đạo thấy cả cơ quan, trưởng phòng thấy phòng mình, chuyên viên thấy việc của mình.", screen: <ScreenBoard /> },
  {
    title: ["Giao cho Agent", "như giao cho một", "đồng nghiệp"],
    body: "Hỏi bằng tiếng Việt, nhờ tổng hợp, để Agent nhắc việc. Khi có mâu thuẫn, rủi ro cao hay chưa có tiền lệ, Agent dừng lại và hỏi người.",
    screen: <ScreenChat />,
  },
  { title: ["Cuối kỳ, báo cáo", "đã sẵn"], body: "GEO Agent tổng hợp tiến độ, tính KPI/OKR cho từng đơn vị, và giữ nhật ký ai đề xuất, ai duyệt.", screen: <ScreenReport /> },
];

function Feature({ f }: { f: (typeof FEATURES)[number] }) {
  const [ref, inView] = useReveal<HTMLElement>(0.25);
  return (
    <article className={`na-feature${inView ? " is-in" : ""}`} ref={ref}>
      <div className="na-feature-head">
        <h3>
          {f.title.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h3>
        <p>{f.body}</p>
      </div>
      <div className="na-feature-screen">{f.screen}</div>
    </article>
  );
}

/* ---------------------------------------------------------------- deployments + page */

const CASES = [
  { org: "Thuế TP Hà Nội", body: "phân tích sức khỏe tài chính và rủi ro thuế doanh nghiệp." },
  { org: "TP Hà Nội", body: "một nền tảng AI cho nhiều cơ quan" },
  { org: "PTSC M&C", body: "trợ lý AI cho hồ sơ kỹ thuật dự án công nghiệp" },
];


export function NativePage() {
  const { theme, paused, togglePaused } = useSite();
  const bar = useStickyHeader<HTMLElement>("#na-hero", theme === "native");
  const [casesRef, casesIn] = useReveal<HTMLUListElement>(0.3);
  // Entrance states (hidden until revealed) apply only while motion runs, so nothing stays hidden
  // without JS, with reduced motion or with the pause control.
  const [motionOn, setMotionOn] = useState(false);
  useEffect(() => {
    setMotionOn(theme === "native" && !paused);
  }, [theme, paused]);

  return (
    <div className="native-page" data-motion={motionOn ? "" : undefined}>
      <a className="skip" href="#na-main">
        Đến nội dung
      </a>
      <header className="na-header" ref={bar}>
        <a href="#na-hero" className="na-brand" aria-label="THEHEGEO trang chủ">
          <Logo className="brand-logo" />
        </a>
        <nav aria-label="Điều hướng chính">
          {NAV.map((n, i) => (
            <a key={n.label} href={n.href} className={i === 0 ? "is-current" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <span className="na-lang">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
          </svg>
          VI
        </span>
      </header>

      <main id="na-main">
        <section className="na-hero" id="na-hero">
          <Waves className="na-waves" ribbons={HERO_WAVES} />
          <div className="na-wrap na-hero-copy">
            <h1>GEOagents</h1>
            <p className="na-hero-title">AI Agent làm việc thật trong bộ máy.</p>
            <p className="na-hero-sub">Xây cho bộ máy nhà nước. Thiết kế cho thời của AI</p>
            <div className="na-actions">
              <a className="na-btn is-dark" href="#na-intro">
                Xem thêm về GeoAgent <span aria-hidden="true">›</span>
              </a>
              <a className="na-btn is-outline" href="#na-contact">
                Đặt lịch Demo
              </a>
            </div>
          </div>
        </section>

        <section className="na-wrap na-intro" id="na-intro">
          <Statement />
          <Principles />
        </section>

        <section className="na-wrap na-features" id="na-features">
          {FEATURES.map((f) => (
            <Feature key={f.title.join(" ")} f={f} />
          ))}
        </section>

        <section className="na-wrap na-cases" id="na-cases">
          <h2>
            <span>GEOagent</span> đang làm việc ở đâu
          </h2>
          <p className="na-cases-sub">Bài toán thật, Quy mô thật</p>
          <ul className={casesIn ? "is-in" : undefined} ref={casesRef}>
            {CASES.map((c, i) => (
              <li key={c.org} style={{ ["--i" as string]: i }}>
                <b>{c.org}</b>
                <span>{c.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="na-footer" id="na-contact">
        <ContactList className="na-wrap" />
        <div className="na-footer-waves">
          <Waves className="na-waves" ribbons={FOOT_WAVES} />
          <div className="na-wrap na-legal">
            <span>© 2026 THEHEGEO</span>
            <button type="button" aria-pressed={paused} onClick={togglePaused}>
              {paused ? "Bật chuyển động ▷" : "Tạm dừng chuyển động Ⅱ"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
