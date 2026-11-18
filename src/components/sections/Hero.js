'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion';
import { useRange } from '@/components/Motion';
import { MdArrowForward } from 'react-icons/md';
import { useContent } from '@/lib/content';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

// chapter windows within the hero scroll (0–1)
const WINDOWS = [
  [0.22, 0.3, 0.42, 0.5],
  [0.5, 0.57, 0.68, 0.76],
  [0.76, 0.83, 0.99, 1],
];

function Chapter({ progress, win, side, ch }) {
  const opacity = useRange(progress, win, [0, 1, 1, 0]);
  const y = useRange(progress, win, [60, 0, 0, -60]);
  const blur = useRange(progress, win, ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(10px)']);
  return (
    <div className={`chapter ${side}`}>
      <motion.div style={{ opacity, y, filter: blur }}>
        <p className="kicker">{ch.kicker}</p>
        <h2 className="h1">{ch.title}</h2>
        <p>{ch.text}</p>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const c = useContent();
  const ref = useRef(null);
  const progress = useRef(0);
  const colorRef = useRef(c.hero.chapters[0]?.color || '#1d2a44');
  const [step, setStep] = useState(0);
  const inView = useInView(ref, { margin: '200px 0px' });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
    const chs = c.hero.chapters;
    let idx = -1;
    WINDOWS.forEach((w, i) => {
      if (v >= w[0] - 0.04) idx = i;
    });
    const col = chs[Math.max(0, Math.min(chs.length - 1, idx))]?.color;
    if (col) colorRef.current = col;
    setStep(idx + 1);
  });

  const introOpacity = useRange(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  const introY = useRange(scrollYProgress, [0, 0.2], [0, -80]);
  const introScale = useRange(scrollYProgress, [0, 0.2], [1, 0.94]);
  const hintOpacity = useRange(scrollYProgress, [0, 0.05], [1, 0]);

  const [l1, ...rest] = c.hero.title.split('\n');

  return (
    <section className="hero" ref={ref} id="top" data-theme="dark">
      <div className="hero-stage">
        <div className="hero-glow" />
        <HeroScene progress={progress} colorRef={colorRef} logoText={c.brand.logoText} active={inView} />

        <motion.div className="hero-copy" style={{ opacity: introOpacity, y: introY, scale: introScale }}>
          <motion.div
            className="hero-pill"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dot" />
            {c.hero.eyebrow}
          </motion.div>
          <h1 className="display" aria-label={c.hero.title.replace('\n', ' ')}>
            {[l1, rest.join(' ')].filter(Boolean).map((line, i) => (
              <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
                <motion.span
                  style={{ display: 'block' }}
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {c.hero.subtitle}
          </motion.p>
        </motion.div>

        <motion.div className="hero-actions" style={{ opacity: introOpacity }}>
          <motion.a
            href="#quote"
            className="btn btn-lg btn-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Get a quote <MdArrowForward />
          </motion.a>
          <motion.a
            href="#studio"
            className="btn btn-lg btn-glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Design your polo
          </motion.a>
        </motion.div>

        {c.hero.chapters.slice(0, 3).map((ch, i) => (
          <Chapter key={i} progress={scrollYProgress} win={WINDOWS[i]} side={i % 2 === 0 ? 'left' : 'right'} ch={ch} />
        ))}

        <div className="hero-progress" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={step === i ? 'on' : ''} />
          ))}
        </div>
        <motion.div className="scroll-hint" style={{ opacity: hintOpacity }}>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
