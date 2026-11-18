'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { MdMenu, MdClose } from 'react-icons/md';
import { useContent, waLink } from '@/lib/content';

const LINKS = [
  ['The range', '#garments'],
  ['Our work', '#work'],
  ['Materials', '#materials'],
  ['Finishes', '#finishes'],
  ['Quality', '#quality'],
  ['Contact', '#quote'],
];

export default function Nav() {
  const c = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const el = document.elementsFromPoint(window.innerWidth / 2, 34).find((n) => n.closest?.('[data-theme]'));
      setLight(el?.closest('[data-theme]')?.getAttribute('data-theme') === 'light');
      // highlight the section currently under the nav
      let cur = '';
      LINKS.forEach(([, h]) => {
        const s = document.querySelector(h);
        if (s && s.getBoundingClientRect().top < 140) cur = h;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${light || open ? 'is-light' : ''}`}>
        <div
          className="nav-inner"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
          }}
        >
          <a href="#top" className="brand" aria-label={`${c.brand.name} home`}>
            <img src="/images/mr-logo-wide.png" alt="" className="brand-logo" width="48" height="25" />
            <span className="brand-name">{c.brand.name.replace(/^MR\s*/i, '') || c.brand.name}</span>
          </a>
          <ul className="nav-links">
            {LINKS.map(([l, h]) => (
              <li key={h}>
                <a href={h} className={active === h ? 'on' : ''}>
                  {l}
                  {active === h && <motion.span layoutId="nav-dot" className="nav-dot" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-cta">
            <a className="btn btn-sm btn-hide-sm btn-wa" href={waLink(c.contact.whatsapp, 'Hi MR Apparel! I would like a quote.')} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="btn btn-sm" href="#quote">
              Get a quote
            </a>
          </div>
          <button className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
          <motion.div className="nav-progress" style={{ scaleX: progress }} />
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {LINKS.map(([l, h], i) => (
              <motion.a
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {l}
              </motion.a>
            ))}
            <a className="btn btn-wa btn-lg" style={{ marginTop: 24 }} href={waLink(c.contact.whatsapp)} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
