"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

const CRIMSON = new THREE.Color("#c1152b");

// A radial gradient sprite gives the core its bloom without a post-processing pass.
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(232,71,91,1)");
    g.addColorStop(0.25, "rgba(193,21,43,0.55)");
    g.addColorStop(1, "rgba(193,21,43,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function Core() {
  const rig = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const heart = useRef<THREE.Group>(null);
  const glow = useGlowTexture();

  useFrame((state, delta) => {
    if (!rig.current || !outer.current || !inner.current || !heart.current) return;
    // R3F normalises the pointer to -1..1; damping turns it into a weighted parallax tilt.
    const { pointer } = state;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, pointer.x * 0.5, 3, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, -pointer.y * 0.35, 3, delta);
    rig.current.position.x = THREE.MathUtils.damp(rig.current.position.x, pointer.x * 0.25, 2, delta);

    outer.current.rotation.y += delta * 0.12;
    outer.current.rotation.z += delta * 0.04;
    inner.current.rotation.y -= delta * 0.22;
    inner.current.rotation.x += delta * 0.09;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.07;
    heart.current.scale.setScalar(pulse);
  });

  return (
    <group ref={rig}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <group ref={outer}>
          <mesh>
            <icosahedronGeometry args={[1.7, 1]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.16} />
          </mesh>
          <points>
            <icosahedronGeometry args={[1.7, 1]} />
            <pointsMaterial color={CRIMSON} size={0.05} sizeAttenuation transparent opacity={0.9} />
          </points>
        </group>

        <mesh ref={inner}>
          <dodecahedronGeometry args={[1.05, 0]} />
          <meshBasicMaterial color={CRIMSON} wireframe transparent opacity={0.45} />
        </mesh>

        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.25, 0.004, 8, 160]} />
          <meshBasicMaterial color={CRIMSON} transparent opacity={0.5} />
        </mesh>

        <group ref={heart}>
          <mesh>
            <octahedronGeometry args={[0.32, 0]} />
            <meshBasicMaterial color="#e8475b" toneMapped={false} />
          </mesh>
          <sprite scale={2.4}>
            <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
          </sprite>
        </group>
      </Float>
    </group>
  );
}

type CoreSceneProps = {
  /** Element whose pointer movement drives the tilt (the whole hero, not just the canvas). */
  eventSource: RefObject<HTMLElement | null>;
  /** "demand" freezes the scene: used offscreen and for reduced motion. */
  frameloop: "always" | "demand";
};

export default function CoreScene({ eventSource, frameloop }: CoreSceneProps) {
  return (
    <Canvas
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      frameloop={frameloop}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Core />
    </Canvas>
  );
}
