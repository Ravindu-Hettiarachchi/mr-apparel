'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import PoloModel from './PoloModel';

export default function StudioScene({ color, tipColor, logoText, active = true }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.1, 4.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      shadows
      style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 4]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={1.2} />
      <PresentationControls global={false} snap={false} speed={1.4} polar={[-0.25, 0.35]} azimuth={[-Infinity, Infinity]}>
        <group position={[0, -0.05, 0]}>
          <Suspense fallback={null}>
            <PoloModel color={color} tipColor={tipColor} logoText={logoText} spin={0.25} />
          </Suspense>
        </group>
      </PresentationControls>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={5} blur={2.4} far={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 4, 4]} scale={[8, 3, 1]} />
        <Lightformer intensity={1.4} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} />
        <Lightformer intensity={1.4} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
