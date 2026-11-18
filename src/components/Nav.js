'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdMenu, MdClose } from 'react-icons/md';
import { useContent, waLink } from '@/lib/content';

const LINKS = [
  ['Polos', '#garments'],
  ['Materials', '#materials'],
  ['Finishes', '#finishes'],
  ['Quality', '#quality'],
  ['Studio', '#studio'],
  ['Work', '#work'],
  ['Contact', '#quote'],
];

export default function Nav() {
  const c = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > last && y > 600 && !open);
      last = y;
      const el = document.elementsFromPoint(window.innerWidth / 2, 30).find((n) => n.closest?.('[data-theme]'));
      const theme = el?.closest('[data-theme]')?.getAttribute('data-theme');
      setLight(theme === 'light');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${light || open ? 'is-light' : ''} ${hidden ? 'is-hidden' : ''}`}>
        <div className="nav-bg" />
        <div className="nav-inner">
          <a href="#top" className="brand" aria-label={`${c.brand.name} home`}>
            <span className="brand-mark">{c.brand.logoText}</span>
            {c.brand.name}
          </a>
          <ul className="nav-links">
            {LINKS.map(([l, h]) => (
              <li key={h}>
                <a href={h}>{l}</a>
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
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
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
