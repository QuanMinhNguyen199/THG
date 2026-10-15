"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

type Props = { timeline: RefObject<number>; step: number; onStep: (step: number) => void; running: boolean };
const RED = "#c1152b";
const POSITIONS: [number, number, number][] = [[-3.1, 0, 0.45], [-1.05, 0.22, -0.35], [1.15, 0, -0.35], [3.2, 0, 0.45]];
const phase = (time: number) => time < 1.8 ? 0 : time < 4.2 ? 1 : time < 7.2 ? 2 : 3;

function Slab({ position, size, color = "#f3f4f6" }: { position: [number, number, number]; size: [number, number, number]; color?: string }) {
  return <RoundedBox args={size} position={position} radius={0.045} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.38} metalness={0.12} />
  </RoundedBox>;
}

function Route({ start, end, index, timeline, step }: { start: [number, number, number]; end: [number, number, number]; index: number; timeline: RefObject<number>; step: number }) {
  const dot = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(start[0], 0.13, start[2]),
    new THREE.Vector3((start[0] + end[0]) / 2, 0.13, start[2]),
    new THREE.Vector3((start[0] + end[0]) / 2, 0.13, end[2]),
    new THREE.Vector3(end[0], 0.13, end[2]),
  ], false, "centripetal"), [start, end]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 40, 0.018, 6, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!dot.current) return;
    const t = timeline.current;
    // Hold all traffic at approval for three seconds; output only follows this checkpoint.
    const progress = index === 0 ? t / 1.8 : index === 1 ? (t - 1.8) / 2.4 : (t - 7.2) / 1.8;
    dot.current.visible = progress >= 0 && progress <= 1;
    dot.current.position.copy(curve.getPoint(THREE.MathUtils.clamp(progress, 0, 1)));
  });
  return <><mesh geometry={geometry}><meshBasicMaterial color={step > index ? RED : "#b9c0ca"} /></mesh>
    <mesh ref={dot}><sphereGeometry args={[0.072, 12, 12]} /><meshBasicMaterial color={RED} /></mesh></>;
}

function Model({ timeline, step, onStep, running }: Props) {
  const { camera, size, invalidate, pointer } = useThree();
  const group = useRef<THREE.Group>(null);
  const lastFrame = useRef(0);
  useEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = Math.min(size.width / 8.4, size.height / 3.8);
    ortho.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  useEffect(() => { invalidate(); }, [step, running, invalidate]);
  useEffect(() => {
    if (!running) return;
    lastFrame.current = 0;
    const timer = setInterval(() => { if (!document.hidden) invalidate(); else lastFrame.current = 0; }, 1000 / 30);
    return () => clearInterval(timer);
  }, [running, invalidate]);
  useFrame(() => {
    const now = performance.now();
    if (running && !document.hidden) {
      if (lastFrame.current) timeline.current = (timeline.current + Math.min((now - lastFrame.current) / 1000, 0.08)) % 10;
      lastFrame.current = now;
      const next = phase(timeline.current);
      if (step !== next) onStep(next);
    }
    if (group.current && running) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.06, 5, 1 / 30);
  });
  return <>
    <ambientLight intensity={2.1} />
    <directionalLight position={[-3, 8, 4]} intensity={3} castShadow shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.001} />
    <directionalLight position={[4, 3, -4]} intensity={1.3} />
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} /><shadowMaterial transparent opacity={0.12} />
      </mesh>
      {POSITIONS.slice(0, 3).map((position, index) => <Route key={index} start={position} end={POSITIONS[index + 1]}
        index={index} timeline={timeline} step={step} />)}
      {POSITIONS.map((position, index) => <group key={index} position={position}>
        <Slab position={[0, -0.01, 0]} size={[1.48, 0.18, 1.45]} />
        <Slab position={[0, 0.095, 0]} size={[1.39, 0.035, 1.36]} color={step === index ? RED : "#dce0e5"} />
        {index === 0 && <group rotation={[0, -0.12, 0]}>
          {[0, 1, 2].map(sheet => <Slab key={sheet} position={[sheet * 0.065, 0.18 + sheet * 0.06, 0]} size={[0.88, 0.04, 1.13]} color="#ffffff" />)}
          {[0, 1, 2, 3].map(line => <Slab key={line} position={[0.13, 0.325, -0.31 + line * 0.16]} size={[line === 3 ? 0.33 : 0.58, 0.015, 0.035]} color={line === 0 ? RED : "#a4acb8"} />)}
        </group>}
        {index === 1 && <>
          <Slab position={[0, 0.22, 0]} size={[1.12, 0.17, 1.1]} color="#ccd2da" />
          <Slab position={[0, 0.37, 0]} size={[0.96, 0.15, 0.94]} color="#232c39" />
          <Slab position={[0, 0.48, 0]} size={[0.72, 0.09, 0.7]} color="#ffffff" />
          {[-1, 0, 1].map(line => <Slab key={line} position={[line * 0.17, 0.535, 0]} size={[0.06, 0.018, 0.39]} color={RED} />)}
          {[0, 1, 2, 3].map(side => <group key={side} rotation={[0, side * Math.PI / 2, 0]}>
            {[-0.36, -0.12, 0.12, 0.36].map(pin => <Slab key={pin} position={[pin, 0.3, 0.62]} size={[0.08, 0.06, 0.22]} color="#8994a4" />)}
          </group>)}
        </>}
        {index === 2 && <group>
          <mesh position={[0, 0.91, 0]} castShadow><sphereGeometry args={[0.19, 24, 24]} /><meshStandardMaterial color="#4b5565" roughness={0.5} /></mesh>
          <mesh position={[0, 0.5, 0]} castShadow><capsuleGeometry args={[0.19, 0.25, 6, 16]} /><meshStandardMaterial color="#4b5565" roughness={0.5} /></mesh>
          <Slab position={[0.37, 0.47, 0.23]} size={[0.48, 0.52, 0.08]} color={step >= 2 ? RED : "#c5ccd5"} />
          <mesh position={[0.3, 0.45, 0.28]} rotation={[0, 0, 0.65]}><boxGeometry args={[0.07, 0.18, 0.02]} /><meshBasicMaterial color="white" /></mesh>
          <mesh position={[0.42, 0.49, 0.28]} rotation={[0, 0, -0.65]}><boxGeometry args={[0.07, 0.3, 0.02]} /><meshBasicMaterial color="white" /></mesh>
        </group>}
        {index === 3 && <group rotation={[-0.22, 0, 0]}>
          <Slab position={[0, 0.55, 0]} size={[1.02, 0.86, 0.09]} color="#ffffff" />
          {[0, 1, 2].map(row => <group key={row}>
            <Slab position={[-0.31, 0.78 - row * 0.21, 0.065]} size={[0.11, 0.11, 0.025]} color={step === 3 ? RED : "#cbd1d9"} />
            <Slab position={[0.1, 0.78 - row * 0.21, 0.065]} size={[0.48, 0.04, 0.02]} color="#8e98a7" />
          </group>)}
        </group>}
      </group>)}
    </group>
  </>;
}

export default function AgentWorkflowScene(props: Props) {
  return <Canvas orthographic camera={{ position: [5, 7, 10], zoom: 60, near: 0.1, far: 60 }}
    frameloop="demand" dpr={[1, 1.5]} shadows gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    fallback={<p>Yêu cầu → Agent xử lý → Con người duyệt → Kết quả</p>} aria-hidden="true">
    <Model {...props} />
  </Canvas>;
}
