'use client';

import { motion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import { useContent, sec } from '@/lib/content';
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

/* ---------- section: 2x2 grid that animates in as you scroll (no pinning) ---------- */
function FinishCard({ t, i }) {
  return (
    <motion.article
      className="fcard"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: { opacity: 0, y: 60 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: (i % 2) * 0.12, ease: EASE } },
      }}
    >
      <motion.div
        className="fcard-visual"
        variants={{
          hidden: { clipPath: 'polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)' },
          show: { clipPath: 'polygon(0% 0%, 120% 0%, 100% 100%, -20% 100%)', transition: { duration: 1.1, delay: 0.15 + (i % 2) * 0.12, ease: [0.76, 0, 0.24, 1] } },
        }}
      >
        <Visual t={t} />
        <span className="fin-badge">0{i + 1}</span>
      </motion.div>
      <div className="fcard-body">
        <h3 className="h2">{t.name}</h3>
        <p>{t.text}</p>
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
                <motion.div
                  className="fin-fill"
                  variants={{ hidden: { scaleX: 0 }, show: { scaleX: v / 100, transition: { delay: 0.5 + j * 0.08, duration: 1, ease: EASE } } }}
                />
              </div>
            </div>
          ))}
        </div>
        <a href="#quote" className="link">
          Get a quote for {t.name.toLowerCase()} <MdArrowForward />
        </a>
      </div>
    </motion.article>
  );
}

export default function Finishes() {
  const c = useContent();
  const list = c.techniques || [];
  return (
    <section className="section" id="finishes" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head split">
          <div>
            <Reveal>
              <p className="eyebrow">{sec(c, 'finishes').eyebrow}</p>
            </Reveal>
            <SplitWords as="h2" className="h1" text={sec(c, 'finishes').title} />
          </div>
          <Reveal>
            <p className="lead" style={{ maxWidth: 420, marginTop: 0 }}>{sec(c, 'finishes').lead}</p>
          </Reveal>
        </div>
        <div className="fgrid">
          {list.map((t, i) => (
            <FinishCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
