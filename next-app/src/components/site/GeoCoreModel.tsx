"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StageColors } from "./DiveScene";

export type CoreMotion = RefObject<{ tier: number; time: number; distance: number }>;
type Props = { motion: CoreMotion; colors: StageColors };
type Vec = [number, number, number];
const SOURCES: Vec[] = [[-3.7, 1.6, -0.6], [-1.8, 2.8, -0.9], [1.4, 2.9, -0.7], [3.6, 1.3, -1], [3.5, -1.6, -0.8], [1.6, -2.9, -0.7], [-1.5, -2.9, -1], [-3.7, -1.3, -0.8]];
const HUBS: Vec[] = [[-2.2, 1.1, -0.2], [0.8, 1.5, -0.6], [0.9, -1.5, -0.4], [-2.1, -1.3, -0.6]];
const PROCESSOR: Vec = [-1.65, 0, 0.25];
const REPORT: Vec = [0.45, -0.12, 0.9];
const REQUEST: Vec = [-1.65, 1.75, 0.7];
const gate = (tier: number, start: number, end: number) => THREE.MathUtils.smoothstep(tier, start, end);

function texture(width: number, height: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext("2d")!);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  return map;
}

function sourceTexture(index: number) {
  return texture(256, 320, c => {
    c.fillStyle = "#111820"; c.fillRect(0, 0, 256, 320);
    c.strokeStyle = "#718092"; c.lineWidth = 2; c.strokeRect(1, 1, 254, 318);
    c.fillStyle = "#c1152b"; c.fillRect(0, 0, 6, 320);
    c.fillStyle = "#dce4eb"; c.font = "bold 23px Arial";
    c.fillText(["BÁO CÁO", "DỮ LIỆU", "HỒ SƠ", "TÀI LIỆU"][index % 4], 22, 42);
    c.fillStyle = "#738194"; c.font = "14px monospace"; c.fillText(`SOURCE / 0${index + 1}`, 22, 68);
    if (index % 2) {
      c.strokeStyle = "#43515f"; c.lineWidth = 1;
      for (let row = 0; row <= 6; row++) { c.beginPath(); c.moveTo(22, 104 + row * 25); c.lineTo(232, 104 + row * 25); c.stroke(); }
      for (const x of [22, 88, 156, 232]) { c.beginPath(); c.moveTo(x, 104); c.lineTo(x, 254); c.stroke(); }
      c.fillStyle = "#abb7c4";
      for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) c.fillRect(30 + col * 68, 116 + row * 25, 32 + ((row + col) % 3) * 7, 3);
    } else {
      for (let row = 0; row < 10; row++) {
        c.fillStyle = row === 0 || row === 5 ? "#a4b2c0" : "#465562";
        c.fillRect(22, 100 + row * 16, row % 3 === 0 ? 135 : 205, row === 0 ? 5 : 3);
      }
    }
    c.fillStyle = "#c1152b"; c.fillRect(22, 282, 26, 5);
    c.fillStyle = "#6e7a88"; c.fillRect(58, 282, 104, 3);
  });
}

function DocumentNode({ index, motion }: { index: number; motion: CoreMotion }) {
  const group = useRef<THREE.Group>(null), paper = useRef<THREE.MeshBasicMaterial>(null), scan = useRef<THREE.Mesh>(null), scanMat = useRef<THREE.MeshBasicMaterial>(null);
  const map = useMemo(() => sourceTexture(index), [index]);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    const visible = 1 - gate(motion.current.tier, 0.9, 2.05);
    if (paper.current) paper.current.opacity = visible * 0.95;
    if (scanMat.current) scanMat.current.opacity = visible * 0.65;
    if (scan.current) scan.current.position.y = 0.43 - ((motion.current.time * 0.14 + index * 0.13) % 1) * 0.86;
    if (group.current) group.current.visible = visible > 0.005;
  });
  return <group ref={group} position={SOURCES[index]} rotation={[0.03, (index % 3 - 1) * 0.12, (index % 2 ? 1 : -1) * 0.055]}>
    <mesh><planeGeometry args={[0.95, 1.2]} /><meshBasicMaterial ref={paper} map={map} transparent depthWrite={false} toneMapped={false} /></mesh>
    <mesh ref={scan} position={[0, 0, 0.012]}><planeGeometry args={[0.62, 0.012]} /><meshBasicMaterial ref={scanMat} color="#e66a79" transparent depthWrite={false} /></mesh>
  </group>;
}

