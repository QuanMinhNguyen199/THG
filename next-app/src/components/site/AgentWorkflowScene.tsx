"use client";

// A studio product shot: graphite laptop with a red-backlit keyboard and an LED strip, a desk
// keyboard and a mouse on a glossy desk that runs the full width of the banner, seen nearly head-on
// from slightly above. The canvas covers the whole banner (the wall above the desk is transparent,
// so the CSS backdrop shows through) while a lens shift keeps the laptop centred on its layout slot.
// The screen is real HTML (the live demo chat), mapped onto the perspective screen with a CSS
// homography, so focus and typing stay native. The scene itself is static: it renders on mount and
// resize only, and the LED strip's animation is a small CSS layer laid over the projected strip.

import { Canvas, useThree, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import * as THREE from "three";

/**
 * Anodised, bead-blasted aluminium: three's physical anisotropy stretches highlights along the
 * brushing direction the way real machined metal does, with no procedural noise to shimmer.
 */
function Finish({ color, roughness, metalness, brushed = true }: { color: string; roughness: number; metalness: number; brushed?: boolean }) {
  return (
    <meshPhysicalMaterial color={color} roughness={roughness} metalness={metalness} anisotropy={brushed ? 0.55 : 0}
      clearcoat={0.18} clearcoatRoughness={0.35} envMapIntensity={1.1} />
  );
}

function Slab({ position, size, color, radius = 0.04, roughness = 0.34, metalness = 0.55, rotation }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  radius?: number; roughness?: number; metalness?: number; rotation?: [number, number, number];
}) {
  return (
    <RoundedBox args={size} position={position} rotation={rotation} radius={Math.min(radius, ...size.map((s) => s * 0.45))} smoothness={4} castShadow receiveShadow>
      <Finish color={color} roughness={roughness} metalness={metalness} />
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
/** Unit keycap: a softly bevelled, slightly domed rounded square, scaled per key by the instance. */
function useKeycapGeometry() {
  const geometry = useMemo(() => {
    const r = 0.16;
    const s = new THREE.Shape();
    s.moveTo(-0.5 + r, -0.5);
    s.lineTo(0.5 - r, -0.5);
    s.quadraticCurveTo(0.5, -0.5, 0.5, -0.5 + r);
    s.lineTo(0.5, 0.5 - r);
    s.quadraticCurveTo(0.5, 0.5, 0.5 - r, 0.5);
    s.lineTo(-0.5 + r, 0.5);
    s.quadraticCurveTo(-0.5, 0.5, -0.5, 0.5 - r);
    s.lineTo(-0.5, -0.5 + r);
    s.quadraticCurveTo(-0.5, -0.5, -0.5 + r, -0.5);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.07, bevelSegments: 3, curveSegments: 6 });
    g.rotateX(-Math.PI / 2);
    g.center();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function KeyField({ keys, W, D, y }: { keys: Key[]; W: number; D: number; y: number }) {
  const caps = useRef<THREE.InstancedMesh>(null);
  const keycap = useKeycapGeometry();
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
      <instancedMesh ref={caps} args={[keycap, undefined, keys.length]} castShadow>
        <meshPhysicalMaterial color="#121318" roughness={0.55} metalness={0.05} clearcoat={0.25} clearcoatRoughness={0.6} />
      </instancedMesh>
      <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        {/* Slightly over-bright so the bloom pass gives the legends a faint halo. */}
        <meshBasicMaterial map={legends} color={[4.5, 4.5, 4.5]} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- laptop + desk props */

const BODY = "#343a45";
const BODY_EDGE = "#626d7e";
const DESK_BACK_Z = -5.5; // where the desk meets the wall, behind the laptop
const LID_TILT = -0.2; // opened a little past vertical
const SCREEN_W = 5.78;
const SCREEN_H = SCREEN_W * 0.625; // 16:10

function Laptop({ screenRef }: { screenRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group>
      {/* anodised graphite unibody with a slightly brighter machined edge */}
      <Slab position={[0, 0.05, 0]} size={[6.4, 0.1, 4.4]} color={BODY_EDGE} radius={0.06} roughness={0.4} metalness={0.5} />
      <Slab position={[0, 0.115, 0]} size={[6.4, 0.07, 4.4]} color={BODY} radius={0.06} roughness={0.4} metalness={0.55} />
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
      <Slab position={[0, 0.152, 1.22]} size={[2.9, 0.012, 1.5]} color="#252d3a" radius={0.08} roughness={0.32} metalness={0.2} />
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
        <Slab position={[0, 2.13, -0.03]} size={[6.4, 4.26, 0.06]} color={BODY} radius={0.07} roughness={0.38} metalness={0.55} />
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
    <group position={[0, 0, 4.25]} rotation={[0.035, 0, 0]}>
      <Slab position={[0, 0.09, 0]} size={[4.62, 0.18, 1.72]} color={BODY} radius={0.07} roughness={0.4} metalness={0.45} />
      <KeyField keys={DESK_KEYS} W={4.3} D={1.45} y={0.205} />
    </group>
  );
}

function Mouse() {
  const seam = useMemo(() => {
    const points = Array.from({ length: 10 }, (_, index) => {
      const z = -0.54 + index / 9 * 0.29;
      return new THREE.Vector3(0, 0.17 + 0.2 * Math.sqrt(1 - (z / 0.62) ** 2) + 0.003, z);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.006, 4, false);
  }, []);
  useEffect(() => () => seam.dispose(), [seam]);
  return (
    <group position={[4.1, 0, 2.5]} rotation={[0, -0.12, 0]}>
      <mesh position={[0, 0.17, 0]} scale={[0.36, 0.2, 0.62]} castShadow>
        <sphereGeometry args={[1, 40, 24]} />
        <Finish color="#303745" roughness={0.3} metalness={0.18} brushed={false} />
      </mesh>
      <mesh position={[0, 0.353, -0.19]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.105, 20]} /><meshStandardMaterial color="#11151d" roughness={0.85} />
      </mesh>
      <mesh geometry={seam}><meshBasicMaterial color="#141a24" /></mesh>
      {/* lit logo strip */}
      <mesh position={[0, 0.3, 0.32]} rotation={[-1.05, 0, 0]}>
        <planeGeometry args={[0.07, 0.14]} />
        <meshBasicMaterial color={GLOW} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * The desk: one wide, glossy surface from the wall line forward, past every edge of the frame. Its
 * blurred reflection picks up the laptop and the LED strip, and it receives the real shadows.
 */
function Desk() {
  const depth = 40;
  // Grey-scale ramp for the wall band (alphaMap reads the green channel): dark at the desk line,
  // clear a hand's width up, like the soft occlusion where a desk meets a wall.
  const ramp = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#000");
    grad.addColorStop(1, "#8c8c8c");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => ramp.dispose(), [ramp]);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, DESK_BACK_Z + depth / 2]} receiveShadow>
        <planeGeometry args={[90, depth]} />
        {/* Satin lacquer in a deep brand-red brown: light enough for shadows and AO to read, glossy
            enough for a soft, blurred reflection of the laptop and the LED strip. */}
        <MeshReflectorMaterial
          color="#74303a"
          roughness={0.5}
          metalness={0.15}
          blur={[240, 60]}
          resolution={512}
          mixBlur={0.9}
          mixStrength={2.6}
          mixContrast={1.1}
          depthScale={1.2}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
          mirror={0.55}
          envMapIntensity={0.2}
        />
      </mesh>
      {/* the desk's back edge catches the key light */}
      <mesh position={[0, -0.02, DESK_BACK_Z + 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 90, 8]} />
        <meshStandardMaterial color="#7a3640" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.75, DESK_BACK_Z - 0.01]}>
        <planeGeometry args={[90, 1.5]} />
        <meshBasicMaterial color="#1a0307" alphaMap={ramp} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

const LED_COUNT = 56;
const LED_SPAN = 5.6;
const LED_Y = 0.112;
const LED_Z = 2.204;

/**
 * The LED strip as lit in the render (steady, for its bloom and its reflection in the desk). The
 * chasing light on top is CSS (see the stage's `led` layout), so the scene never has to re-render.
 */
function LedStrip() {
  const strip = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = strip.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < LED_COUNT; i++) {
      m.makeTranslation(-LED_SPAN / 2 + (i + 0.5) * (LED_SPAN / LED_COUNT), 0, 0);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={strip} args={[undefined, undefined, LED_COUNT]} position={[0, LED_Y, LED_Z]}>
      <boxGeometry args={[(LED_SPAN / LED_COUNT) * 0.78, 0.036, 0.006]} />
      <meshBasicMaterial color={new THREE.Color(GLOW).multiplyScalar(2.2)} toneMapped={false} />
    </instancedMesh>
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

/** `led` / `ledReflection` place the CSS LED layer over the strip and its mirror image in the desk. */
type ScreenLayout = { style: CSSProperties; compact: boolean; led: CSSProperties; ledReflection: CSSProperties };
/** The laptop's layout slot, in canvas pixels (the canvas covers the whole banner). */
export type SceneFrame = { x: number; y: number; w: number; h: number };

function Stage({ onLayout, frame }: { onLayout: (layout: ScreenLayout) => void; frame: SceneFrame }) {
  const { camera, size, scene, invalidate } = useThree();
  // R3F's size also carries the canvas's page offset, which changes on every scroll; depend only on
  // the dimensions, or the scene re-renders (and the screen overlay re-maps) throughout a scroll.
  const { width, height } = size;
  const screenRef = useRef<THREE.Mesh>(null);
  const narrow = frame.w < 520;
  const panelWidth = narrow ? 440 : 760;
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera & { manual?: boolean };
    // R3F would reset the aspect on resize and undo the lens shift below; this camera is ours.
    cam.manual = true;
    cam.fov = narrow ? 30 : 26;
    cam.aspect = frame.w / frame.h;
    // Nearly eye level and head-on; the live HTML screen follows the projected corners.
    cam.position.set(0, narrow ? 5.0 : 4.9, 15.6);
    cam.lookAt(0, 1.85, 0.9);
    // Lens shift: frame the shot for the layout slot as before, then widen the film to the whole
    // canvas around it, so the desk and its reflections run edge to edge without moving the laptop.
    cam.setViewOffset(frame.w, frame.h, -frame.x, -frame.y, width, height);
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
    // The strip's ends and edges in canvas pixels (the camera has no roll, so it is a level line),
    // and the same for its reflection, mirrored in the desk plane.
    const toPx = (x: number, y: number, z: number) => {
      const v = new THREE.Vector3(x, y, z).project(cam);
      return [(v.x + 1) * (width / 2), (1 - v.y) * (height / 2)];
    };
    const ledBox = (y: number) => {
      const [left, top] = toPx(-LED_SPAN / 2, y + 0.018, LED_Z);
      const [right, bottom] = toPx(LED_SPAN / 2, y - 0.018, LED_Z);
      return { left, top: Math.min(top, bottom), width: right - left, height: Math.max(1.5, Math.abs(bottom - top)) };
    };
    onLayout({
      led: ledBox(LED_Y),
      ledReflection: ledBox(-LED_Y),
      compact: panelWidth < 500,
      style: { width: panelWidth, height: panelHeight, transform: homography(panelWidth, panelHeight, px), transformOrigin: "0 0" },
    });
    invalidate();
  }, [camera, width, height, scene, panelWidth, narrow, frame.x, frame.y, frame.w, frame.h, invalidate, onLayout]);

  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Studio softboxes: a large overhead key, a front fill and neutral side strips that draw the
          edge highlights along the machined body; a faint rose wash from behind ties it to the set. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" position={[0, 8, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 6, 1]} intensity={3.2} />
        <Lightformer form="rect" position={[0, 2.5, 10]} scale={[12, 3, 1]} intensity={1.4} />
        <Lightformer form="rect" position={[-8, 2.5, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 7, 1]} intensity={2.4} />
        <Lightformer form="rect" position={[8, 2.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 7, 1]} intensity={2} />
        <Lightformer form="rect" position={[0, 3, -8]} scale={[16, 6, 1]} color="#f08aa0" intensity={0.8} />
      </Environment>
      {/* Key light, and the only shadow caster: soft PCF shadows of the laptop, the lid and the props
          fall on the desk; the AO pass adds the contact darkening where things touch down. */}
      <directionalLight
        position={[-9, 9, 4]}
        intensity={4.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
      />
      {/* red key and LED light spilling onto the desk in front of the laptop */}
      <pointLight position={[0, 0.3, 2.9]} color={GLOW} intensity={1.6} distance={4} decay={2} />
      <Desk />
      <Laptop screenRef={screenRef} />
      <LedStrip />
      <DeskKeyboard />
      {/* The mouse is a desktop-only prop; on narrow stages it would fall off the edge. */}
      {!narrow && <Mouse />}
      {/* Post-processing, run only when the static scene renders (mount, resize): N8AO ambient
          occlusion for contact shadows, bloom for the LEDs and backlit keys, ACES tone mapping and
          SMAA anti-aliasing (much lighter than multisampling the half-float composer targets). */}
      <EffectComposer multisampling={0}>
        <N8AO halfRes aoRadius={1.4} distanceFalloff={0.8} intensity={3} quality="performance" />
        <Bloom mipmapBlur luminanceThreshold={1.3} luminanceSmoothing={0.2} intensity={1.1} radius={0.6} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default function AgentWorkflowScene({ children, frame, animate }: { children: ReactNode; frame: SceneFrame; animate: boolean }) {
  const [screen, setScreen] = useState<ScreenLayout | null>(null);
  const onLayout = useCallback((l: ScreenLayout) => setScreen(l), []);
  return (
    <>
      <Canvas
        camera={{ fov: 27, near: 0.1, far: 80 }}
        frameloop="demand"
        resize={{ scroll: false, debounce: 120 }}
        // The canvas spans the banner and runs a post-processing chain, so density is capped at 1.5x;
        // the composer's MSAA does the anti-aliasing (the default framebuffer needs none).
        dpr={[1, 1.5]}
        shadows="percentage"
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Stage onLayout={onLayout} frame={frame} />
      </Canvas>
      {screen && (
        <>
          {/* The LED strip's chasing light and double blink, on a compositor-cheap CSS layer; it
              only runs while the banner is on screen and motion is allowed. */}
          <div className={`ca-laptop-led${animate ? " is-running" : ""}`} style={screen.led} aria-hidden="true" />
          <div className={`ca-laptop-led is-reflection${animate ? " is-running" : ""}`} style={screen.ledReflection} aria-hidden="true" />
        </>
      )}
      {screen && (
        <div className={`ca-laptop-screen-content ca-laptop-screen-overlay${screen.compact ? " is-compact" : ""}`} style={screen.style}>
          {children}
        </div>
      )}
    </>
  );
}
