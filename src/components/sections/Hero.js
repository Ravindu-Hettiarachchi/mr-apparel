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
const V = '/images/range/v/';
const P = (img, alt) => ({ img, alt, kind: 'is-photo' });
const R = (img, bg, alt) => ({ img: V + img, bg, alt, kind: 'is-product' });
const COLUMNS = [
  [P('/images/hero-banner.jpg', 'Corporate team in branded tees'), R('signature-navy.webp', '#dfe5f1', 'Navy piqué polo'), P('/images/store-product.jpg', 'Rack of custom tees'), R('tipped-red.webp', '#fbe2df', 'Red tipped polo')],
  [R('tee-sun.webp', '#fff0c9', 'Sunflower event tee'), P('/images/corporate-banner.jpg', 'Branded polos on display'), R('drifit-forest.webp', '#dbeee4', 'Forest dri-fit polo'), P('/images/sublimation-showcase.jpg', 'Sublimated sports kits')],
  [P('/images/works-showcase.jpg', 'Custom printed tees'), R('tipped-royal.webp', '#dfe7fb', 'Royal tipped polo'), P('/images/dtf-process.jpg', 'DTF transfers'), R('long-navy.webp', '#e4e6ee', 'Navy long sleeve polo')],
];

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
    <figure className={`lb-tile ${t.kind}`} style={t.bg ? { background: t.bg } : undefined}>
      <img src={t.img} alt={t.alt} draggable={false} loading="eager" />
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
          <Column items={COLUMNS[0]} dir="up" dur={46} y={y1} delay={0.1} />
          <Column items={COLUMNS[1]} dir="down" dur={54} y={y2} delay={0.22} />
          <Column items={COLUMNS[2]} dir="up" dur={50} y={y3} delay={0.34} />
        </div>
      </div>
      <div className="mh-fade" aria-hidden />

      <div className="container mh-inner">
        <motion.div className="mh-copy" style={{ y: copyY }}>
          <motion.p className="fh-kicker ink" variants={up(0.05, 14)}>
            Custom polos &amp; t-shirts · Sri Lanka
          </motion.p>
          <h1 className="mh-title">
            {['Custom polos', '& tees, made', 'for '].map((t, k) => (
              <span key={k} className="fh-line">
                <motion.span variants={line(0.1 + k * 0.1)}>
                  {t}
                  {k === 2 && <span className="mh-accent">your team.</span>}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="mh-sub" variants={up(0.45)}>
            For corporate teams and events. Your logo embroidered or printed on premium polos and tees, from 10 pieces to 10,000.
          </motion.p>
          <motion.div className="mh-actions" variants={up(0.56)}>
            <a href="#quote" className="btn btn-lg btn-dark">
              Start your order <MdArrowForward />
            </a>
            <a href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)} target="_blank" rel="noreferrer" className="btn btn-lg btn-outline">
              <FaWhatsapp color="#25d366" /> WhatsApp us
            </a>
          </motion.div>
          <motion.a href="#garments" className="mh-range" variants={up(0.7, 12)}>
            <span className="mh-range-dots">
              {['#1d2a44', '#b3261e', '#0f6b4f', '#2a56c6', '#f2b632', '#f1f0ec'].map((h) => (
                <i key={h} style={{ background: h }} />
              ))}
            </span>
            Explore the range in 20+ colours <MdNorthEast />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}

const CATS = [
  { label: 'Polos', sub: 'Piqué, dri-fit & tipped', img: '/images/range/signature-polo.webp', href: '#garments', product: true },
  { label: 'T-shirts', sub: 'Crew & event tees', img: '/images/range/crew-tee.webp', href: '#garments', product: true },
  { label: 'Corporate uniforms', sub: 'Teams of 10 to 1,000+', img: '/images/hero-banner.jpg', href: '#work' },
  { label: 'Event merch', sub: 'Launches, runs & festivals', img: '/images/sublimation-showcase.jpg', href: '#work' },
];

export function Categories() {
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
          {CATS.map((c) => (
            <motion.a
              key={c.label}
              href={c.href}
              className={`cat ${c.product ? 'product' : 'photo'}`}
              variants={{
                hidden: { opacity: 0, y: 50, clipPath: 'inset(18% 0 0 0 round 16px)' },
                show: { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 16px)', transition: { duration: 1, ease: EASE } },
              }}
            >
              <img src={c.img} alt={c.label} loading="lazy" />
              <span className="cat-label">
                <span>
                  <strong>{c.label}</strong>
                  <small>{c.sub}</small>
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
