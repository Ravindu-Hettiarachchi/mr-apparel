'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

/* ------------------------------------------------------------------
   Realistic polo modelled in Blender (see /blender). Parts:
   Fabric, Collar, CuffL/CuffR (rib knit), TipCollar/TipCuffL/TipCuffR
   (tipping stripes), Buttons, Label. Ambient occlusion is baked into
   vertex colours so any fabric colour keeps soft shadows in the folds.
------------------------------------------------------------------ */
export const POLO_URL = '/models/polo.glb';

function makePiqueNormal() {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, size, size);
  const cell = 16;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const ox = (y / cell) % 2 ? cell / 2 : 0;
      const cx = x + ox + cell / 2;
      const cy = y + cell / 2;
      const g = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, cell * 0.55);
      g.addColorStop(0, 'rgb(150,150,255)');
      g.addColorStop(0.6, 'rgb(128,128,255)');
      g.addColorStop(1, 'rgb(100,100,240)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cell * 0.45, cell * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

function makeRibNormal() {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 8;
  const ctx = c.getContext('2d');
  for (let x = 0; x < 64; x++) {
    const v = 128 + Math.round(Math.sin((x / 64) * Math.PI * 16) * 60);
    ctx.fillStyle = `rgb(${v},128,255)`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 1);
  return tex;
}

function makeLogoTexture(text, color) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '800 108px Inter, Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 3), 128, 136);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function isLight(hex) {
  const c = new THREE.Color(hex);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 0.6;
}



// Exploded-view offsets per part (model units, model is 1.8 tall).
const EXPLODE = {
  Collar: [0, 0.22, 0.06],
  TipCollar: [0, 0.33, 0.1],
  Buttons: [0, 0.02, 0.5],
  CuffL: [0.34, -0.2, 0.04],
  TipCuffL: [0.5, -0.3, 0.06],
  CuffR: [-0.34, -0.2, 0.04],
  TipCuffR: [-0.5, -0.3, 0.06],
  Label: [0, 0.14, -0.35],
  Logo: [0, 0, 0.3],
};
const PARTS = ['Fabric', 'Collar', 'CuffL', 'CuffR', 'TipCollar', 'TipCuffL', 'TipCuffR', 'Buttons', 'Label'];

/**
 * props: color, colorRef (animated colour), tipColor (stripe colour; defaults to body),
 * explodeRef ({current: 0..1}), logoText, showLogo, spin
 */
