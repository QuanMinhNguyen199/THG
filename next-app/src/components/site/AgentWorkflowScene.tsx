"use client";

// A night-desk product shot: graphite laptop with a red-backlit keyboard, a desk keyboard and mouse
// on a mat, seen nearly head-on from slightly above. The screen is real HTML (the live demo chat),
// mapped onto the perspective screen with a CSS homography, so focus and typing stay native.

import { Canvas, useThree, type ThreeElements } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as THREE from "three";

function Slab({ position, size, color, radius = 0.04, roughness = 0.34, metalness = 0.55, rotation }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  radius?: number; roughness?: number; metalness?: number; rotation?: [number, number, number];
}) {
  return (
    <RoundedBox args={size} position={position} rotation={rotation} radius={Math.min(radius, ...size.map((s) => s * 0.45))} smoothness={4} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </RoundedBox>
  );
}

/** Flat rounded rectangle lying in the XY plane (for thin glass, where a rounded box would distort). */
function RoundedPlane({ w, h, r, children, ...props }: { w: number; h: number; r: number; children: ReactNode } & ThreeElements["mesh"]) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.ShapeGeometry(s, 12);
  }, [w, h, r]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} {...props}>
      {children}
    </mesh>
  );
}

/* ---------------------------------------------------------------- keyboards */

type Key = { x: number; z: number; w: number; d: number };

const LAPTOP_ROWS: number[][] = [
  Array(14).fill(1),
  Array(14).fill(1),
  [1.5, ...Array(12).fill(1), 1.5],
  [1.8, ...Array(11).fill(1), 1.9],
  [2.4, ...Array(10).fill(1), 2.4],
  [1, 1, 1, 1.3, 5.2, 1.3, 1, 1, 1],
];
// A 60% desk keyboard: no function row.
const DESK_ROWS = LAPTOP_ROWS.slice(1);

/** Lays out key caps row by row; a function row (if any) is drawn at roughly half depth. */
function layoutKeys(rows: number[][], W: number, D: number, fnRow: boolean): Key[] {
  const unit = D / (rows.length - (fnRow ? 0.45 : 0));
  let z = -D / 2;
  return rows.flatMap((row, r) => {
    const depth = fnRow && r === 0 ? unit * 0.55 : unit;
    const total = row.reduce((a, b) => a + b, 0);
    let x = -W / 2;
    const keys = row.map((span) => {
      const w = (span / total) * W;
      const key = { x: x + w / 2, z: z + depth / 2, w: w - 0.05, d: depth - 0.05 };
      x += w;
      return key;
    });
    z += depth;
    return keys;
  });
}

const LAPTOP_KEYS = layoutKeys(LAPTOP_ROWS, 5.05, 2.0, true);
const DESK_KEYS = layoutKeys(DESK_ROWS, 4.3, 1.45, false);

const GLOW = "#ff2d48";
const LEGENDS = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";

/**
 * Backlit key field: the caps are one instanced mesh (a single draw call), the red light leaking
 * between them is an unlit plane underneath, and the glowing legends are one canvas texture.
 */
function KeyField({ keys, W, D, y }: { keys: Key[]; W: number; D: number; y: number }) {
  const caps = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = caps.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, 0, k.z), q, new THREE.Vector3(k.w, 1, k.d));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [keys]);
  const legends = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * D) / W);
    const g = c.getContext("2d")!;
    g.fillStyle = GLOW;
    g.shadowColor = GLOW;
    g.shadowBlur = 10;
    g.font = "bold 20px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    keys.forEach((k, i) => {
      const cx = ((k.x + W / 2) / W) * c.width;
      const cy = ((k.z + D / 2) / D) * c.height;
      if (k.w > 0.55) g.fillRect(cx - 9, cy - 1, 18, 2);
      else g.fillText(LEGENDS[i % LEGENDS.length], cx, cy);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [keys, W, D]);
  useEffect(() => () => legends.dispose(), [legends]);
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, -0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W + 0.1, D + 0.08]} />
        <meshBasicMaterial color="#6d0717" toneMapped={false} />
      </mesh>
      <instancedMesh ref={caps} args={[undefined, undefined, keys.length]} castShadow>
        <boxGeometry args={[1, 0.035, 1]} />
        <meshStandardMaterial color="#0d0e11" roughness={0.5} metalness={0.15} />
      </instancedMesh>
      <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshBasicMaterial map={legends} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- laptop + desk props */

