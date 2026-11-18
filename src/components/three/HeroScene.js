'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import PoloModel from './PoloModel';

// Scroll keyframes for the polo: position, scale and rotation.
const TAU = Math.PI * 2;
const KEYS = [
  { p: 0.0, x: 0, y: -1.55, s: 0.95, ry: -0.5, rx: 0.12 },
  { p: 0.16, x: 0, y: -0.3, s: 0.95, ry: 0.4, rx: 0.04 },
  { p: 0.3, x: 0.82, y: -0.05, s: 1.0, ry: TAU - 0.55, rx: 0.02 },
  { p: 0.44, x: 0.82, y: -0.05, s: 1.0, ry: TAU + 0.35, rx: 0.02 },
  { p: 0.56, x: -0.78, y: -0.85, s: 1.85, ry: TAU + 0.15, rx: 0.32 },
  { p: 0.7, x: -0.78, y: -0.85, s: 1.85, ry: TAU - 0.35, rx: 0.28 },
  { p: 0.82, x: 0.78, y: -0.35, s: 1.55, ry: 2 * TAU - 0.32, rx: 0.06 },
  { p: 1.0, x: 0.78, y: -0.35, s: 1.55, ry: 2 * TAU + 0.12, rx: 0.06 },
];

const smooth = (t) => t * t * (3 - 2 * t);
function sample(p) {
  if (p <= KEYS[0].p) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b.p) {
      const t = smooth((p - a.p) / (b.p - a.p));
      const o = {};
      for (const k of ['x', 'y', 's', 'ry', 'rx']) o[k] = a[k] + (b[k] - a[k]) * t;
      return o;
    }
  }
  return KEYS[KEYS.length - 1];
}

function Rig({ progress, colorRef, logoText }) {
  const g = useRef();
  const { viewport, size } = useThree();
  useFrame((state, dt) => {
    if (!g.current) return;
    const k = sample(progress.current);
    const aspect = size.width / size.height;
    const narrow = aspect < 1.25;
    const x = narrow ? 0 : k.x * Math.min(1.1, aspect / 1.7);
    const y = narrow ? k.y * 0.6 + 0.3 : k.y;
    const s = narrow ? k.s * Math.min(0.8, aspect * 0.75) : k.s * Math.min(1, 0.55 + aspect * 0.3);
    const px = state.pointer.x;
    const py = state.pointer.y;
    const damp = 1 - Math.exp(-dt * 5);
    const o = g.current;
    o.position.x += (x - o.position.x) * damp;
    o.position.y += (y + Math.sin(state.clock.elapsedTime * 0.8) * 0.015 - o.position.y) * damp;
    const sc = o.scale.x + (s - o.scale.x) * damp;
    o.scale.setScalar(sc);
    o.rotation.y += (k.ry + px * 0.25 - o.rotation.y) * damp;
    o.rotation.x += (k.rx - py * 0.08 - o.rotation.x) * damp;
  });
  return (
    <group ref={g} position={[0, -1.55, 0]} scale={0.95}>
      <Suspense fallback={null}>
        <PoloModel colorRef={colorRef} logoText={logoText} />
      </Suspense>
    </group>
  );
}

export default function HeroScene({ progress, colorRef, logoText, active = true }) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.8]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 4.6], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      shadows
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 3]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 1, -2]} intensity={2.5} color="#6b8cff" />
      <directionalLight position={[4, -1, -3]} intensity={1.6} color="#b05cff" />
      <spotLight position={[0, 5, 2]} angle={0.5} penumbra={1} intensity={20} />
      <Rig progress={progress} colorRef={colorRef} logoText={logoText} />
      <ContactShadows position={[0, -1.55, 0]} opacity={0.55} scale={6} blur={2.6} far={2.5} color="#000" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.2} color="#7aa0ff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer intensity={1} color="#c58cff" position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer intensity={0.6} position={[0, -3, 2]} scale={[6, 1, 1]} />
      </Environment>
    </Canvas>
  );
}
