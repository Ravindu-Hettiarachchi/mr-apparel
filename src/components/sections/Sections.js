'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { useRange } from '@/components/Motion';
import {
  MdArrowForward,
  MdCheck,
  MdAdd,
  MdBusinessCenter,
  MdCelebration,
  MdEmojiEvents,
  MdSchool,
  MdLocalCafe,
  MdVolunteerActivism,
  MdStar,
} from 'react-icons/md';
import { useContent, waLink, sec } from '@/lib/content';
import { Reveal, Stagger, Item, SplitWords, ScrubText, CountUp } from '@/components/Motion';
import FadeImg from '@/components/FadeImg';
import { WORK_FILTER_EVENT, categoriesOf, catsOf, matchWork, norm, resolveFilter } from '@/lib/workFilter';

const ICONS = {
  briefcase: MdBusinessCenter,
  spark: MdCelebration,
  trophy: MdEmojiEvents,
  cap: MdSchool,
  cup: MdLocalCafe,
  heart: MdVolunteerActivism,
};
const EASE = [0.16, 1, 0.3, 1];

/* ---------------- Marquee ---------------- */
export function Marquee() {
  const c = useContent();
  const words = c.ticker?.length ? c.ticker : ['Custom polos', 'Custom tees'];
  return (
    <div className="marquee" data-theme="light" aria-hidden>
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <span key={k}>
            {words.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Audiences ---------------- */
export function Audiences() {
  const c = useContent();
  return (
    <section className="section" data-theme="light" id="who">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">{sec(c, 'audiences').eyebrow}</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text={sec(c, 'audiences').title} />
          <Reveal delay={0.1}>
            <p className="lead">{sec(c, 'audiences').lead}</p>
          </Reveal>
        </div>
        <Stagger className="grid-3">
          {c.audiences.map((a, i) => {
            const Icon = ICONS[a.icon] || MdStar;
            return (
              <Item key={i} className="aud-card">
                <div className="aud-icon">
                  <Icon size={26} />
                </div>
                <div>
                  <h3 className="h3">{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </Item>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Materials ---------------- */
const WEAVES = ['pique', 'smooth', 'mesh', 'blend'];
const MAT_COLORS = ['#1d2a44', '#3a3a3f', '#0f6b4f', '#7a4b2a'];

export function Materials() {
  const c = useContent();
  const [i, setI] = useState(0);
  const m = c.materials[i] || c.materials[0];
  if (!m) return null;
  return (
    <section className="section" id="materials" data-theme="light">
      <div className="container">
        <div className="section-head center">
          <Reveal>
            <p className="eyebrow">{sec(c, 'materials').eyebrow}</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text={sec(c, 'materials').title} />
          <Reveal delay={0.1}>
            <p className="lead">{sec(c, 'materials').lead}</p>
          </Reveal>
        </div>
        <Reveal className="center">
          <div className="segmented" role="tablist">
            {c.materials.map((mat, k) => (
              <button key={k} role="tab" aria-selected={k === i} onClick={() => setI(k)}>
                {k === i && <motion.span layoutId="seg" className="seg-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                {mat.name}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="mat-panel">
            <motion.div className="swatch-big" animate={{ backgroundColor: MAT_COLORS[i % 4] }} transition={{ duration: 0.8, ease: EASE }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={i}
                  className={`weave ${WEAVES[i % 4] === 'pique' ? '' : WEAVES[i % 4]}`}
                  initial={{ opacity: 0, scale: 1.25, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 1, ease: EASE }}
                />
              </AnimatePresence>
              <div className="lens">
                <small style={{ opacity: 0.8 }}>Weight</small>
                <div>
                  <strong>{m.gsm}</strong>
                </div>
              </div>
            </motion.div>
            <div className="mat-info">
              <AnimatePresence mode="wait">
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: EASE }}>
                  <h3 className="h2">{m.name}</h3>
                  <ul className="spec-list">
                    <li>
                      <span>Feel</span>
                      <span>{m.feel}</span>
                    </li>
                    <li>
                      <span>Best for</span>
                      <span>{m.best}</span>
                    </li>
                    <li>
                      <span>Care</span>
                      <span>{m.care}</span>
                    </li>
                  </ul>
                  <div className="meter">
                    {Object.entries(m.scores || {}).map(([k, v]) => (
                      <div key={k}>
                        <div className="meter-row">
                          <span>{k}</span>
                          <span className="muted">{v}%</span>
                        </div>
                        <div className="meter-track">
                          <motion.div className="meter-fill" initial={{ scaleX: 0 }} animate={{ scaleX: v / 100 }} transition={{ duration: 1.1, ease: EASE, delay: 0.1 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Quality (dark) ---------------- */
export function Quality() {
  const c = useContent();
  return (
    <section className="section dark" id="quality" data-theme="dark">
      <div className="container">
        <Reveal>
          <p className="eyebrow">{sec(c, 'quality').eyebrow}</p>
        </Reveal>
        <ScrubText
          className="scrub-text"
          text={sec(c, 'quality').title}
        />
        <div className="stats">
          {c.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="stat">
              <CountUp value={s.value} suffix={s.suffix} />
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
        <Stagger className="q-grid">
          {c.quality.map((q, i) => (
            <Item key={i} className="q-item">
              <div className="check">
                <MdCheck size={20} />
              </div>
              <h3 className="h3">{q.title}</h3>
              <p>{q.text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Process ---------------- */
export function Process() {
  const c = useContent();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'center 0.45'] });
  const scaleX = useRange(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section className="section" data-theme="light" id="process">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">{sec(c, 'process').eyebrow}</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text={sec(c, 'process').title} />
        </div>
        <div className="process" ref={ref}>
          <div className="process-line">
            <motion.div style={{ scaleX }} />
          </div>
          {c.process.map((s, i) => (
            <Reveal key={i} delay={i * 0.12} className="step">
              <div className="step-num">{i + 1}</div>
              <h3 className="h3">{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Works gallery ---------------- */
export function Works() {
  const c = useContent();
  const works = c.works || [];
  const cats = useMemo(() => categoriesOf(works), [works]);
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);
  const catsRef = useRef(cats);
  catsRef.current = cats;

  // category tiles and footer links ask for a filter through this event
  useEffect(() => {
    const on = (e) => setFilter(resolveFilter(e.detail, catsRef.current));
    window.addEventListener(WORK_FILTER_EVENT, on);
    return () => window.removeEventListener(WORK_FILTER_EVENT, on);
  }, []);

  const list = works.filter((w) => matchWork(w, filter, cats));
  const extra = filter !== 'All' && !cats.some((x) => norm(x) === norm(filter)) ? filter : null; // a keyword from a tile
  const chips = ['All', ...cats, ...(extra ? [extra] : [])];
  const isActive = (k) => (k === 'All' ? filter === 'All' : norm(k) === norm(filter));
  return (
    <section className="section" id="work" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head split">
          <div>
            <Reveal>
              <p className="eyebrow">{sec(c, 'works').eyebrow}</p>
            </Reveal>
            <SplitWords as="h2" className="h1" text={sec(c, 'works').title} />
          </div>
          <Reveal className="chips">
            {chips.map((k) => (
              <button key={k} className="chip" aria-pressed={isActive(k)} onClick={() => setFilter(k)}>
                {isActive(k) && <MdCheck size={16} />}
                {k}
              </button>
            ))}
          </Reveal>
        </div>
        <motion.div layout className="works-grid">
          <AnimatePresence>
            {list.map((w) => (
              <motion.button
                layout
                key={w.title + w.image}
                className="work"
                onClick={() => setOpen(w)}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                {w.image && <FadeImg src={w.image} alt={w.title} loading="lazy" />}
                <div className="work-meta">
                  <small>{[catsOf(w).join(' · '), w.year].filter(Boolean).join(' · ')}</small>
                  <h3 className="h3">{w.title}</h3>
                  {(w.client || w.quantity) && <p className="work-sub">{[w.client, w.quantity && `${w.quantity} pcs`].filter(Boolean).join(' — ')}</p>}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && filter !== 'All' && (
          <div className="works-empty">
            <p>No “{filter}” jobs added yet.</p>
            <a className="link" href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! Could you show me examples of ${filter}?`)} target="_blank" rel="noreferrer">
              Ask us for examples <MdArrowForward />
            </a>
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="lightbox" onClick={() => setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} transition={{ duration: 0.5, ease: EASE }}>
              <img src={open.image} alt={open.title} />
              <div className="cap">
                <h3 className="h3">{open.title}</h3>
                {(open.client || open.quantity || open.year) && (
                  <p style={{ opacity: 0.85, margin: '6px 0 0', fontWeight: 500 }}>{[open.client, open.quantity && `${open.quantity} pieces`, open.year].filter(Boolean).join(' · ')}</p>
                )}
                <p style={{ opacity: 0.7, margin: '6px 0 0' }}>{open.text}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials() {
  const c = useContent();
  if (!c.testimonials?.length) return null;
  return (
    <section className="section" data-theme="light">
      <div className="container">
        <div className="section-head center">
          <Reveal>
            <p className="eyebrow">{sec(c, 'testimonials').eyebrow}</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text={sec(c, 'testimonials').title} />
        </div>
        <Stagger className="grid-3">
          {c.testimonials.map((t, i) => (
            <Item key={i}>
              <div className="t-card">
                <div>
                  <div className="stars" aria-label="5 stars">
                    {[...Array(5)].map((_, k) => (
                      <MdStar key={k} size={18} />
                    ))}
                  </div>
                  <blockquote style={{ marginTop: 16 }}>“{t.quote}”</blockquote>
                </div>
                <div className="t-person">
                  <div className="t-avatar">{t.name?.[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  const c = useContent();
  const [open, setOpen] = useState(0);
  return (
    <section className="section" data-theme="light" id="faq" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head center">
          <SplitWords as="h2" className="h1" text={sec(c, 'faq').title} />
        </div>
        <div className="faq">
          {c.faq.map((f, i) => (
            <Reveal key={i} delay={i * 0.05} y={20} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}
                <span className="plus">
                  <MdAdd size={20} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div className="faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                    <p>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