const BODY = "#24262c";
const BODY_EDGE = "#2c2e35";
const LID_TILT = -0.2; // opened a little past vertical
const SCREEN_W = 5.78;
const SCREEN_H = SCREEN_W * 0.625; // 16:10

function Laptop({ screenRef }: { screenRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group>
      {/* anodised graphite unibody with a slightly brighter machined edge */}
      <Slab position={[0, 0.05, 0]} size={[6.4, 0.1, 4.4]} color={BODY_EDGE} radius={0.06} roughness={0.4} metalness={0.5} />
      <Slab position={[0, 0.115, 0]} size={[6.4, 0.07, 4.4]} color={BODY} radius={0.06} roughness={0.6} metalness={0.35} />
      <group position={[0, 0, -0.78]}>
        <KeyField keys={LAPTOP_KEYS} W={5.05} D={2.0} y={0.17} />
      </group>
      {/* speaker grilles either side of the keyboard */}
      {[-2.92, 2.92].map((x) => (
        <mesh key={x} position={[x, 0.152, -0.78]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.34, 2.0]} />
          <meshStandardMaterial color="#111216" roughness={0.9} />
        </mesh>
      ))}
      {/* glass trackpad with a lit front lip */}
      <Slab position={[0, 0.152, 1.22]} size={[2.9, 0.012, 1.5]} color="#1e1f24" radius={0.08} roughness={0.7} metalness={0.05} />
      <mesh position={[0, 0.156, 1.97]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.022]} />
        <meshBasicMaterial color={GLOW} toneMapped={false} />
      </mesh>
      {/* hinge */}
      <mesh position={[0, 0.2, -2.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 5.6, 24]} />
        <meshStandardMaterial color="#111215" roughness={0.45} metalness={0.6} />
      </mesh>
      {/* lid */}
      <group position={[0, 0.2, -2.16]} rotation={[LID_TILT, 0, 0]}>
        <Slab position={[0, 2.13, -0.03]} size={[6.4, 4.26, 0.06]} color={BODY} radius={0.07} roughness={0.6} metalness={0.35} />
        <RoundedPlane w={6.32} h={4.18} r={0.07} position={[0, 2.13, 0.002]}>
          <meshPhysicalMaterial color="#050506" roughness={0.08} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
        </RoundedPlane>
        <mesh position={[0, 4.11, 0.014]}>
          <circleGeometry args={[0.028, 20]} />
          <meshBasicMaterial color="#1b1f26" />
        </mesh>
        {/* active screen area: the HTML chat is mapped onto this plane */}
        <mesh ref={screenRef} position={[0, 2.2, 0.014]}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial color="#0b0d10" />
        </mesh>
      </group>
    </group>
  );
}

function DeskKeyboard() {
  return (
    <group position={[0, 0, 3.55]} rotation={[0.035, 0, 0]}>
      <Slab position={[0, 0.09, 0]} size={[4.62, 0.18, 1.72]} color={BODY} radius={0.07} roughness={0.6} metalness={0.3} />
      <KeyField keys={DESK_KEYS} W={4.3} D={1.45} y={0.205} />
    </group>
  );
}

function Mouse() {
  return (
    <group position={[4.55, 0, 2.7]} rotation={[0, -0.12, 0]}>
      <mesh position={[0, 0.17, 0]} scale={[0.36, 0.2, 0.62]} castShadow>
        <sphereGeometry args={[1, 40, 24]} />
        <meshPhysicalMaterial color="#1a1b20" roughness={0.45} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.3} />
      </mesh>
      {/* lit logo strip */}
      <mesh position={[0, 0.3, 0.32]} rotation={[-1.05, 0, 0]}>
        <planeGeometry args={[0.07, 0.14]} />
        <meshBasicMaterial color={GLOW} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DeskMat({ w }: { w: number }) {
  // A dark cloth mat whose edges fade into the wall, so the canvas never shows a hard desk edge.
  const fade = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    r.addColorStop(0, "#fff");
    r.addColorStop(0.55, "#fff");
    r.addColorStop(1, "#000");
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => fade.dispose(), [fade]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 1.2]} receiveShadow>
      <planeGeometry args={[w, 8.6]} />
      <meshStandardMaterial color="#0c0a0d" roughness={0.95} metalness={0} alphaMap={fade} transparent depthWrite={false} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- HTML screen mapping */