export default function PoloModel({ color = '#1d2a44', colorRef, tipColor, tipRef, explodeRef, logoText = 'MR', showLogo = true, spin = 0, ...props }) {
  const group = useRef();
  const { nodes } = useGLTF(POLO_URL);
  const pique = useMemo(makePiqueNormal, []);
  const rib = useMemo(makeRibNormal, []);

  const mats = useMemo(() => {
    const base = {
      vertexColors: true,
      sheen: 1,
      sheenColor: new THREE.Color(0.3, 0.3, 0.32),
      side: THREE.DoubleSide,
    };
    if (pique) pique.repeat.set(70, 70);
    if (rib) rib.repeat.set(160, 4);
    return {
      fabric: new THREE.MeshPhysicalMaterial({ ...base, color: new THREE.Color(color), roughness: 0.9, sheenRoughness: 0.55, normalMap: pique, normalScale: new THREE.Vector2(0.45, 0.45) }),
      rib: new THREE.MeshPhysicalMaterial({ ...base, color: new THREE.Color(color), roughness: 0.85, sheenRoughness: 0.45, normalMap: rib, normalScale: new THREE.Vector2(0.7, 0.7) }),
      tip: new THREE.MeshPhysicalMaterial({ ...base, color: new THREE.Color(tipColor || color), roughness: 0.8, sheenRoughness: 0.4, normalMap: rib, normalScale: new THREE.Vector2(0.5, 0.5), polygonOffset: true, polygonOffsetFactor: -2 }),
      button: new THREE.MeshPhysicalMaterial({ color: '#f1efe9', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }),
      label: new THREE.MeshStandardMaterial({ color: '#efeee9', roughness: 0.7, side: THREE.DoubleSide }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pique, rib]);

  const parts = useMemo(() => {
    const all = Object.values(nodes).filter((n) => n.isMesh);
    const out = {};
    PARTS.forEach((p) => {
      out[p] = all.find((n) => n.name === p) || all.find((n) => n.name.startsWith(p));
    });
    return out;
  }, [nodes]);

  const matFor = (p) => (p === 'Fabric' ? mats.fabric : p.startsWith('Tip') ? mats.tip : p === 'Buttons' ? mats.button : p === 'Label' ? mats.label : mats.rib);

  // chest logo placed by raycasting onto the wearer's left chest
  const logo = useMemo(() => {
    const m = parts.Fabric;
    if (!m) return null;
    m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox;
    const h = bb.max.y - bb.min.y;
    const origin = new THREE.Vector3(0.2, bb.min.y + h * 0.72, bb.max.z + 1);
    const ray = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })))[0];
    if (!hit) return null;
    const n = hit.face.normal.clone();
    return { pos: hit.point.clone().add(n.clone().multiplyScalar(0.006)), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), size: 0.13 };
  }, [parts.Fabric]);

  const logoTex = useMemo(() => makeLogoTexture(logoText || 'MR', '#ffffff'), [logoText]);
  const refs = useRef({});
  const logoGroup = useRef();
  const logoMat = useRef();
  const target = useRef(new THREE.Color(color));
  const tipTarget = useRef(new THREE.Color(tipColor || color));
  const logoTarget = useRef(new THREE.Color());
  const ex = useRef(0);

  useEffect(() => {
    target.current.set(color);
    tipTarget.current.set(tipColor || color);
  }, [color, tipColor]);

  useFrame((_, dt) => {
    if (colorRef?.current) target.current.set(colorRef.current);
    if (tipRef?.current) tipTarget.current.set(tipRef.current);
    else if (!tipColor) tipTarget.current.copy(target.current);
    const k = 1 - Math.exp(-dt * 6);
    mats.fabric.color.lerp(target.current, k);
    mats.rib.color.lerp(target.current, k);
    mats.tip.color.lerp(tipTarget.current, k);
    logoTarget.current.set(isLight('#' + target.current.getHexString()) ? '#1d2a44' : '#f4f4f2');
    if (logoMat.current) logoMat.current.color.lerp(logoTarget.current, k);

    // exploded view
    const want = explodeRef ? explodeRef.current : 0;
    ex.current += (want - ex.current) * (1 - Math.exp(-dt * 5));
    const e = ex.current;
    Object.entries(refs.current).forEach(([name, obj]) => {
      const o = EXPLODE[name];
      if (obj && o) obj.position.set(o[0] * e, o[1] * e, o[2] * e);
    });
    if (logoGroup.current) logoGroup.current.position.set(0, 0, EXPLODE.Logo[2] * e);
    if (spin && group.current) group.current.rotation.y += dt * spin;
  });

  return (
    <group ref={group} {...props}>
      {PARTS.map((p) =>
        parts[p] ? (
          <mesh
            key={p}
            ref={(r) => (refs.current[p] = r)}
            geometry={parts[p].geometry}
            material={matFor(p)}
            castShadow={p === 'Fabric' || p === 'Collar'}
            receiveShadow={p === 'Fabric'}
          />
        ) : null
      )}
      {showLogo && logo && logoTex && (
        <group ref={logoGroup}>
          <mesh position={logo.pos} quaternion={logo.quat}>
            <planeGeometry args={[logo.size, logo.size]} />
            <meshStandardMaterial ref={logoMat} map={logoTex} transparent roughness={0.6} polygonOffset polygonOffsetFactor={-4} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

useGLTF.preload(POLO_URL);
