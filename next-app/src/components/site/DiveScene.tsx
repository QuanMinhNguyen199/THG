"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { FRAME_MS, fullyInView, isScrolling } from "./frameBudget";
import { GeoCoreModel, type CoreMotion } from "./GeoCoreModel";

export type StageColors = { ink: string; accent: string; node: string; pulse: string };
const FPS = 60;
const OUTER_DISTANCE = 12.7;
const INNER_DISTANCE = 4.2;

type SceneProps = {
  active: number;
  progress: RefObject<number>;
  still: boolean;
  colors: StageColors;
};

// Keep one continuous camera curve, with no changes of speed at tier boundaries.
function Rig({ active, progress, still, running, motion }: SceneProps & { running: boolean; motion: CoreMotion }) {
  const { camera, pointer, invalidate, size } = useThree();
  const origin = useMemo(() => new THREE.Vector3(), []);
  // The processor and result sit at different depths; fit both against the actual canvas aspect.
  const closeFrame = useMemo(() => {
    const rotation = new THREE.Euler(0.17, -0.13, -0.025);
    const corners: THREE.Vector3[] = [];
    for (const [min, max] of [
      [[-2.82, -1.17, -0.05], [-0.48, 1.17, 0.4]],
      [[-0.5, -0.735, 0.9], [1.4, 0.495, 0.9]],
    ]) {
      for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
        corners.push(new THREE.Vector3(x, y, z).multiplyScalar(1.1).applyEuler(rotation));
      }
    }
    const bounds = new THREE.Box3().setFromPoints(corners);
    const center = bounds.getCenter(new THREE.Vector3());
    const tan = Math.tan(THREE.MathUtils.degToRad(48 / 2));
    const aspect = size.width / Math.max(size.height, 1);
    const distance = Math.max(INNER_DISTANCE, ...corners.map(point => point.z + Math.max(
      (Math.abs(point.x - center.x) + 0.2) / (tan * aspect),
      (Math.abs(point.y - center.y) + 0.2) / tan,
    )));
    return { center, distance };
  }, [size.width, size.height]);
  useEffect(() => { invalidate(); }, [active, still, invalidate]);
  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    if (running && !document.hidden) motion.current.time += step;
    motion.current.tier = still ? active : THREE.MathUtils.damp(motion.current.tier, progress.current, 14, step);
    const p = THREE.MathUtils.clamp(motion.current.tier / 3, 0, 1);
    motion.current.distance = Math.exp(THREE.MathUtils.lerp(Math.log(OUTER_DISTANCE), Math.log(closeFrame.distance), p));
    const focus = THREE.MathUtils.smoothstep(p, 0.2, 1);
    origin.set(closeFrame.center.x * focus, closeFrame.center.y * focus, 0.3 * focus);
    const px = origin.x + (still ? 0 : pointer.x * 0.14);
    const py = origin.y + (still ? 0 : pointer.y * 0.1);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, 5, step);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, 5, step);
    camera.position.z = motion.current.distance;
    camera.lookAt(origin);
  }, -1);
  return null;
}

/** Renders at most 60 frames per second (no wasted frames on 120/144 Hz screens). */
function FrameCap({ running }: { running: boolean }) {
  const { invalidate, gl } = useThree();
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= FRAME_MS && !(isScrolling() && !fullyInView(gl.domElement))) {
        last = now;
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, invalidate, gl]);
  return null;
}

function Scene({ active, progress, still, running, colors }: SceneProps & { running: boolean }) {
  const { gl, invalidate } = useThree();
  const motion = useRef({ tier: progress.current, time: 0, distance: OUTER_DISTANCE });
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    invalidate();
  }, [colors, gl, invalidate]);
  return <>
    <FrameCap running={running} />
    <Rig active={active} progress={progress} still={still} running={running} colors={colors} motion={motion} />
    <GeoCoreModel motion={motion} colors={colors} />
    <ambientLight intensity={1.5} />
    <directionalLight position={[-3, 4, 5]} intensity={3} />
    <directionalLight position={[3, -2, -2]} intensity={1.2} color="#b7c2d4" />
  </>;
}

export default function DiveScene({ active, progress, still, visible, colors }: SceneProps & { visible: boolean }) {
  return <Canvas
    className="dive-canvas"
    frameloop="demand"
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, OUTER_DISTANCE], fov: 48, near: 0.05, far: 60 }}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    aria-hidden
  >
    <Scene active={active} progress={progress} still={still} running={visible && !still} colors={colors} />
  </Canvas>;
}
