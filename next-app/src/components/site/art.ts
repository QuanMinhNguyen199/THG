// Canvas artwork for the four-tier scene. Pure drawing functions: no DOM lookups, no timers.

export type Surface = { ctx: CanvasRenderingContext2D; w: number; h: number };
/** Returns the theme accent with an optional two-digit hex alpha, e.g. paint("40"). */
export type Paint = (alpha?: string) => string;

type Vec = [number, number, number];

// Globe core geometry, matching the WebGL core in /motion-lab: a once-subdivided icosahedron shell,
// a counter-rotating dodecahedron and a bright octahedron at the centre. Built once, unit radius.
const PHI = (1 + Math.sqrt(5)) / 2;
const norm = (v: Vec): Vec => {
  const n = Math.hypot(...v);
  return [v[0] / n, v[1] / n, v[2] / n];
};
/** Unique undirected edges of a polygon list. */
const edgesOf = (faces: number[][]) => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  faces.forEach((f) =>
    f.forEach((a, i) => {
      const b = f[(i + 1) % f.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push([a, b]);
      }
    }),
  );
  return out;
};

const shell = (() => {
  const verts: Vec[] = (
    [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI],
      [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ] as Vec[]
  ).map(norm);
  const base = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const cache = new Map<string, number>();
  const mid = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    let i = cache.get(key);
    if (i === undefined) {
      const [p, q] = [verts[a], verts[b]];
      i = verts.push(norm([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2])) - 1;
      cache.set(key, i);
    }
    return i;
  };
  const faces = base.flatMap(([a, b, c]) => {
    const ab = mid(a, b);
    const bc = mid(b, c);
    const ca = mid(c, a);
    return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
  });
  return { verts, edges: edgesOf(faces) };
})();

const inner = (() => {
  const g = 1 / PHI;
  const verts: Vec[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) verts.push([x, y, z]);
  for (const a of [-1, 1])
    for (const b of [-1, 1]) verts.push([0, a * g, b * PHI], [a * g, b * PHI, 0], [b * PHI, 0, a * g]);
  const unit = verts.map(norm);
  // Dodecahedron edges are exactly the vertex pairs at the shortest distance.
  const dist = (i: number, j: number) =>
    Math.hypot(unit[i][0] - unit[j][0], unit[i][1] - unit[j][1], unit[i][2] - unit[j][2]);
  let min = Infinity;
  for (let i = 0; i < unit.length; i++) for (let j = i + 1; j < unit.length; j++) min = Math.min(min, dist(i, j));
  const edges: [number, number][] = [];
  for (let i = 0; i < unit.length; i++)
    for (let j = i + 1; j < unit.length; j++) if (dist(i, j) < min * 1.01) edges.push([i, j]);
  return { verts: unit, edges };
})();

const octa = {
  verts: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as Vec[],
  faces: [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]],
};
const LIGHT = norm([-0.4, -0.6, 0.7]);

const rotateXYZ = ([x, y, z]: Vec, ax: number, ay: number, az: number): Vec => {
  const y1 = y * Math.cos(ax) - z * Math.sin(ax);
  const z1 = y * Math.sin(ax) + z * Math.cos(ax);
  const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
  const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
  return [x2 * Math.cos(az) - y1 * Math.sin(az), x2 * Math.sin(az) + y1 * Math.cos(az), z2];
};

const FLOOR_CODES = ["GOVERNANCE", "MANAGEMENT", "EXECUTION", "SERVICE"];
const hex = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");

