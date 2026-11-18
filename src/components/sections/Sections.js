'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { useRange } from '@/components/Motion';
import {
  MdArrowForward,
  MdChevronLeft,
  MdChevronRight,
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
import { useContent } from '@/lib/content';
import { Reveal, Stagger, Item, SplitWords, ScrubText, CountUp } from '@/components/Motion';
import Silhouette, { kindFor } from '@/components/Silhouette';

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
  const words = [...c.audiences.map((a) => a.title), ...c.techniques.map((t) => t.name), 'Polo shirts', 'Bulk orders'];
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
            <p className="eyebrow">Who we make for</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="One partner for every team you dress." />
          <Reveal delay={0.1}>
            <p className="lead">From a 10-piece startup order to thousands of event tees, we handle the fabric, finish and delivery so you don&apos;t have to.</p>
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

/* ---------------- Garments rail ---------------- */
export function Garments() {
  const c = useContent();
  const rail = useRef(null);
  const scroll = (d) => rail.current?.scrollBy({ left: d * 360, behavior: 'smooth' });
  return (
    <section className="section" id="garments" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head split">
          <div>
            <Reveal>
              <p className="eyebrow">The range</p>
            </Reveal>
            <SplitWords as="h2" className="h1" text="Polos first. Everything else, too." />
          </div>
          <Reveal className="rail-nav">
            <button className="icon-btn" aria-label="Previous" onClick={() => scroll(-1)}>
              <MdChevronLeft size={26} />
            </button>
            <button className="icon-btn" aria-label="Next" onClick={() => scroll(1)}>
              <MdChevronRight size={26} />
            </button>
          </Reveal>
        </div>
        <div className="rail" ref={rail}>
          {c.garments.map((g, i) => (
            <motion.article
              key={i}
              className="g-card"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: EASE }}
            >
              <div className="g-visual" style={{ background: `radial-gradient(80% 70% at 50% 40%, #fff, ${g.color}22)` }}>
                {g.image ? <img src={g.image} alt={g.name} loading="lazy" /> : <Silhouette kind={kindFor(g.name)} color={g.color} />}
                {g.tag && <span className="g-tag">{g.tag}</span>}
              </div>
              <div className="g-body">
                <h3 className="h3">{g.name}</h3>
                <p>{g.fabric}</p>
                <div className="g-foot">
                  <span className="g-price">From {g.from}</span>
                  <a className="link" href="#quote">
                    Quote <MdArrowForward />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
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
            <p className="eyebrow">Materials</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="Feel the difference before you see it." />
          <Reveal delay={0.1}>
            <p className="lead">Choose the fabric that suits your team, climate and budget. Every option is pre-shrunk and colour-fast.</p>
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

/* ---------------- Techniques (sticky) ---------------- */
function TechVisual({ t, i }) {
  if (t.image) return <img src={t.image} alt={t.name} />;
  return (
    <div
      className="tech-fallback"
      style={{
        background:
          i % 2
            ? 'radial-gradient(70% 60% at 50% 50%, #3d1f7a, #0b0b10)'
            : 'radial-gradient(70% 60% at 50% 50%, #12306e, #0b0b10)',
      }}
    >
      <span className={`stitch ${i === 0 ? 'dashed' : ''}`}>{i === 0 ? 'MR' : t.name.split(' ')[0]}</span>
    </div>
  );
}

export function Techniques() {
  const c = useContent();
  const [active, setActive] = useState(0);
  return (
    <section className="section" id="finishes" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">Finishes</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="Every logo deserves the right finish." />
        </div>
        <div className="tech">
          <div className="tech-list">
            {c.techniques.map((t, i) => (
              <motion.div
                key={i}
                className="tech-item"
                style={{ opacity: active === i ? 1 : 0.28 }}
                onViewportEnter={() => setActive(i)}
                viewport={{ amount: 0.6 }}
              >
                <span className="num">0{i + 1}</span>
                <h3 className="h1">{t.name}</h3>
                <p>{t.text}</p>
                <div className="tech-meta">
                  <span>Best for: {t.best}</span>
                  <span>Lasts: {t.durability}</span>
                </div>
                {t.image ? <img className="mobile-img" src={t.image} alt={t.name} loading="lazy" /> : null}
              </motion.div>
            ))}
          </div>
          <div className="tech-visual">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={active}
                className="layer"
                initial={{ opacity: 0, scale: 1.12, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {c.techniques[active] && <TechVisual t={c.techniques[active]} i={active} />}
              </motion.div>
            </AnimatePresence>
            <span className="tech-caption">{c.techniques[active]?.name}</span>
          </div>
        </div>
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
          <p className="eyebrow">Quality, guaranteed</p>
        </Reveal>
        <ScrubText
          className="scrub-text"
          text="We sample before we produce, check every stitch, and fold every piece by hand. Because the shirt your team wears is the first thing people notice about your brand."
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
            <p className="eyebrow">How it works</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="From idea to delivery in four steps." />
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
  const cats = ['All', ...Array.from(new Set(c.works.map((w) => w.category).filter(Boolean)))];
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const list = c.works.filter((w) => cat === 'All' || w.category === cat);
  return (
    <section className="section" id="work" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head split">
          <div>
            <Reveal>
              <p className="eyebrow">Recent work</p>
            </Reveal>
            <SplitWords as="h2" className="h1" text="Real work, for real teams." />
          </div>
          <Reveal className="chips">
            {cats.map((k) => (
              <button key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>
                {cat === k && <MdCheck size={16} />}
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
                {w.image && <img src={w.image} alt={w.title} loading="lazy" />}
                <div className="work-meta">
                  <small>{[w.category, w.year].filter(Boolean).join(' · ')}</small>
                  <h3 className="h3">{w.title}</h3>
                  {(w.client || w.quantity) && <p className="work-sub">{[w.client, w.quantity && `${w.quantity} pcs`].filter(Boolean).join(' — ')}</p>}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
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
            <p className="eyebrow">Kind words</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="Trusted by teams across Sri Lanka." />
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
          <SplitWords as="h2" className="h1" text="Questions, answered." />
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

