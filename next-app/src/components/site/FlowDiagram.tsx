"use client";

// Third view of the four-tier section: the organisation as a branching hierarchy, built as a lit
// circuit board tilted in perspective. Governance is the root plate; it branches to management
// units, then execution work, then services. Every unit is a plate with thickness, and branches are
// conduits that plug into sockets on the plates. Choosing a unit traces only its lineage (the units
// that hand work down to it and those it passes work on to); signals then run down that lineage
// from governance in two staggered waves, and each unit's LED flashes as a signal arrives.
//
// Two stacked SVGs: a static board (plates, conduits, the bloom-filtered trace) and a live layer
// with only the moving lights, so the running signals never force the filtered board to repaint.

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { layers } from "./content";

type Unit = { title: string; role: string; work: [string, string][]; agent: string };

// Illustrative structure and figures for a typical agency, until the client's own are confirmed.
const UNITS: Unit[][] = [
  [
    { title: "Quản trị", role: "Lãnh đạo cơ quan", work: [["Việc đã giao", "38"], ["Chờ phê duyệt", "5"]], agent: "tóm tắt báo cáo của ba đơn vị trước giao ban sáng thứ Hai." },
  ],
  [
    { title: "Văn phòng", role: "Tổng hợp, điều phối", work: [["Đang xử lý", "12"], ["Sắp đến hạn", "2"]], agent: "bóc tách nhiệm vụ từ công văn đến và đề xuất người phụ trách." },
    { title: "Phòng chuyên môn", role: "Theo dõi công việc", work: [["Đang xử lý", "17"], ["Sắp đến hạn", "4"]], agent: "theo dõi tiến độ hồ sơ, nhắc người phụ trách trước hạn hai ngày." },
    { title: "Phòng tài chính", role: "Nguồn lực, ngân sách", work: [["Đang xử lý", "9"], ["Sắp đến hạn", "1"]], agent: "đối chiếu đề nghị thanh toán với dự toán đã duyệt." },
  ],
  [
    { title: "Soạn thảo", role: "Dự thảo văn bản", work: [["Bản nháp", "6"], ["Chờ góp ý", "2"]], agent: "soạn dự thảo theo mẫu, kèm căn cứ đã dẫn." },
    { title: "Thẩm định", role: "Kiểm tra căn cứ", work: [["Hồ sơ", "8"], ["Cần bổ sung", "3"]], agent: "đối chiếu căn cứ pháp lý và đánh dấu chỗ còn thiếu." },
    { title: "Triển khai", role: "Thực hiện nhiệm vụ", work: [["Đang làm", "11"], ["Trễ hạn", "1"]], agent: "chia nhiệm vụ thành đầu việc, gắn hạn cho từng người." },
    { title: "Theo dõi hạn", role: "Đôn đốc", work: [["Hạn trong tuần", "7"], ["Đã nhắc", "15"]], agent: "gửi nhắc việc và ghi lại phản hồi của người phụ trách." },
    { title: "Báo cáo", role: "Tổng hợp kết quả", work: [["Báo cáo tuần", "3"], ["Chỉ tiêu theo dõi", "24"]], agent: "gom số liệu từ các đầu việc thành báo cáo KPI/OKR." },
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
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [0, 4], [1, 1], [1, 2], [1, 3], [2, 2], [2, 4]],
  [[0, 0], [1, 1], [2, 1], [2, 2], [3, 3], [4, 0], [4, 2]],
];
// Geometry in viewBox units (1000 × 440): column x, plate width/height/thickness, unit centres.
const GEO = [
  { x: 40, w: 200, h: 120, t: 12, centers: [230] },
  { x: 300, w: 196, h: 62, t: 7, centers: [130, 230, 330] },
  { x: 566, w: 170, h: 46, t: 6, centers: [80, 155, 230, 305, 380] },
  { x: 796, w: 176, h: 46, t: 6, centers: [110, 190, 270, 350] },
];

type Pick = { col: number; i: number };
const middle = (col: number) => Math.floor((UNITS[col].length - 1) / 2);

// Signal timing (seconds): wait for the trace to draw, then one quick hop per tier. Two waves run
// half a cycle apart, so the lineage always carries traffic.
const START = 0.5;
const HOP = 0.5;
const CYCLE = HOP * 4;
const timing = (delay: number): CSSProperties => ({ animationDelay: `${delay}s`, animationDuration: `${CYCLE}s` });