/** Auto-rotating globe core: wireframe shell, counter-rotating inner cage, glowing core. */
function drawGlobeCore(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, paint: Paint) {
  const sway = Math.sin(t * 0.3) * 0.12;
  const focal = 4.5;
  const project = ([x, y, z]: Vec): [number, number] => {
    const k = focal / (focal - z);
    return [cx + x * r * k, cy + y * r * k];
  };

  // Soft red field behind everything.
  const field = c.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
  field.addColorStop(0, paint("30"));
  field.addColorStop(0.6, paint("12"));
  field.addColorStop(1, paint("00"));
  c.fillStyle = field;
  c.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);

  // Thin orbit ring.
  c.beginPath();
  for (let k = 0; k <= 96; k++) {
    const a = (k / 96) * Math.PI * 2;
    const [x, y] = project(rotateXYZ([Math.cos(a) * 1.28, 0, Math.sin(a) * 1.28], 1.15 + sway, t * 0.05, 0.35));
    if (k) c.lineTo(x, y);
    else c.moveTo(x, y);
  }
  c.strokeStyle = paint("40");
  c.lineWidth = 0.7;
  c.stroke();

  // Wire cages: edges facing away are dimmer, which reads as depth without sorting.
  const wire = (
    mesh: { verts: Vec[]; edges: [number, number][] },
    rot: Vec,
    scale: number,
    front: number,
    back: number,
    width: number,
  ) => {
    const pts = mesh.verts.map((v) => rotateXYZ([v[0] * scale, v[1] * scale, v[2] * scale], rot[0], rot[1], rot[2]));
    c.lineWidth = width;
    mesh.edges.forEach(([a, b]) => {
      const depth = (pts[a][2] + pts[b][2]) / (2 * scale); // -1 back … 1 front
      const [x1, y1] = project(pts[a]);
      const [x2, y2] = project(pts[b]);
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.strokeStyle = paint(hex(back + ((depth + 1) / 2) * (front - back)));
      c.stroke();
    });
    return pts;
  };
  const shellPts = wire(shell, [0.25 + sway, t * 0.12, t * 0.04], 1, 0xd0, 0x38, 0.9);
  shellPts.forEach((p) => {
    const depth = (p[2] + 1) / 2;
    const [x, y] = project(p);
    c.fillStyle = paint(hex(0x50 + depth * 0xaf));
    c.beginPath();
    c.arc(x, y, (0.9 + depth * 1.3) * (r / 120), 0, Math.PI * 2);
    c.fill();
  });
  wire(inner, [t * 0.09, -t * 0.22, 0.2], 0.62, 0xf0, 0x55, 1);

  // Core: a lit octahedron that runs hot toward white, inside a breathing glow.
  const pulse = 1 + Math.sin(t * 2.2) * 0.07;
  const glow = c.createRadialGradient(cx, cy, 0, cx, cy, r * 0.55 * pulse);
  glow.addColorStop(0, paint("cc"));
  glow.addColorStop(0.3, paint("66"));
  glow.addColorStop(1, paint("00"));
  c.fillStyle = glow;
  c.beginPath();
  c.arc(cx, cy, r * 0.55 * pulse, 0, Math.PI * 2);
  c.fill();

  const size = 0.2 * pulse;
  const core = octa.verts.map((v) => rotateXYZ([v[0] * size, v[1] * size, v[2] * size], t * 0.3, t * 0.5, 0.6));
  octa.faces
    .map((f) => {
      const [a, b, d] = f.map((i) => core[i]);
      const u: Vec = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v: Vec = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
      let n = norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
      // Point every normal outward so facing and lighting are consistent.
      const centre: Vec = [(a[0] + b[0] + d[0]) / 3, (a[1] + b[1] + d[1]) / 3, (a[2] + b[2] + d[2]) / 3];
      if (n[0] * centre[0] + n[1] * centre[1] + n[2] * centre[2] < 0) n = [-n[0], -n[1], -n[2]];
      const light = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      return { pts: [a, b, d], z: centre[2], facing: n[2] > 0, light };
    })
    .filter((f) => f.facing)
    .sort((a, b) => a.z - b.z)
    .forEach((f) => {
      const p = f.pts.map(project);
      c.beginPath();
      c.moveTo(p[0][0], p[0][1]);
      c.lineTo(p[1][0], p[1][1]);
      c.lineTo(p[2][0], p[2][1]);
      c.closePath();
      c.fillStyle = paint();
      c.fill();
      c.fillStyle = `rgba(255,255,255,${(0.55 + f.light * 0.45).toFixed(3)})`;
      c.fill();
      c.strokeStyle = paint("ff");
      c.lineWidth = 0.8;
      c.stroke();
    });
}

/**
 * Animated state of the four-tier tower. `active` is the target; the other fields ease toward it
 * inside `drawTower`, so every tier change is a visible transition rather than a cut.
 */
