'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// Inertial smooth scrolling. Skipped for reduced-motion users and with ?nosmooth.
export default function SmoothScroll({ children }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (new URLSearchParams(location.search).has('nosmooth')) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -56 } });
    window.__mrLenis = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      delete window.__mrLenis;
    };
  }, []);
  return children;
}
