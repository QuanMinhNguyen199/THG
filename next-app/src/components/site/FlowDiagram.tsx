"use client";

// The four-tier section's board: four independent tiers side by side as columns of plates on a lit
// circuit board. Every unit is a plate with thickness; conduits between neighbouring columns are
// always live (lit, carrying bursting lights, sockets flashing as lights arrive) and do not stand
// for work passing from one tier to another. Picking a tier lights its plates and rests the rest.
//
// Two stacked SVGs: a static board (plates, conduits, the bloom-filtered trace) and a live layer
// with only the moving lights, so the running signals never force the filtered board to repaint.

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { layers } from "./content";
import { FlowStack3D } from "./FlowStack3D";
import { HOP, START, WAVES, litTiming, seedOf, timing } from "./flowSignals";

type Unit = { title: string; role: string; work: [string, string][]; agent: string };

// Illustrative structure and figures for a typical agency, until the client's own are confirmed.
const UNITS: Unit[][] = [
  [
    { title: "Quản trị", role: "Định hướng, phê duyệt", work: [["Việc đã giao", "38"], ["Chờ phê duyệt", "5"]], agent: "tổng hợp báo cáo để lãnh đạo nắm tình hình và phê duyệt công việc." },
    { title: "Ban lãnh đạo", role: "Chỉ đạo, điều hành", work: [["Nhiệm vụ trọng tâm", "12"], ["Chờ chỉ đạo", "3"]], agent: "tổng hợp tiến độ nhiệm vụ trọng tâm để lãnh đạo chỉ đạo kịp thời." },
    { title: "Hội đồng tư vấn", role: "Tham mưu chiến lược", work: [["Đề xuất", "6"], ["Chờ ý kiến", "2"]], agent: "tóm tắt hồ sơ, đề xuất để hội đồng xem xét trước phiên họp." },
  ],
  [
    { title: "Văn phòng", role: "Tổng hợp, điều phối", work: [["Đang xử lý", "12"], ["Sắp đến hạn", "2"]], agent: "bóc tách nhiệm vụ từ công văn đến và đề xuất người phụ trách." },
    { title: "Phòng chuyên môn", role: "Theo dõi công việc", work: [["Đang xử lý", "17"], ["Sắp đến hạn", "4"]], agent: "theo dõi tiến độ hồ sơ, nhắc người phụ trách trước hạn hai ngày." },
    { title: "Nhà máy sản xuất", role: "Năng suất, tiến độ", work: [["Đang xử lý", "9"], ["Sắp đến hạn", "1"]], agent: "đối chiếu đề nghị thanh toán với dự toán đã duyệt." },
  ],
  [
    { title: "Soạn thảo", role: "Dự thảo văn bản", work: [["Bản nháp", "6"], ["Chờ góp ý", "2"]], agent: "soạn dự thảo theo mẫu, kèm căn cứ đã dẫn." },
    { title: "Thẩm định", role: "Kiểm tra căn cứ", work: [["Hồ sơ", "8"], ["Cần bổ sung", "3"]], agent: "đối chiếu căn cứ pháp lý và đánh dấu chỗ còn thiếu." },
    { title: "Triển khai", role: "Thực hiện nhiệm vụ", work: [["Đang làm", "11"], ["Trễ hạn", "1"]], agent: "chia nhiệm vụ thành đầu việc, gắn hạn cho từng người." },
    { title: "Theo dõi hạn", role: "Đôn đốc", work: [["Hạn trong tuần", "7"], ["Đã nhắc", "15"]], agent: "gửi nhắc việc và ghi lại phản hồi của người phụ trách." },
    { title: "Báo cáo", role: "Tổng hợp kết quả", work: [["Báo cáo tuần", "3"], ["Chỉ tiêu theo dõi", "24"]], agent: "tổng hợp tiến độ và kết quả công việc thành báo cáo." },
  ],
  [
    { title: "Tra cứu nội bộ", role: "Trong phạm vi được phép", work: [["Lượt hỏi hôm nay", "42"], ["Cần chuyên viên", "2"]], agent: "trả lời từ kho văn bản theo quyền truy cập của người hỏi." },
    { title: "Hỗ trợ người dân", role: "Hướng dẫn thủ tục", work: [["Yêu cầu mới", "19"], ["Đang chờ", "4"]], agent: "gợi ý giấy tờ cần chuẩn bị cho từng thủ tục." },
    { title: "Trả kết quả", role: "Thông báo, bàn giao", work: [["Hồ sơ xong", "27"], ["Chờ ký", "3"]], agent: "soạn thông báo kết quả để cán bộ ký và gửi." },
    { title: "Phản hồi, góp ý", role: "Ghi nhận ý kiến", work: [["Ý kiến mới", "8"], ["Đã trả lời", "21"]], agent: "phân loại góp ý và chuyển đúng đơn vị phụ trách." },
  ],
];
// Branches from each column to the next: [from, to] unit indices.
const LINKS: [number, number][][] = [
  // Symbolic, not an org chart: governance and management cross-link freely.
  [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [2, 2]],
  [[0, 0], [0, 4], [1, 1], [1, 2], [1, 3], [2, 2], [2, 4]],
  [[0, 0], [1, 1], [2, 1], [2, 2], [3, 3], [4, 0], [4, 2]],
];
// Geometry in viewBox units (1000 × 600, the board's on-screen proportions on desktop): column x,
// plate width/height/thickness, unit centres.
const GEO = [
  { x: 20, w: 225, h: 84, t: 8, centers: [150, 300, 450] },
  { x: 290, w: 225, h: 84, t: 8, centers: [150, 300, 450] },
  { x: 560, w: 195, h: 66, t: 7, centers: [84, 196, 308, 420, 532] },
  { x: 795, w: 195, h: 66, t: 7, centers: [120, 240, 360, 480] },
];