/** 3x3 homography taking the unit-sized rectangle (0,0)-(w,h) to the four projected corners. */
function homography(w: number, h: number, dst: [number, number][]) {
  const src: [number, number][] = [[0, 0], [w, 0], [0, h], [w, h]];
  const A: number[][] = [];
  const b: number[] = [];
  src.forEach(([x, y], i) => {
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  });
  // Gaussian elimination with partial pivoting (8x8).
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < 8; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = Array(8).fill(0);
  for (let r = 7; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < 8; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  const [a, bb, c, d, e, f, g, hh] = x;
  return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

type ScreenLayout = { style: CSSProperties; compact: boolean };

function Stage({ onLayout }: { onLayout: (layout: ScreenLayout) => void }) {
  const { camera, size, scene, invalidate } = useThree();
  // R3F's size also carries the canvas's page offset, which changes on every scroll; depend only on
  // the dimensions, or the scene re-renders (and the screen overlay re-maps) throughout a scroll.
  const { width, height } = size;
  const screenRef = useRef<THREE.Mesh>(null);
  const panelWidth = width < 520 ? 440 : 760;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const narrow = width < 520;
    cam.fov = narrow ? 30 : 26;
    cam.aspect = width / height;
    // Nearly eye level and head-on; the live HTML screen follows the projected corners.
    cam.position.set(0, narrow ? 5.2 : 5.2, narrow ? 17 : 17.6);
    cam.lookAt(0, 1.75, 0.9);
    cam.updateProjectionMatrix();
    scene.updateMatrixWorld(true);
    cam.updateMatrixWorld();

    const mesh = screenRef.current;
    if (!mesh) return;
    const corners: [number, number][] = [
      [-SCREEN_W / 2, SCREEN_H / 2],
      [SCREEN_W / 2, SCREEN_H / 2],
      [-SCREEN_W / 2, -SCREEN_H / 2],
      [SCREEN_W / 2, -SCREEN_H / 2],
    ];
    const px = corners.map(([x, y]) => {
      const p = new THREE.Vector3(x, y, 0.002).applyMatrix4(mesh.matrixWorld).project(cam);
      return [(p.x + 1) * (width / 2), (1 - p.y) * (height / 2)] as [number, number];
    });
    const panelHeight = panelWidth * 0.625;
    onLayout({
      compact: panelWidth < 500,
      style: { width: panelWidth, height: panelHeight, transform: homography(panelWidth, panelHeight, px), transformOrigin: "0 0" },
    });
    invalidate();
  }, [camera, width, height, scene, panelWidth, invalidate, onLayout]);

  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Dark studio: a soft overhead key, the brand-red wash from behind and a cool front fill. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" position={[0, 8, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 6, 1]} intensity={1.6} />
        <Lightformer form="rect" position={[0, 3, -8]} scale={[16, 6, 1]} color="#c1152b" intensity={1.1} />
        <Lightformer form="rect" position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 6, 1]} color="#ff4a5f" intensity={0.5} />
        <Lightformer form="rect" position={[0, 2, 10]} scale={[10, 3, 1]} intensity={0.9} />
      </Environment>
      <directionalLight
        position={[-3, 9, 7]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      {/* red key light spilling onto the desk from the keyboards */}
      <pointLight position={[0, 1.6, 2.4]} color={GLOW} intensity={0.5} distance={5} decay={2} />
      <ContactShadows position={[0, 0.006, 0]} opacity={0.75} blur={2.4} scale={16} far={4} resolution={512} frames={1} color="#000000" />
      <DeskMat w={width >= 520 ? 14 : 9} />
      <Laptop screenRef={screenRef} />
      <DeskKeyboard />
      {/* The mouse is a desktop-only prop; on narrow stages it would fall off the edge. */}
      {width >= 520 && <Mouse />}
    </>
  );
}

export default function AgentWorkflowScene({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenLayout | null>(null);
  const onLayout = useCallback((l: ScreenLayout) => setScreen(l), []);
  return (
    <>
      <Canvas
        camera={{ fov: 27, near: 0.1, far: 80 }}
        frameloop="demand"
        resize={{ scroll: false, debounce: 120 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <Stage onLayout={onLayout} />
      </Canvas>
      {screen && (
        <div className={`ca-laptop-screen-content ca-laptop-screen-overlay${screen.compact ? " is-compact" : ""}`} style={screen.style}>
          {children}
        </div>
      )}
    </>
  );
}