function buildNetwork() {
  const vertices: number[] = [], stages: number[] = [], paths: number[] = [], seeds: number[] = [], nodes: number[] = [];
  let edgeNumber = 0;
  const route = (points: Vec[], stage: number) => {
    const lengths = points.slice(1).map((p, i) => new THREE.Vector3(...p).distanceTo(new THREE.Vector3(...points[i])));
    const length = lengths.reduce((a, b) => a + b, 0); let travelled = 0;
    const seed = (edgeNumber++ * 0.61803399) % 1;
    points.slice(1).forEach((end, i) => {
      const start = points[i], count = Math.max(3, Math.ceil(lengths[i] * 8));
      for (let part = 0; part < count; part++) for (const f of [part / count, (part + 1) / count]) {
        vertices.push(...start.map((v, j) => v + (end[j] - v) * f));
        stages.push(stage); paths.push((travelled + lengths[i] * f) / length); seeds.push(seed);
      }
      travelled += lengths[i];
    });
  };
  SOURCES.forEach((source, i) => {
    const hub = HUBS[Math.floor(i / 2)];
    route([source, [source[0], hub[1], source[2]], [hub[0], hub[1], source[2]], hub], 0);
  });
  HUBS.forEach((hub, cluster) => {
    nodes.push(...hub);
    const local: Vec[] = Array.from({ length: 13 }, (_, i) => {
      const angle = i * 2.399 + cluster, r = 0.24 + (i % 4) * 0.13;
      const point: Vec = [hub[0] + Math.cos(angle) * r, hub[1] + Math.sin(angle) * r, hub[2] + (i % 3 - 1) * 0.17];
      nodes.push(...point); return point;
    });
    local.forEach((node, i) => {
      route([node, [hub[0], node[1], node[2]], hub], 1);
      if (i > 0) route([local[i - 1], node], 1);
    });
    route([hub, [hub[0], PROCESSOR[1], hub[2]], [PROCESSOR[0], PROCESSOR[1], hub[2]], PROCESSOR], 2);
  });
  route([HUBS[0], [-0.6, 1.1, -0.2], HUBS[1]], 1);
  route([HUBS[3], [-0.5, -1.3, -0.6], HUBS[2]], 1);
  route([REQUEST, [PROCESSOR[0], 0.9, 0.7], PROCESSOR], 2);
  route([PROCESSOR, [PROCESSOR[0], -0.9, 0.6], [REPORT[0], -0.9, 0.6], REPORT], 3);
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  lines.setAttribute("aStage", new THREE.Float32BufferAttribute(stages, 1));
  lines.setAttribute("aPath", new THREE.Float32BufferAttribute(paths, 1));
  lines.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  const dots = new THREE.BufferGeometry(); dots.setAttribute("position", new THREE.Float32BufferAttribute(nodes, 3));
  return { lines, dots };
}

