'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

/* ------------------------------------------------------------------
   Realistic polo modelled in Blender (see /blender). The GLB carries
   three meshes — Fabric, Rib (collar + cuffs) and Buttons — with
   ambient occlusion baked into vertex colours, so any fabric colour
   still gets soft shadows in the folds.
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

export default function PoloModel({ color = '#1d2a44', colorRef, tipColor, logoText = 'MR', spin = 0, ...props }) {
  const group = useRef();
  const { nodes } = useGLTF(POLO_URL);
  const pique = useMemo(makePiqueNormal, []);
  const rib = useMemo(makeRibNormal, []);

  const mats = useMemo(() => {
    const fabric = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      vertexColors: true,
      roughness: 0.9,
      sheen: 1,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0.32, 0.32, 0.34),
      normalMap: pique,
      normalScale: new THREE.Vector2(0.45, 0.45),
      side: THREE.DoubleSide,
    });
    if (pique) pique.repeat.set(70, 70);
    const ribMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tipColor || color),
      vertexColors: true,
      roughness: 0.85,
      sheen: 1,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color(0.3, 0.3, 0.32),
      normalMap: rib,
      normalScale: new THREE.Vector2(0.7, 0.7),
      side: THREE.DoubleSide,
    });
    if (rib) rib.repeat.set(160, 4);
    const button = new THREE.MeshPhysicalMaterial({ color: '#f1efe9', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
    return { fabric, rib: ribMat, button };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pique, rib]);

  const meshes = useMemo(() => {
    const pick = (name) => Object.values(nodes).find((n) => n.isMesh && n.name.toLowerCase().startsWith(name));
    return { fabric: pick('fabric'), rib: pick('rib'), buttons: pick('button') };
  }, [nodes]);

  // place the chest logo by raycasting onto the wearer's left chest
  const logo = useMemo(() => {
    const m = meshes.fabric;
    if (!m) return null;
    m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox;
    const h = bb.max.y - bb.min.y;
    const w = bb.max.x - bb.min.x;
    const origin = new THREE.Vector3(bb.min.x + w * 0.66, bb.min.y + h * 0.74, bb.max.z + 1);
    const ray = new THREE.Raycaster(origin, new THREE.Vector3(0, 0, -1));
    const tmp = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const hit = ray.intersectObject(tmp)[0];
    if (!hit) return null;
    const n = hit.face.normal.clone();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return { pos: hit.point.clone().add(n.multiplyScalar(0.006)), quat: q, size: w * 0.12 };
  }, [meshes.fabric]);

  const logoTex = useMemo(() => makeLogoTexture(logoText || 'MR', '#ffffff'), [logoText]);
  const logoMat = useRef();
  const target = useRef(new THREE.Color(color));
  const tipTarget = useRef(new THREE.Color(tipColor || color));
  const logoTarget = useRef(new THREE.Color());

  useEffect(() => {
    target.current.set(color);
    tipTarget.current.set(tipColor || color);
  }, [color, tipColor]);

  useFrame((_, dt) => {
    if (colorRef?.current) {
      target.current.set(colorRef.current);
      if (!tipColor) tipTarget.current.set(colorRef.current);
    }
    const k = 1 - Math.exp(-dt * 6);
    mats.fabric.color.lerp(target.current, k);
    mats.rib.color.lerp(tipTarget.current, k);
    logoTarget.current.set(isLight('#' + target.current.getHexString()) ? '#1d2a44' : '#f4f4f2');
    if (logoMat.current) logoMat.current.color.lerp(logoTarget.current, k);
    if (spin && group.current) group.current.rotation.y += dt * spin;
  });

  return (
    <group ref={group} {...props}>
      {meshes.fabric && <mesh geometry={meshes.fabric.geometry} material={mats.fabric} castShadow receiveShadow />}
      {meshes.rib && <mesh geometry={meshes.rib.geometry} material={mats.rib} castShadow />}
      {meshes.buttons && <mesh geometry={meshes.buttons.geometry} material={mats.button} />}
      {logo && logoTex && (
        <mesh position={logo.pos} quaternion={logo.quat}>
          <planeGeometry args={[logo.size, logo.size]} />
          <meshStandardMaterial ref={logoMat} map={logoTex} transparent roughness={0.6} polygonOffset polygonOffsetFactor={-4} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload(POLO_URL);