/** Units above that hand work down to the pick, and units below that it passes work on to. */
function lineage({ col, i }: Pick) {
  const up: Set<number>[] = UNITS.map(() => new Set());
  const down: Set<number>[] = UNITS.map(() => new Set());
  up[col].add(i);
  down[col].add(i);
  for (let c = col - 1; c >= 0; c--) for (const [a, b] of LINKS[c]) if (up[c + 1].has(b)) up[c].add(a);
  for (let c = col; c < LINKS.length; c++) for (const [a, b] of LINKS[c]) if (down[c].has(a)) down[c + 1].add(b);
  return { up, down };
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
const linkPath = (c: number, a: number, b: number) =>
  curve(GEO[c].x + GEO[c].w + 4, GEO[c].centers[a], GEO[c + 1].x - 4, GEO[c + 1].centers[b]);

export function FlowDiagram({ active, onSelect, running }: { active: number; onSelect: (tier: number) => void; running: boolean }) {
  const uid = useId().replace(/:/g, "");
  const [pick, setPick] = useState<Pick>({ col: active, i: middle(active) });
  const board = useRef<HTMLDivElement>(null);
  const tilt = useRef(0);
  // Scrolling or a tab moves to another tier: start from its middle unit. A unit picked on the
  // diagram keeps its place when the section scrolls to that unit's tier.
  useEffect(() => {
    setPick((p) => (p.col === active ? p : { col: active, i: middle(active) }));
  }, [active]);
  useEffect(() => () => cancelAnimationFrame(tilt.current), []);

  const { up, down } = lineage(pick);
  const inLine = (c: number, i: number) => up[c].has(i) || down[c].has(i);
  const choose = (col: number, i: number) => {
    setPick({ col, i });
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

  const unit = UNITS[pick.col][pick.i];
  const from = pick.col > 0 ? [...up[pick.col - 1]].map((a) => UNITS[pick.col - 1][a].title) : [];
  const to = pick.col < UNITS.length - 1 ? [...down[pick.col + 1]].map((b) => UNITS[pick.col + 1][b].title) : [];
  const traceKey = `${pick.col}-${pick.i}`;
  const traced = LINKS.flatMap((links, c) =>
    links.flatMap(([a, b]) => {
      const above = up[c].has(a) && up[c + 1].has(b);
      const below = down[c].has(a) && down[c + 1].has(b);
      if (!above && !below) return [];
      return [{ id: `${c}-${a}-${b}`, c, b, d: linkPath(c, a, b), step: above ? pick.col - (c + 1) : c - pick.col }];
    }),
  );

  return (
    <div className={`flow-stage${running ? " is-running" : ""}`}>
      <p className="flow-hint">Chọn một đơn vị để xem việc đi từ đâu đến đâu.</p>

      <div className="flow-board-wrap">
      <div className="flow-board" ref={board} onPointerMove={onMove} onPointerLeave={onLeave}>
        <svg className="flow-svg is-static" viewBox="0 0 1000 440" role="group" aria-label="Sơ đồ bốn tầng tổ chức">
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
              <rect x="-200" y="-40" width="1400" height="520" fill={`url(#${uid}-fade)`} />
            </mask>
            <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="flow-plate-top" />
              <stop offset="1" className="flow-plate-bottom" />
            </linearGradient>
          </defs>

          {/* the board's floor */}
          <rect x="-200" y="-40" width="1400" height="520" fill={`url(#${uid}-grid)`} mask={`url(#${uid}-floor)`} />

          {GEO.map((g, col) => (
            <text key={`h${col}`} className={`flow-col${col === pick.col ? " is-picked" : ""}`} x={g.x + 14} y={22}>
              {layers[col].tab}
            </text>
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
          {/* the traced lineage: lit conduits that draw outward from the pick, under a bloom filter */}
          <g key={traceKey} filter={`url(#${uid}-glow)`}>
            {traced.map((t) => (
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
                    <rect className="flow-plate-edge" x={g.x} y={y + g.t} width={g.w} height={g.h} rx={col === 0 ? 12 : 8} />
                    <rect className="flow-plate-face" x={g.x} y={y} width={g.w} height={g.h} rx={col === 0 ? 12 : 8} fill={`url(#${uid}-plate)`} />
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
                  <rect className="flow-hit" x={g.x} y={cy - g.h / 2} width={g.w} height={g.h} rx={col === 0 ? 12 : 8} />
                  {col > 0 && <circle className="flow-socket" cx={g.x - 4} cy={cy} r={4} />}
                  {col < UNITS.length - 1 && <circle className="flow-socket" cx={g.x + g.w + 4} cy={cy} r={4} />}
                  {col === 0 ? (
                    <>
                      <text x={g.x + 22} y={cy + 6} className="flow-title is-root">{u.title}</text>
                      <text x={g.x + 22} y={cy + 32} className="flow-role">{u.role}</text>
                    </>
                  ) : col === 1 ? (
                    <>
                      <text x={g.x + 18} y={cy - 2} className="flow-title">{u.title}</text>
                      <text x={g.x + 18} y={cy + 17} className="flow-role">{u.role}</text>
                    </>
                  ) : (
                    <text x={g.x + 18} y={cy + 5} className="flow-title is-small">{u.title}</text>
                  )}
                </g>
              );
            }),
          )}
        </svg>

        {/* live layer: only what moves (signals, LEDs); it takes no pointer input */}
        <svg className="flow-svg is-live" viewBox="0 0 1000 440" aria-hidden="true" focusable="false">
          <g key={`p${traceKey}`}>
            {[0, CYCLE / 2].map((wave) =>
              traced.map((t) => (
                <g key={`${wave}-${t.id}`}>
                  <path className="flow-pulse-halo" pathLength={1} style={timing(START + wave + t.c * HOP)} d={t.d} />
                  <path className="flow-pulse" pathLength={1} style={timing(START + wave + t.c * HOP)} d={t.d} />
                </g>
              )),
            )}
            {UNITS.map((units, col) =>
              units.map((u, i) => {
                if (!inLine(col, i)) return null;
                const g = GEO[col];
                const cy = g.centers[i];
                return (
                  <g key={`l${u.title}`}>
                    <rect className={`flow-led${col === pick.col && i === pick.i ? " is-picked" : ""}`} x={g.x + 7} y={cy - g.h * 0.3} width={3} height={g.h * 0.6} rx={1.5} style={timing(START + col * HOP)} />
                    {col > 0 && <circle className="flow-led" cx={g.x - 4} cy={cy} r={2.6} style={timing(START + col * HOP)} />}
                  </g>
                );
              }),
            )}
          </g>
        </svg>
      </div>

      </div>

      {/* Narrow screens: the picked tier's units as a row of choices, then the lineage as a vertical
          path (one row per tier) with the same running signal and LEDs, then the detail. */}
      <div className="flow-chips" role="group" aria-label={`Đơn vị tầng ${layers[pick.col].tab}`}>
        {UNITS[pick.col].map((u, i) => (
          <button key={u.title} type="button" aria-pressed={i === pick.i} onClick={() => choose(pick.col, i)}>
            {u.title}
          </button>
        ))}
      </div>
      <ol key={`m${traceKey}`} className="flow-path" aria-label="Đường đi của việc qua bốn tầng">
        {UNITS.map((units, col) => {
          const ids = col < pick.col ? [...up[col]] : col > pick.col ? [...down[col]] : [pick.i];
          return (
            <li key={col} className={col === pick.col ? "is-picked" : undefined} style={{ "--led-delay": `${START + col * HOP}s`, "--cycle": `${CYCLE}s` } as CSSProperties}>
              <span className="flow-path-tier">{layers[col].tab}</span>
              <span className="flow-path-units">{ids.map((i) => units[i].title).join(", ")}</span>
            </li>
          );
        })}
      </ol>

      <div className="flow-detail" aria-live="polite">
        <div className="flow-detail-main">
          <p className="flow-detail-name">
            <strong>{unit.title}</strong> <span>{unit.role}</span>
          </p>
          <p className="flow-detail-agent">GEO Agent {unit.agent}</p>
          <p className="flow-detail-route">
            {from.length > 0 && <>Nhận việc từ {from.join(", ")}. </>}
            {to.length > 0 && <>Chuyển tới {to.join(", ")}.</>}
          </p>
        </div>
        <dl className="flow-detail-work">
          {unit.work.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="flow-detail-note">Số liệu minh họa</p>
      </div>
    </div>
  );
}
