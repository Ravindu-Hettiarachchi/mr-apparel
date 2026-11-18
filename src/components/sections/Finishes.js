'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import { useContent } from '@/lib/content';
import { Reveal, SplitWords } from '@/components/Motion';

const EASE = [0.16, 1, 0.3, 1];
const SCORE_LABELS = { detail: 'Fine detail', durability: 'Durability', bulkValue: 'Bulk value', softFeel: 'Soft feel' };

/* ---------- animated visuals ---------- */

// The MR logo stitched in gold thread on piqué, drawn stitch by stitch.
function EmbroideryVisual() {
  const bars = [
    'M40 70 L92 70 L176 230 L124 230 Z',
    'M118 70 L170 70 L254 230 L202 230 Z',
    'M196 70 L270 70 Q330 70 330 120 Q330 160 292 168 L330 230 L278 230 L232 150 L262 150 Q282 150 282 122 Q282 100 262 100 L214 100 Z',
  ];
  return (
    <div className="fv fv-emb">
      <svg viewBox="0 0 370 300" aria-hidden>
        <defs>
          <linearGradient id="thread" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd34d" />
            <stop offset="1" stopColor="#f26a21" />
          </linearGradient>
        </defs>
        {bars.map((d, i) => (
          <g key={i}>
            <motion.path
              d={d}
              fill="url(#thread)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.92] }}
              transition={{ duration: 2.6, times: [0, 0.6, 1], delay: i * 0.35, repeat: Infinity, repeatDelay: 2.4 }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke="url(#thread)"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeDasharray="7 5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1] }}
              transition={{ duration: 2.6, times: [0, 0.6, 1], delay: i * 0.35, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
            />
          </g>
        ))}
      </svg>
      <motion.span
        className="fv-needle"
        animate={{ x: [0, 180, 260, 60, 0], y: [0, 80, 20, 120, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// A squeegee sweeps across and lays down ink layer by layer.
function ScreenPrintVisual() {
  const layers = ['#f26a21', '#ffc20e', '#1d2a44'];
  return (
    <div className="fv fv-screen">
      <div className="fv-frame">
        {layers.map((c, i) => (
          <motion.div
            key={c}
            className={`fv-ink l${i}`}
            style={{ background: c }}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 100%)'] }}
            transition={{ duration: 6, times: [0, 0.3, 0.85, 1], delay: i * 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <span className="fv-halftone" />
        <motion.span
          className="fv-squeegee"
          animate={{ left: ['-8%', '100%', '100%', '-8%'] }}
          transition={{ duration: 6, times: [0, 0.3, 0.85, 1], repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

function PhotoVisual({ src, alt }) {
  return (
    <div className="fv fv-photo">
      <motion.img src={src} alt={alt} initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: 'easeOut' }} />
    </div>
  );
}

function Visual({ t }) {
  if (t.image) return <PhotoVisual src={t.image} alt={t.name} />;
  const n = t.name.toLowerCase();
  if (n.includes('embroider')) return <EmbroideryVisual />;
  if (n.includes('screen')) return <ScreenPrintVisual />;
  return <PhotoVisual src="/images/works-showcase.jpg" alt={t.name} />;
}

/* ---------- section ---------- */
export default function Finishes() {
  const c = useContent();
  const list = c.techniques || [];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    if (!inView || paused || list.length < 2) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % list.length), 6000);
    return () => clearTimeout(t);
  }, [active, inView, paused, list.length]);

  const cur = list[active];

  return (
    <section className="section" id="finishes" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head split">
          <div>
            <Reveal>
              <p className="eyebrow">Finishes</p>
            </Reveal>
            <SplitWords as="h2" className="h1" text="Every logo deserves the right finish." />
          </div>
          <Reveal>
            <p className="lead" style={{ maxWidth: 420, marginTop: 0 }}>
              Not sure which to choose? We&apos;ll recommend the best finish for your artwork, fabric and budget.
            </p>
          </Reveal>
        </div>

        <Reveal y={50}>
          <div className="fin" ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {list.map((t, i) => {
              const on = i === active;
              return (
                <motion.div
                  key={t.name}
                  layout
                  className={`fin-panel ${on ? 'on' : ''}`}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(i)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={on}
                  transition={{ layout: { duration: 0.7, ease: EASE } }}
                >
                  {/* collapsed tab */}
                  <div className="fin-tab">
                    <span className="fin-num">0{i + 1}</span>
                    <span className="fin-tab-name">{t.name}</span>
                  </div>

                  {/* expanded content */}
                  <AnimatePresence>
                    {on && (
                      <motion.div
                        className="fin-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                      >
                        <div className="fin-visual">
                          <Visual t={t} />
                          <span className="fin-badge">0{i + 1} / 0{list.length}</span>
                        </div>
                        <div className="fin-info">
                          <motion.h3 className="h2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, duration: 0.6, ease: EASE }}>
                            {t.name}
                          </motion.h3>
                          <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45, duration: 0.6, ease: EASE }}>
                            {t.text}
                          </motion.p>
                          <div className="fin-meta">
                            <span>Best for: {t.best}</span>
                            <span>Lasts: {t.durability}</span>
                          </div>
                          <div className="fin-scores">
                            {Object.entries(t.scores || {}).map(([k, v], j) => (
                              <div key={k} className="fin-score">
                                <div className="fin-score-row">
                                  <span>{SCORE_LABELS[k] || k}</span>
                                  <span>{v}</span>
                                </div>
                                <div className="fin-track">
                                  <motion.div className="fin-fill" initial={{ scaleX: 0 }} animate={{ scaleX: v / 100 }} transition={{ delay: 0.5 + j * 0.08, duration: 1, ease: EASE }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <a href="#quote" className="link" onClick={(e) => e.stopPropagation()}>
                            Get a quote for {t.name.toLowerCase()} <MdArrowForward />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* auto-advance progress */}
                  {on && inView && !paused && list.length > 1 && (
                    <motion.span key={`p${active}`} className="fin-progress" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: 'linear' }} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </Reveal>
        {cur && <span className="sr-only">Showing {cur.name}</span>}
      </div>
    </section>
  );
}