export type TowerState = {
  active: number;
  emphasis: number[];
  angle: number;
  orb: number;
  last: number;
  ink: string;
};

export const createTowerState = (tiers: number): TowerState => ({
  active: 0,
  emphasis: Array.from({ length: tiers }, (_, i) => +(i === 0)),
  angle: Math.PI / 4,
  orb: 0,
  last: -1,
  ink: "#fff",
});

const TIER_GAP = 0.62;
const TIER_HALF = 1;
const TIER_THICK = 0.09;
const TILT = -0.52; // camera looks down onto the tower
const tierY = (i: number, count: number) => (i - (count - 1) / 2) * TIER_GAP;

/**
 * A rotating tower of four tiers with the globe core on its spine.
 * Each step turns the tower a quarter, slides the active tier toward the viewer,
 * lets the others recede, and moves the core up or down to the active tier.
 */
export function drawTower({ ctx: c, w, h }: Surface, t: number, paint: Paint, state: TowerState, settle: boolean) {
  const count = state.emphasis.length;

  // Ease every animated value toward the active tier (time-based, so it is frame-rate independent).
  const dt = settle || state.last < 0 ? Infinity : Math.max(0, t - state.last);
  state.last = t;
  const ease = (rate: number) => (dt === Infinity ? 1 : 1 - Math.exp(-dt * rate));
  const targetAngle = Math.PI / 4 - (state.active * Math.PI) / 2;
  state.angle += (targetAngle - state.angle) * ease(6);
  state.emphasis.forEach((e, i) => (state.emphasis[i] = e + (+(i === state.active) - e) * ease(8)));
  state.orb += (tierY(state.active, count) - state.orb) * ease(7);

  c.clearRect(0, 0, w, h);
  const unit = Math.min(w / 560, h / 580) * 122;
  const cx = w * 0.47;
  const cy = h * 0.5;
  const yaw = state.angle + Math.sin(t * 0.4) * 0.04;
  const focal = 6;
  const toCamera = ([x, y, z]: Vec, forward = 0): Vec => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(TILT) - z1 * Math.sin(TILT);
    const z2 = y * Math.sin(TILT) + z1 * Math.cos(TILT);
    return [x1, y2, z2 + forward];
  };
  const project = ([x, y, z]: Vec): [number, number] => {
    const k = focal / (focal - z);
    return [cx + x * unit * k, cy + y * unit * k];
  };

  // Ambient field behind the tower.
  const field = c.createRadialGradient(cx, cy, 0, cx, cy, unit * 2.2);
  field.addColorStop(0, paint("26"));
  field.addColorStop(1, paint("00"));
  c.fillStyle = field;
  c.fillRect(0, 0, w, h);

  // Corner pillars and the central spine, with packets flowing toward the active tier.
  const top = tierY(0, count);
  const bottom = tierY(count - 1, count) + TIER_THICK;
  c.setLineDash([2, 5]);
  c.lineWidth = 0.8;
  for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]]) {
    const a = project(toCamera([px * TIER_HALF * 0.92, top - 0.25, pz * TIER_HALF * 0.92]));
    const b = project(toCamera([px * TIER_HALF * 0.92, bottom + 0.25, pz * TIER_HALF * 0.92]));
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.strokeStyle = paint(px || pz ? "30" : "55");
    c.stroke();
  }
  c.setLineDash([]);
  for (let k = 0; k < 4; k++) {
    const corner = [[1, 1], [1, -1], [-1, 1], [-1, -1]][k];
    const span = bottom - top + 0.5;
    const y = top - 0.25 + ((t * 0.35 + k * 0.27) % 1) * span;
    const [x, py] = project(toCamera([corner[0] * TIER_HALF * 0.92, y, corner[1] * TIER_HALF * 0.92]));
    const near = Math.max(0, 1 - Math.abs(y - state.orb) / 0.8);
    c.fillStyle = paint(hex(0x60 + near * 0x9f));
    c.beginPath();
    c.arc(x, py, 1.4 + near * 1.6, 0, Math.PI * 2);
    c.fill();
  }

  // Build each tier in camera space; the active one slides forward and grows, the rest recede.
  const tiers = state.emphasis.map((e, i) => {
    const y = tierY(i, count);
    const half = TIER_HALF * (1 + e * 0.05);
    const forward = e * 0.45 - (1 - e) * 0.12;
    const corner = (x: number, yy: number, z: number) => toCamera([x * half, yy, z * half], forward);
    const topFace = [corner(-1, y, -1), corner(1, y, -1), corner(1, y, 1), corner(-1, y, 1)];
    const lower = [corner(-1, y + TIER_THICK, -1), corner(1, y + TIER_THICK, -1), corner(1, y + TIER_THICK, 1), corner(-1, y + TIER_THICK, 1)];
    const depth = topFace.reduce((sum, p) => sum + p[2], 0) / 4;
    return { i, e, y, half, forward, topFace, lower, depth };
  });

  const drawTier = (tier: (typeof tiers)[number]) => {
    const { e, topFace, lower } = tier;
    const top2 = topFace.map(project);
    const low2 = lower.map(project);
    // Visible side walls (outward normal facing the camera).
    for (let k = 0; k < 4; k++) {
      const n = (k + 1) % 4;
      const mid: Vec = [
        (topFace[k][0] + topFace[n][0]) / 2 - (topFace[0][0] + topFace[2][0]) / 2,
        0,
        (topFace[k][2] + topFace[n][2]) / 2 - (topFace[0][2] + topFace[2][2]) / 2,
      ];
      if (mid[2] <= 0) continue;
      c.beginPath();
      c.moveTo(top2[k][0], top2[k][1]);
      c.lineTo(top2[n][0], top2[n][1]);
      c.lineTo(low2[n][0], low2[n][1]);
      c.lineTo(low2[k][0], low2[k][1]);
      c.closePath();
      c.fillStyle = paint(hex(0x18 + e * 0x60));
      c.fill();
      c.strokeStyle = paint(hex(0x40 + e * 0xbf));
      c.lineWidth = 0.6 + e * 0.8;
      c.stroke();
    }
    // Top face with an inner grid.
    c.beginPath();
    top2.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = paint(hex(0x0c + e * 0x48));
    c.fill();
    c.save();
    c.clip();
    c.strokeStyle = paint(hex(0x18 + e * 0x30));
    c.lineWidth = 0.6;
    for (let g = 1; g < 6; g++) {
      const f = g / 6;
      const a1 = lerpVec(topFace[0], topFace[1], f);
      const b1 = lerpVec(topFace[3], topFace[2], f);
      const a2 = lerpVec(topFace[0], topFace[3], f);
      const b2 = lerpVec(topFace[1], topFace[2], f);
      for (const [a, b] of [[a1, b1], [a2, b2]]) {
        const [x1, y1] = project(a);
        const [x2, y2] = project(b);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      }
    }
    c.restore();
    c.beginPath();
    top2.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.strokeStyle = paint(hex(0x55 + e * 0xaa));
    c.lineWidth = 0.8 + e * 1.4;
    c.shadowColor = paint();
    c.shadowBlur = e * 22;
    c.stroke();
    c.shadowBlur = 0;

    // Tier code beside the right-most corner.
    const right = top2.reduce((best, p) => (p[0] > best[0] ? p : best));
    c.font = `${Math.round(9 + e * 2) * (unit / 150)}px monospace`;
    c.fillStyle = e > 0.5 ? state.ink : paint(hex(0x70 + e * 0x8f));
    // Keep the label inside the canvas whatever the tower's rotation.
    const label = FLOOR_CODES[tier.i];
    const lx = Math.min(right[0] + 12 * (unit / 150), w - c.measureText(label).width - 6);
    c.fillText(label, lx, right[1] + 4);
  };

  // Painter's order, far to near; the core is drawn just above the active tier.
  const ordered = [...tiers].sort((a, b) => a.depth - b.depth);
  const activeTier = tiers[state.active];
  ordered.forEach((tier) => {
    drawTier(tier);
    if (tier === activeTier) {
      const centre = toCamera([0, state.orb - 0.42, 0], activeTier.forward);
      const [ox, oy] = project(centre);
      drawGlobeCore(c, ox, oy, unit * 0.36, t, paint);
    }
  });
}

const lerpVec = (a: Vec, b: Vec, f: number): Vec => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
