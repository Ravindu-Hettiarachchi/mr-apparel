'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { useContent, waLink } from '@/lib/content';
import { useRange, CountUp } from '@/components/Motion';

/*
  Logo-stripe hero. Three diagonal panels — the same slanted strokes as
  the MR logo — act as windows onto real photos. On scroll the outer
  panels slide away and the middle one opens up to fill the screen.
*/
const EASE = [0.16, 1, 0.3, 1];

// Parallelogram leaning like the logo strokes ("\" — top left, bottom right)
function stripe(cx, w, lean) {
  return [
    [cx - w / 2 - lean, 0],
    [cx + w / 2 - lean, 0],
    [cx + w / 2 + lean, 100],
    [cx - w / 2 + lean, 100],
  ];
}
const FULL = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];
const toClip = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`;
const mix = (a, b, t) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);

function Panel({ img, alt, from, to, progress, range, pointer, depth, delay, zoom }) {
  const clip = useTransform(progress, (v) => {
    const t = Math.min(1, Math.max(0, (v - range[0]) / (range[1] - range[0])));
    const e = t * t * (3 - 2 * t);
    return toClip(mix(from, to, e));
  });
  const px = useTransform(pointer, (v) => v * depth);
  const scale = useRange(progress, [0, 1], [zoom, 1]);
  return (
    <motion.div
      className="xh-panel"
      style={{ clipPath: clip, WebkitClipPath: clip, x: px }}
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      transition={{ duration: 1.3, delay, ease: EASE }}
    >
      <motion.img src={img} alt={alt} style={{ scale }} draggable={false} />
      <div className="xh-panel-shade" />
    </motion.div>
  );
}

export default function Hero() {
  const c = useContent();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const pointer = useMotionValue(0);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const copyOpacity = useRange(progress, [0, 0.25, 0.42], [1, 1, 0]);
  const copyY = useRange(progress, [0, 0.42], [0, -90]);
  const outroOpacity = useRange(progress, [0.55, 0.72], [0, 1]);
  const outroY = useRange(progress, [0.55, 0.72], [60, 0]);
  const hint = useRange(progress, [0, 0.06], [1, 0]);
  const glow = useRange(progress, [0, 0.6], [1, 0.2]);

  const photos = [
    { img: '/images/corporate-banner.jpg', alt: 'Branded polos on display' },
    { img: '/images/hero-banner.jpg', alt: 'Team wearing custom branded t-shirts' },
    { img: '/images/works-showcase.jpg', alt: 'Custom printed t-shirts' },
  ];
  // desktop: stripes on the right; the middle one opens to full screen
  const P = narrow ? [stripe(22, 22, 12), stripe(50, 22, 12), stripe(78, 22, 12)] : [stripe(56, 13, 9), stripe(72, 13, 9), stripe(88, 13, 9)];
  const OUT = [stripe(20, 13, 9).map(([x, y]) => [x - 40, y]), FULL, stripe(120, 13, 9).map(([x, y]) => [x + 30, y])];
  const [l1, ...rest] = c.hero.title.split('\n');
  const stats = (c.stats || []).slice(0, 3);

  return (
    <section
      className="xhero"
      ref={ref}
      id="top"
      data-theme="dark"
      onPointerMove={(e) => !reduce && pointer.set((e.clientX / window.innerWidth - 0.5) * 2)}
    >
      <div className="xh-stage">
        <motion.div className="xh-glow" style={{ opacity: glow }} />
        <div className="xh-panels" aria-hidden>
          {photos.map((p, i) => (
            <Panel
              key={i}
              {...p}
              from={P[i]}
              to={OUT[i]}
              progress={progress}
              range={i === 1 ? [0.18, 0.62] : [0.12, 0.45]}
              pointer={pointer}
              depth={(i - 1) * -10}
              delay={0.25 + i * 0.12}
              zoom={1.18}
            />
          ))}
        </div>
        <div className="xh-veil" />

        <motion.div className="xh-copy" style={{ opacity: copyOpacity, y: copyY }}>
          <motion.div className="hero-pill" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: EASE }}>
            <span className="dot" />
            {c.hero.eyebrow}
          </motion.div>
          <h1 className="display xh-title" aria-label={c.hero.title.replace('\n', ' ')}>
            {[l1, rest.join(' ')].filter(Boolean).map((line, i) => (
              <span key={i} className="xh-line">
                <motion.span
                  className={i === 1 ? 'xh-accent' : ''}
                  initial={{ y: '110%', rotate: 4 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.14, duration: 1.1, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="xh-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.9, ease: EASE }}>
            {c.hero.subtitle}
          </motion.p>
          <motion.div className="xh-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.9, ease: EASE }}>
            <a href="#quote" className="btn btn-lg">
              Get a quote <MdArrowForward />
            </a>
            <a href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)} target="_blank" rel="noreferrer" className="btn btn-lg btn-glass">
              <FaWhatsapp /> WhatsApp us
            </a>
          </motion.div>
          <motion.div className="xh-chips" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 1 } } }}>
            {(c.techniques || []).map((t) => (
              <motion.span key={t.name} className="xh-chip" variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                {t.name}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="xh-outro" style={{ opacity: outroOpacity, y: outroY }}>
          <p className="kicker">Made for teams</p>
          <h2 className="h1">From 10 pieces to 10,000.</h2>
          <div className="xh-stats">
            {stats.map((s) => (
              <div key={s.label} className="xh-stat">
                <CountUp value={s.value} suffix={s.suffix} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="scroll-hint" style={{ opacity: hint }}>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
