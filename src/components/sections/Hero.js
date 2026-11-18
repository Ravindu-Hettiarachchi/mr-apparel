'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useReducedMotion } from 'framer-motion';
import { MdArrowForward, MdVerified, MdLocalShipping, MdPalette } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { useContent, waLink } from '@/lib/content';
import { useRange, CountUp } from '@/components/Motion';
import { useIntroReady } from '@/components/Intro';
import FadeImg from '@/components/FadeImg';

/*
  Clean, light hero: says exactly what MR Apparel does, backed by a
  bento grid of real visuals — each tile labelled with the service.
*/
const EASE = [0.16, 1, 0.3, 1];
const up = (delay, y = 24) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { delay, duration: 0.9, ease: EASE } },
});
const WORDS = ['corporates.', 'events.', 'sports teams.', 'schools.', 'brands.'];

function RotatingWord() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span className="ch-rotate">
      <AnimatePresence mode="wait">
        <motion.span
          key={WORDS[i]}
          className="ch-word"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Tile({ className, img, label, sub, delay, contain, y }) {
  return (
    <motion.figure
      className={`ch-tile ${className || ''}`}
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.94, clipPath: 'inset(12% 0 0 0 round 26px)' },
        show: { opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0 0 0 round 26px)', transition: { duration: 1.1, delay, ease: EASE } },
      }}
    >
      <motion.div className="ch-tile-in" style={y ? { y } : undefined}>
        <FadeImg src={img} alt={label} className={contain ? 'contain' : ''} draggable={false} />
      </motion.div>
      <figcaption>
        <strong>{label}</strong>
        {sub && <span>{sub}</span>}
      </figcaption>
    </motion.figure>
  );
}

export default function Hero() {
  const c = useContent();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yA = useRange(scrollYProgress, [0, 1], [0, -40]);
  const yB = useRange(scrollYProgress, [0, 1], [0, -70]);
  const stats = (c.stats || []).slice(0, 3);
  const ready = useIntroReady();

  return (
    <motion.section className="chero" ref={ref} id="top" data-theme="light" initial="hidden" animate={ready ? 'show' : 'hidden'}>
      <div className="ch-bg" aria-hidden>
        <span className="ch-stroke s1" />
        <span className="ch-stroke s2" />
        <span className="ch-stroke s3" />
      </div>
      <div className="container ch-grid">
        <div className="ch-copy">
          <motion.p className="ch-eyebrow" variants={up(0, 14)}>
            <span className="dot" /> Custom apparel studio · Sri Lanka
          </motion.p>
          <motion.h1 className="ch-title" variants={up(0.08, 30)}>
            Custom polos &amp; t&#8209;shirts for <RotatingWord />
          </motion.h1>
          <motion.p className="ch-sub" variants={up(0.18)}>
            We design, embroider and print premium uniforms and merch, from 10 pieces to 10,000, delivered island-wide.
          </motion.p>
          <motion.div className="ch-actions" variants={up(0.28)}>
            <a href="#quote" className="btn btn-lg">
              Get a free quote <MdArrowForward />
            </a>
            <a href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)} target="_blank" rel="noreferrer" className="btn btn-lg btn-outline">
              <FaWhatsapp color="#25d366" /> WhatsApp us
            </a>
          </motion.div>
          <motion.ul className="ch-points" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }}>
            {[
              [MdVerified, 'Sample before bulk'],
              [MdPalette, 'Pantone colour matching'],
              [MdLocalShipping, 'Island-wide delivery'],
            ].map(([Icon, t]) => (
              <motion.li key={t} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Icon /> {t}
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="ch-stats" variants={up(0.55, 12)}>
            {stats.map((s) => (
              <div key={s.label}>
                <CountUp value={s.value} suffix={s.suffix} />
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="ch-bento">
          <Tile className="t-big" img="/images/hero-banner.jpg" label="Corporate uniforms" sub="Embroidered team polos & tees" delay={0.15} y={yA} />
          <Tile className="t-polo" img="/images/range/signature-polo.webp" label="Piqué polos" sub="From LKR 2,200" delay={0.28} contain y={yB} />
          <Tile className="t-a" img="/images/works-showcase.jpg" label="DTF & screen print" delay={0.38} y={yA} />
          <Tile className="t-b" img="/images/corporate-banner.jpg" label="Brand merch" delay={0.48} y={yB} />
        </div>
      </div>
    </motion.section>
  );
}
