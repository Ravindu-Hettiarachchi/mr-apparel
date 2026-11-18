'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/*
  First-load intro: the four shapes of the real MR logo slide in along
  the logo's slant and lock together, then the assembled logo shrinks and
  glides into its place in the nav while the page fades in underneath.
  Plays once per browser session (add ?intro to the URL to replay).
*/
const IntroContext = createContext(true);
export const useIntroReady = () => useContext(IntroContext);

const KEY = 'mr-apparel:intro-seen';
const ASSEMBLE_MS = 1500; // strokes in + a short hold
const MAX_WAIT_MS = 3500; // never block longer than this
const FLY_MS = 900;

// Each shape enters along the logo's diagonal ("\") from alternating sides.
const STROKES = [
  { from: { x: -70, y: -150, rotate: -6 }, delay: 0.05 },
  { from: { x: 60, y: 150, rotate: 6 }, delay: 0.17 },
  { from: { x: -60, y: -150, rotate: -6 }, delay: 0.29 },
  { from: { x: 120, y: 30, rotate: 4 }, delay: 0.43 },
];
const EASE_IN = [0.16, 1, 0.3, 1];

export function IntroProvider({ children }) {
  const [phase, setPhase] = useState('assemble'); // assemble -> fly -> done
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState(null);
  const logoRef = useRef(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === '1' && !new URLSearchParams(location.search).has('intro');
    } catch {}
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('done');
      setReady(true);
      return;
    }
    const root = document.documentElement;
    root.classList.add('intro-active');
    root.style.overflow = 'hidden';
    const start = performance.now();
    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad);
    let timer;
    const check = () => {
      const t = performance.now() - start;
      if ((loaded && t >= ASSEMBLE_MS) || t >= MAX_WAIT_MS) {
        // where the nav logo sits, relative to the centred intro logo
        const nav = document.querySelector('.nav .brand-logo')?.getBoundingClientRect();
        const me = logoRef.current?.getBoundingClientRect();
        if (nav && me && nav.width) {
          setTarget({
            x: nav.left + nav.width / 2 - (me.left + me.width / 2),
            y: nav.top + nav.height / 2 - (me.top + me.height / 2),
            scale: nav.width / me.width,
          });
        } else {
          setTarget({ x: 0, y: -40, scale: 0.6 });
        }
        setPhase('fly');
        setReady(true);
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {}
        timer = setTimeout(() => {
          setPhase('done');
          root.classList.remove('intro-active');
          root.style.overflow = '';
        }, FLY_MS + 60);
        return;
      }
      timer = setTimeout(check, 80);
    };
    timer = setTimeout(check, 80);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  const flying = phase === 'fly';

  return (
    <IntroContext.Provider value={ready}>
      {children}
      {phase !== 'done' && (
        <div className={`intro ${flying ? 'is-flying' : ''}`} aria-hidden>
          <motion.div
            className="intro-bg"
            initial={{ opacity: 1 }}
            animate={{ opacity: flying ? 0 : 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: flying ? 0.1 : 0 }}
          />
          <motion.div
            ref={logoRef}
            className="intro-mark"
            initial={false}
            animate={flying && target ? { x: target.x, y: target.y, scale: target.scale } : { x: 0, y: 0, scale: 1 }}
            transition={{ duration: FLY_MS / 1000, ease: [0.65, 0, 0.25, 1] }}
          >
            {STROKES.map((s, i) => (
              <motion.img
                key={i}
                src={`/images/logo-stroke-${i}.png`}
                alt=""
                draggable={false}
                initial={{ ...s.from, opacity: 0 }}
                animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: s.delay, ease: EASE_IN }}
              />
            ))}
            {/* a soft light sweep once the logo locks together */}
            <motion.span
              className="intro-sheen"
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '230%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.8, delay: 1.0, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      )}
    </IntroContext.Provider>
  );
}
