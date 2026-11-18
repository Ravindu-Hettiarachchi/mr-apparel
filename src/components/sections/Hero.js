'use client';

import { useRef } from 'react';
import { motion, useScroll, useReducedMotion } from 'framer-motion';
import { MdArrowForward, MdNorthEast } from 'react-icons/md';
import { useContent, waLink } from '@/lib/content';
import { useIntroReady } from '@/components/Intro';
import { useRange } from '@/components/Motion';
import { FaWhatsapp } from 'react-icons/fa';

/*
  Modern hero: headline on the left, and on the right a tilted "living
  lookbook" — three columns of real photos and product shots gliding
  endlessly at different speeds, with extra parallax as you scroll.
*/
const EASE = [0.16, 1, 0.3, 1];
// Splits the editable tile list into three columns (round-robin), repeating
// tiles if there are too few so the endless loop always looks full.
function toColumns(tiles) {
  const list = tiles?.length ? tiles : [];
  const cols = [[], [], []];
  list.forEach((t, i) => cols[i % 3].push(t));
  return cols.map((col, k) => {
    if (!col.length && list.length) col = [list[k % list.length]];
    let out = col;
    while (out.length && out.length < 4) out = out.concat(col);
    return out;
  });
}

const up = (delay, y = 28) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { delay, duration: 1, ease: EASE } },
});
const line = (delay) => ({
  hidden: { y: '108%', rotate: 3 },
  show: { y: '0%', rotate: 0, transition: { delay, duration: 1.1, ease: EASE } },
});

function Tile({ t }) {
  return (
    <figure className={`lb-tile ${t.fit === 'contain' ? 'is-product' : 'is-photo'}`} style={t.bgColor ? { background: t.bgColor } : undefined}>
      <img src={t.image} alt={t.alt || ''} draggable={false} loading="eager" />
    </figure>
  );
}

function Column({ items, dir, dur, y, delay }) {
  const list = [...items, ...items];
  return (
    <motion.div
      className="lb-col"
      style={{ y }}
      variants={{
        hidden: { opacity: 0, y: dir === 'up' ? 140 : -140 },
        show: { opacity: 1, y: 0, transition: { duration: 1.4, delay, ease: EASE } },
      }}
    >
      <div className={`lb-track ${dir}`} style={{ animationDuration: `${dur}s` }}>
        {list.map((t, k) => (
          <Tile key={k} t={t} />
        ))}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const c = useContent();
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const h = c.hero;
  const cols = toColumns(h.lookbook);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y1 = useRange(scrollYProgress, [0, 1], [0, -160]);
  const y2 = useRange(scrollYProgress, [0, 1], [0, 120]);
  const y3 = useRange(scrollYProgress, [0, 1], [0, -240]);
  const copyY = useRange(scrollYProgress, [0, 1], [0, 80]);

  return (
    <motion.section
      ref={ref}
      className={`mhero ${reduce ? 'still' : ''}`}
      id="top"
      data-theme="light"
      initial="hidden"
      animate={ready ? 'show' : 'hidden'}
    >
      <div className="mh-lookbook" aria-hidden>
        <div className="mh-tilt">
          <Column items={cols[0]} dir="up" dur={46} y={y1} delay={0.1} />
          <Column items={cols[1]} dir="down" dur={54} y={y2} delay={0.22} />
          <Column items={cols[2]} dir="up" dur={50} y={y3} delay={0.34} />
        </div>
      </div>
      <div className="mh-fade" aria-hidden />

      <div className="container mh-inner">
        <motion.div className="mh-copy" style={{ y: copyY }}>
          <motion.p className="fh-kicker ink" variants={up(0.05, 14)}>
            {h.eyebrow}
          </motion.p>
          <h1 className="mh-title" aria-label={`${h.title} ${h.accent}`}>
            {String(h.title).split(' ').map((w, k) => (
              <span key={`t${k}`} className="fh-line mh-word">
                <motion.span variants={line(0.1 + k * 0.07)}>{w}&nbsp;</motion.span>
              </span>
            ))}
            {String(h.accent).split(' ').map((w, k, arr) => (
              <span key={`a${k}`} className="fh-line mh-word">
                <motion.span className="mh-accent" variants={line(0.1 + (String(h.title).split(' ').length + k) * 0.07)}>
                  {w}
                  {k < arr.length - 1 ? '\u00A0' : ''}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="mh-sub" variants={up(0.45)}>
            {h.subtitle}
          </motion.p>
          <motion.div className="mh-actions" variants={up(0.56)}>
            <a href="#quote" className="btn btn-lg btn-dark">
              {h.primaryButton} <MdArrowForward />
            </a>
            <a href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)} target="_blank" rel="noreferrer" className="btn btn-lg btn-outline">
              <FaWhatsapp color="#25d366" /> {h.whatsappButton}
            </a>
          </motion.div>
          <motion.a href="#garments" className="mh-range" variants={up(0.7, 12)}>
            <span className="mh-range-dots">
              {['#1d2a44', '#b3261e', '#0f6b4f', '#2a56c6', '#f2b632', '#f1f0ec'].map((h) => (
                <i key={h} style={{ background: h }} />
              ))}
            </span>
            {h.rangeLink} <MdNorthEast />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}

export function Categories() {
  const c = useContent();
  const CATS = c.categories || [];
  if (!CATS.length) return null;
  return (
    <section className="section" data-theme="light" style={{ paddingTop: 'clamp(48px, 7vw, 88px)', paddingBottom: 'clamp(48px, 7vw, 88px)' }}>
      <div className="container">
        <motion.div
          className="cats"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {CATS.map((cat) => (
            <motion.a
              key={cat.label + cat.image}
              href={cat.link || '#garments'}
              className={`cat ${cat.fit === 'contain' ? 'product' : 'photo'}`}
              variants={{
                hidden: { opacity: 0, y: 50, clipPath: 'inset(18% 0 0 0 round 16px)' },
                show: { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 16px)', transition: { duration: 1, ease: EASE } },
              }}
            >
              <img src={cat.image} alt={cat.label} loading="lazy" />
              <span className="cat-label">
                <span>
                  <strong>{cat.label}</strong>
                  <small>{cat.sub}</small>
                </span>
                <span className="cat-arrow">
                  <MdNorthEast />
                </span>
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