const vertex = `attribute float aStage; attribute float aPath; attribute float aSeed;
  varying float vStage; varying float vPath; varying float vSeed;
  void main(){vStage=aStage;vPath=aPath;vSeed=aSeed;gl_PointSize=4.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment = `uniform float uTier;uniform float uTime;uniform vec3 uInk;uniform vec3 uAccent;uniform vec3 uPulse;
  varying float vStage;varying float vPath;varying float vSeed;
  void main(){float on=smoothstep(vStage-0.8,vStage+0.04,uTier);float focus=max(0.0,1.0-abs(vStage-uTier));
  float visibility=vStage<0.5?1.0-smoothstep(0.9,2.05,uTier):1.0;
  float assembled=smoothstep(vPath-0.04,vPath+0.04,on);float head=fract(uTime*(0.18+vSeed*0.09)+vSeed);
  float pulse=exp(-abs(vPath-head)*90.0)*on*assembled;vec3 base=mix(uInk,uAccent,0.2+focus*0.55);
  vec3 colour=mix(base,mix(uAccent,uPulse,0.8),pulse);
  float alpha=(0.06+assembled*on*(0.4+focus*0.22)+pulse*0.8)*visibility;if(alpha<0.006)discard;
  gl_FragColor=vec4(colour,alpha);
  #include <colorspace_fragment>
  }`;

// Give travelling packets their own visible dot instead of relying on a one-pixel line highlight.
const packetFragment = `uniform float uTier;uniform float uTime;uniform vec3 uPulse;
  varying float vStage;varying float vPath;varying float vSeed;
  void main(){float on=smoothstep(vStage-0.8,vStage+0.04,uTier);
  float visibility=vStage<0.5?1.0-smoothstep(0.9,2.05,uTier):1.0;
  float assembled=smoothstep(vPath-0.04,vPath+0.04,on);
  float head=fract(uTime*(0.18+vSeed*0.09)+vSeed);
  float pulse=exp(-abs(vPath-head)*90.0)*on*assembled*visibility;
  float shape=1.0-smoothstep(0.25,0.5,length(gl_PointCoord-0.5));
  float alpha=pulse*shape;if(alpha<0.12)discard;
  gl_FragColor=vec4(uPulse,alpha);
  #include <colorspace_fragment>
  }`;

function KnowledgeNetwork({ motion, colors }: Props) {
  const geometry = useMemo(buildNetwork, []);
  const uniforms = useMemo(() => ({ uTier: { value: 0 }, uTime: { value: 0 }, uInk: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() }, uPulse: { value: new THREE.Color() } }), []);
  const material = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false }), [uniforms]);
  const packetMaterial = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: packetFragment, transparent: true, depthWrite: false }), [uniforms]);
  useEffect(() => () => {
    material.dispose(); packetMaterial.dispose(); geometry.lines.dispose(); geometry.dots.dispose();
  }, [material, packetMaterial, geometry]);
  const points = useRef<THREE.PointsMaterial>(null);
  useFrame(() => {
    uniforms.uTier.value = motion.current.tier; uniforms.uTime.value = motion.current.time;
    uniforms.uInk.value.set(colors.ink); uniforms.uAccent.value.set(colors.accent);
    uniforms.uPulse.value.set(colors.pulse);
    if (points.current) points.current.opacity = 0.15 + gate(motion.current.tier, 0.25, 1) * 0.7;
  });
  return <><lineSegments geometry={geometry.lines} material={material} />
    <points geometry={geometry.lines} material={packetMaterial} />
    <points geometry={geometry.dots}><pointsMaterial ref={points} color={colors.node} size={0.043} transparent depthWrite={false} toneMapped={false} /></points></>;
}

function chipTexture() {
  return texture(512, 512, c => {
    c.fillStyle = "#10141b"; c.fillRect(0, 0, 512, 512);
    c.strokeStyle = "#4f5d6d"; c.lineWidth = 2; c.strokeRect(20, 20, 472, 472);
    c.strokeStyle = "#b2273b"; c.strokeRect(72, 72, 368, 368);
    for (let i = 0; i < 12; i++) {
      c.fillStyle = i % 3 === 0 ? "#c1152b" : "#52606f";
      c.fillRect(34 + i * 37, 34, 17, 8); c.fillRect(34 + i * 37, 470, 17, 8);
      c.fillRect(34, 34 + i * 37, 8, 17); c.fillRect(470, 34 + i * 37, 8, 17);
    }
    c.textAlign = "center"; c.fillStyle = "#f3f5f7"; c.font = "bold 88px Arial"; c.fillText("GEO", 256, 255);
    c.font = "21px monospace"; c.fillStyle = "#9aa7b7"; c.fillText("AGENT CORE", 256, 294);
    c.fillStyle = "#c1152b"; c.fillRect(226, 323, 60, 4);
    c.fillStyle = "#576575"; c.font = "16px monospace"; c.fillText("CONTEXT  /  TASK  /  RESPONSE", 256, 402);
  });
}

function Processor({ motion, colors }: Props) {
  const group = useRef<THREE.Group>(null), face = useRef<THREE.MeshBasicMaterial>(null), body = useRef<THREE.MeshStandardMaterial>(null), edges = useRef<THREE.LineBasicMaterial>(null);
  const map = useMemo(chipTexture, []); useEffect(() => () => map.dispose(), [map]);
  const detail = useMemo(() => {
    const positions: number[] = [];
    for (let side = 0; side < 4; side++) for (let pin = 0; pin < 10; pin++) {
      const offset = -0.67 + pin * 0.15, rotation = side * Math.PI / 2;
      for (const radius of [0.8, 1.0, 1.16]) positions.push(offset * Math.cos(rotation) - radius * Math.sin(rotation), offset * Math.sin(rotation) + radius * Math.cos(rotation), 0);
      positions.push(offset * Math.cos(rotation) - 1.16 * Math.sin(rotation), offset * Math.sin(rotation) + 1.16 * Math.cos(rotation), -0.15);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); return geo;
  }, []);
  useFrame(() => {
    const on = gate(motion.current.tier, 1.15, 2.05);
    if (group.current) { group.current.visible = on > 0.003; group.current.scale.setScalar(0.9 + on * 0.1); }
    if (face.current) face.current.opacity = on;
    if (body.current) { body.current.opacity = on; body.current.emissive.set(colors.accent); body.current.emissiveIntensity = (0.07 + Math.sin(motion.current.time * 1.6) * 0.025) * on; }
    if (edges.current) { edges.current.color.set(colors.accent); edges.current.opacity = on * 0.8; }
  });
  return <group ref={group} position={PROCESSOR} visible={false}>
    <mesh position={[0, 0, -0.15]}><boxGeometry args={[1.86, 1.86, 0.1]} /><meshStandardMaterial color="#252f3b" metalness={0.65} roughness={0.5} /></mesh>
    <mesh><boxGeometry args={[1.64, 1.64, 0.22]} /><meshStandardMaterial ref={body} transparent color="#111821" metalness={0.8} roughness={0.35} /></mesh>
    <mesh position={[0, 0, 0.117]}><planeGeometry args={[1.61, 1.61]} /><meshBasicMaterial ref={face} transparent map={map} toneMapped={false} /></mesh>
    <lineSegments geometry={detail}><lineBasicMaterial ref={edges} transparent depthWrite={false} /></lineSegments>
    {[0, 1, 2, 3].map(side => <group key={side} rotation={[0, 0, side * Math.PI / 2]}>
      {Array.from({ length: 10 }, (_, pin) => <mesh key={pin} position={[-0.67 + pin * 0.15, 0.88, -0.035]}><boxGeometry args={[0.064, 0.24, 0.064]} /><meshStandardMaterial color="#8996a7" metalness={0.8} roughness={0.35} /></mesh>)}
    </group>)}
  </group>;
}

// Geometric placeholders only: never restore real conversation data during a rollback.
function sessionTexture() {
  return texture(960, 620, c => {
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, 960, 620);
    c.fillStyle = "#f7f5e9"; c.fillRect(210, 64, 750, 556);
    c.strokeStyle = "#d8dde4"; c.lineWidth = 2; c.strokeRect(1, 1, 958, 618);
    c.beginPath(); c.moveTo(210, 0); c.lineTo(210, 620); c.moveTo(0, 64); c.lineTo(960, 64); c.stroke();
    c.fillStyle = "#c1152b"; c.fillRect(0, 540, 210, 80);
    c.font = "bold 25px Arial"; c.fillStyle = "#ffffff"; c.fillText("GeoAgent", 20, 588);
    c.fillStyle = "#18212d"; c.font = "bold 25px Arial"; c.fillText("Phiên làm việc", 236, 42);
    c.fillStyle = "#707d8d"; c.font = "18px Arial"; c.fillText("Tìm kiếm", 20, 40);
    c.fillStyle = "#f4f4f5"; c.fillRect(0, 148, 210, 64);
    c.fillStyle = "#253042"; c.font = "19px Arial"; c.fillText("Danh sách phiên", 20, 110); c.fillText("Tra cứu dữ liệu", 20, 186);
    c.fillStyle = "#ffffff"; c.fillRect(242, 94, 682, 430);
    c.fillStyle = "#8a5360"; c.font = "16px monospace"; c.fillText("GIAO DIỆN MINH HỌA", 266, 124);
    c.fillStyle = "#e4e9ee"; c.fillRect(266, 154, 295, 14);
    c.fillStyle = "#eef1f4";
    for (let line = 0; line < 3; line++) c.fillRect(266, 188 + line * 23, line === 2 ? 354 : 580, 8);
    c.fillStyle = "#f4f6f8"; c.fillRect(266, 272, 628, 42);
    c.strokeStyle = "#ccd5df"; c.lineWidth = 1;
    for (const y of [272, 314, 360, 406]) { c.beginPath(); c.moveTo(266, y); c.lineTo(894, y); c.stroke(); }
    for (const x of [266, 446, 894]) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, 406); c.stroke(); }
    c.fillStyle = "#dde3e9";
    for (let row = 0; row < 3; row++) { c.fillRect(286, 290 + row * 46, 110, 7); c.fillRect(466, 290 + row * 46, row === 0 ? 230 : 305, 7); }
    c.fillStyle = "#e7ebef"; c.fillRect(266, 440, 197, 10); c.fillRect(266, 466, 510, 7);
    c.fillStyle = "#ffffff"; c.fillRect(240, 548, 686, 46);
    c.strokeStyle = "#cbd3dd"; c.strokeRect(240, 548, 686, 46);
    c.font = "20px Arial"; c.fillStyle = "#748191"; c.fillText("Nhắn tin…", 260, 578);
  });
}

function SessionResult({ motion }: { motion: CoreMotion }) {
  const group = useRef<THREE.Group>(null), material = useRef<THREE.MeshBasicMaterial>(null);
  const map = useMemo(sessionTexture, []); useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    const on = gate(motion.current.tier, 2.25, 2.95);
    if (group.current) { group.current.visible = on > 0.002; group.current.position.y = REPORT[1] - (1 - on) * 0.25; }
    if (material.current) material.current.opacity = on;
  });
  return <group ref={group} position={REPORT} rotation={[0, -0.045, 0]} visible={false}><mesh><planeGeometry args={[1.9, 1.23]} /><meshBasicMaterial ref={material} transparent map={map} depthWrite={false} toneMapped={false} /></mesh></group>;
}

function RequestNode({ motion }: { motion: CoreMotion }) {
  const group = useRef<THREE.Group>(null), material = useRef<THREE.MeshBasicMaterial>(null);
  const map = useMemo(() => texture(768, 180, c => {
    c.fillStyle = "#18212c"; c.fillRect(0, 0, 768, 180);
    c.strokeStyle = "#6a7a8d"; c.lineWidth = 2; c.strokeRect(1, 1, 766, 178);
    c.fillStyle = "#c1152b"; c.fillRect(0, 0, 6, 180);
    c.fillStyle = "#8f9cac"; c.font = "22px monospace"; c.fillText("YÊU CẦU TRONG PHIÊN LÀM VIỆC", 24, 50);
    c.fillStyle = "#8291a2"; c.fillRect(24, 93, 518, 8); c.fillRect(24, 119, 366, 6);
  }), []);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(() => {
    const visible = gate(motion.current.tier, 0.9, 1.8) * (1 - gate(motion.current.tier, 2.45, 3));
    if (group.current) group.current.visible = visible > 0.003;
    if (material.current) material.current.opacity = visible;
  });
  return <group ref={group} position={REQUEST} visible={false}><mesh><planeGeometry args={[2.35, 0.55]} /><meshBasicMaterial ref={material} transparent map={map} depthWrite={false} toneMapped={false} /></mesh></group>;
}

export function GeoCoreModel(props: Props) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => { if (group.current) group.current.rotation.y = -0.13 + Math.sin(props.motion.current.time * 0.1) * 0.012; });
  return <group ref={group} rotation={[0.17, -0.13, -0.025]} scale={1.1}>
    {SOURCES.map((_, index) => <DocumentNode key={index} index={index} motion={props.motion} />)}
    <KnowledgeNetwork {...props} /><Processor {...props} /><RequestNode motion={props.motion} /><SessionResult motion={props.motion} />
  </group>;
}