// Narrow columns widen their header box to the header text ("GEO OPERATIONS  Thực thi").
const HEAD_W = 218;

type Pick = { col: number; i: number };
// Opening a tier as a whole (its tab, scrolling, or the tier name) starts from its first unit, so
// the unit chips read from the start of the row.
const FIRST = 0;



function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
const linkPath = (c: number, a: number, b: number) =>
  curve(GEO[c].x + GEO[c].w + 4, GEO[c].centers[a], GEO[c + 1].x - 4, GEO[c + 1].centers[b]);

export function FlowDiagram({ active, onSelect, running }: { active: number; onSelect: (tier: number) => void; running: boolean }) {
  const uid = useId().replace(/:/g, "");
  const [pick, setPick] = useState<Pick>({ col: active, i: FIRST });
  const board = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const tilt = useRef(0);
  // Scrolling or a tab moves to another tier: start from its first unit. A unit picked on the
  // diagram keeps its place when the section scrolls to that unit's tier.
  // A unit picked on another tier scrolls the section through the tiers in between; hold the pick
  // until that scroll arrives instead of resetting at each tier it passes.
  const pending = useRef<Pick | null>(null);
  useEffect(() => {
    const target = pending.current;
    if (target) {
      if (target.col !== active) return;
      pending.current = null;
      setPick(target);
      return;
    }
    setPick((p) => (p.col === active ? p : { col: active, i: FIRST }));
  }, [active]);
  useEffect(() => () => cancelAnimationFrame(tilt.current), []);

  // Bring the picked chip into the row's view (the row only; the page itself does not scroll).
  useEffect(() => {
    const row = chips.current;
    const chip = row?.children[pick.i] as HTMLElement | undefined;
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    row.scrollLeft = Math.max(0, Math.min(left, row.scrollWidth - row.clientWidth));
  }, [pick.col, pick.i]);

  // The four tiers are independent of one another: picking a tier lights that whole tier and rests
  // the other three. No cable is singled out as a path between tiers; they all keep running.
  const inLine = (c: number, _unit?: number) => c === pick.col;
  const choose = (col: number, i: number) => {
    setPick({ col, i });
    const target = col !== active ? { col, i } : null;
    pending.current = target;
    // If the user takes over the scroll, the held pick lapses.
    if (target) setTimeout(() => pending.current === target && (pending.current = null), 1600);
    if (col !== active) onSelect(col);
  };
  const onKey = (e: KeyboardEvent, col: number, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(col, i);
    }
  };
  // The board rests flat (sharp) and leans in 3D toward the pointer while it moves over it.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = board.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(tilt.current);
    tilt.current = requestAnimationFrame(() => {
      el.classList.add("is-leaning");
      el.style.setProperty("--tilt-x", `${(8 - ny * 3).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${(nx * 4).toFixed(2)}deg`);
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(tilt.current);
    board.current?.classList.remove("is-leaning");
    board.current?.style.removeProperty("--tilt-x");
    board.current?.style.removeProperty("--tilt-y");
  };

  const traced: { id: string; c: number; a: number; b: number; d: string; step: number }[] = [];
  // Desktop board: every conduit is live, drawn as the lit trace (red, under the bloom filter) and
  // carrying the bursting lights, as the picked lineage used to; drawn in once, column by column.
  const conduits = LINKS.flatMap((links, c) => links.map(([a, b]) => ({ id: `${c}-${a}-${b}`, c, a, b, d: linkPath(c, a, b), step: c })));

  return (
    <div className={`flow-stage${running ? " is-running" : ""}`}>

      <div className="flow-board-wrap">
      <div className="flow-board" ref={board} onPointerMove={onMove} onPointerLeave={onLeave}>
        <svg className="flow-svg is-static" viewBox="0 0 1000 600" role="group" aria-label="Sơ đồ bốn tầng tổ chức">
          <defs>
            <filter id={`${uid}-glow`} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${uid}-shadow`} x="-10%" y="-20%" width="120%" height="160%">
              <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity="0.55" />
            </filter>
            <pattern id={`${uid}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" className="flow-grid-line" />
            </pattern>
            <radialGradient id={`${uid}-fade`} cx="50%" cy="52%" r="60%">
              <stop offset="0.35" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={`${uid}-floor`}>
              <rect x="-200" y="-40" width="1400" height="680" fill={`url(#${uid}-fade)`} />
            </mask>
            <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="flow-plate-top" />
              <stop offset="1" className="flow-plate-bottom" />
            </linearGradient>
          </defs>

          {/* the board's floor */}
          <rect x="-200" y="-40" width="1400" height="680" fill={`url(#${uid}-grid)`} mask={`url(#${uid}-floor)`} />

          {/* column headers; the picked tier's header sits in a highlighted box as wide as its plates */}
          {GEO.map((g, col) => (
            <g key={`h${col}`} className={`flow-col-head${col === pick.col ? " is-picked" : ""}`}>
              <rect className="flow-col-box" x={g.x} y={4} width={Math.max(g.w, HEAD_W)} height={34} rx={7} />
              <text className="flow-col" x={g.x + 14} y={26}>
                <tspan className="flow-col-product">{layers[col].product}</tspan>
                <tspan dx={8}>{layers[col].tab}</tspan>
              </text>
            </g>
          ))}

          {/* conduits at rest: a dark casing with a faint top highlight */}
          {LINKS.map((links, c) =>
            links.map(([a, b]) => (
              <g key={`r${c}-${a}-${b}`} className="flow-conduit">
                <path className="flow-conduit-case" d={linkPath(c, a, b)} />
                <path className="flow-conduit-core" d={linkPath(c, a, b)} />
              </g>
            )),
          )}
          {/* every conduit lit, under a bloom filter; drawn in once, column by column */}
          <g filter={`url(#${uid}-glow)`}>
            {conduits.map((t) => (
              <g key={t.id} className="flow-trace" style={{ "--d": `${t.step * 120}ms` } as CSSProperties}>
                <path className="flow-trace-body" pathLength={1} d={t.d} />
                <path className="flow-trace-hl" pathLength={1} d={t.d} />
              </g>
            ))}
          </g>

          {/* plates with thickness and a cast shadow; sockets where conduits plug in */}
          <g filter={`url(#${uid}-shadow)`}>
            {UNITS.map((units, col) =>
              units.map((u, i) => {
                const g = GEO[col];
                const y = g.centers[i] - g.h / 2;
                const lit = inLine(col, i);
                return (
                  <g key={`s${u.title}`} className={`flow-plate${lit ? " is-lit" : ""}`}>
                    <rect className="flow-plate-edge" x={g.x} y={y + g.t} width={g.w} height={g.h} rx={8} />
                    <rect className="flow-plate-face" x={g.x} y={y} width={g.w} height={g.h} rx={8} fill={`url(#${uid}-plate)`} />
                  </g>
                );
              }),
            )}
          </g>

          {UNITS.map((units, col) =>
            units.map((u, i) => {
              const g = GEO[col];
              const cy = g.centers[i];
              const picked = col === pick.col && i === pick.i;
              const lit = inLine(col, i);
              return (
                <g
                  key={u.title}
                  className={`flow-unit is-col${col}${lit ? " is-lit" : ""}${picked ? " is-picked" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={picked}
                  aria-label={`${u.title}, tầng ${layers[col].tab}`}
                  onClick={() => choose(col, i)}
                  onKeyDown={(e) => onKey(e, col, i)}
                >
                  <rect className="flow-hit" x={g.x} y={cy - g.h / 2} width={g.w} height={g.h} rx={8} />
                  {col > 0 && <circle className="flow-socket" cx={g.x - 4} cy={cy} r={4} />}
                  {col < UNITS.length - 1 && <circle className="flow-socket" cx={g.x + g.w + 4} cy={cy} r={4} />}
                  {col <= 1 ? (
                    <>
                      <text x={g.x + 20} y={cy - 4} className="flow-title">{u.title}</text>
                      <text x={g.x + 20} y={cy + 20} className="flow-role">{u.role}</text>
                    </>
                  ) : (
                    <text x={g.x + 20} y={cy + 6} className="flow-title is-small">{u.title}</text>
                  )}
                </g>
              );
            }),
          )}
        </svg>

        {/* live layer: only what moves (signals, LEDs); it takes no pointer input */}
        <svg className="flow-svg is-live" viewBox="0 0 1000 600" aria-hidden="true" focusable="false">
          {/* not keyed by the pick: lights on conduits that stay lit keep running through a new pick */}
          <g>
            {WAVES.map((wave) =>
              conduits.map((t) => (
                <g key={`${wave}-${t.id}`}>
                  <path className="flow-pulse-halo" pathLength={1} style={litTiming(t.c, wave, seedOf(t.c, t.a, t.b))} d={t.d} />
                  <path className="flow-pulse" pathLength={1} style={litTiming(t.c, wave, seedOf(t.c, t.a, t.b))} d={t.d} />
                </g>
              )),
            )}
            {UNITS.map((units, col) =>
              units.map((u, i) => {
                const g = GEO[col];
                const cy = g.centers[i];
                return (
                  <g key={`l${u.title}`}>
                    {/* the plate's status bar lights on the picked tier; every input socket flashes as lights arrive */}
                    {inLine(col, i) && <rect className={`flow-led${col === pick.col && i === pick.i ? " is-picked" : ""}`} x={g.x + 7} y={cy - g.h * 0.3} width={3} height={g.h * 0.6} rx={1.5} style={timing(START + col * HOP)} />}
                    {col > 0 && <circle className="flow-led" cx={g.x - 4} cy={cy} r={2.6} style={timing(START + col * HOP)} />}
                  </g>
                );
              }),
            )}
          </g>
        </svg>
      </div>

      </div>

      {/* Narrow screens: the tiers as a 3D stack, the picked tier's units as a row of choices, and
          the secondary detail folded away. */}
      <FlowStack3D
        units={UNITS}
        pick={pick}
        active={active}
        traced={traced}
        links={LINKS}
        inLine={inLine}
        onChoose={choose}
        onTier={onSelect}
      />
      {/* Keyed by tier: a fresh row starts unscrolled. Safari keeps a row's old scroll offset when
          its content shrinks, which left a one-chip tier with its only chip scrolled out of view. */}
      <div key={pick.col} ref={chips} className="flow-chips" role="group" aria-label={`Đơn vị tầng ${layers[pick.col].tab}`}>
        {UNITS[pick.col].map((u, i) => (
          <button key={u.title} type="button" aria-pressed={i === pick.i} onClick={() => choose(pick.col, i)}>
            {u.title}
          </button>
        ))}
      </div>

      {/* Narrow screens: an overview of what the tier does. The four tiers are independent of one
          another, and the unit chips above stand for the kinds of work a tier covers. */}
      <div className="flow-tier" aria-live="polite">
        <p className="flow-tier-name">
          <strong>{layers[pick.col].product}</strong>
        </p>
        <p className="flow-tier-body">{layers[pick.col].body}</p>
      </div>

    </div>
  );
}
