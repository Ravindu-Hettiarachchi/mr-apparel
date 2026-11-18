'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { MdArrowForward } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useContent, waLink, sec } from '@/lib/content';
import { Reveal, SplitWords } from '@/components/Motion';
import { SocialLinks } from '@/components/sections/Quote';

export function CtaBand() {
  const c = useContent();
  return (
    <section className="section" data-theme="light" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal scale={0.94} y={40}>
          <div className="cta-band" data-theme="dark">
            <SplitWords as="h2" className="h1" text={sec(c, 'cta').title} />
            <p className="lead" style={{ color: 'var(--on-dark-muted)', margin: '20px auto 0' }}>{sec(c, 'cta').lead}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
              <a className="btn btn-lg btn-light" href="#quote">
                Request a quote <MdArrowForward />
              </a>
              <a className="btn btn-lg btn-wa" href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}!`)} target="_blank" rel="noreferrer">
                <FaWhatsapp size={20} /> WhatsApp us
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Fab() {
  const c = useContent();
  return (
    <motion.a
      className="fab"
      href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.6, type: 'spring', stiffness: 300, damping: 22 }}
    >
      <FaWhatsapp size={26} />
      <span>Chat with us</span>
    </motion.a>
  );
}

export default function Footer() {
  const c = useContent();
  const year = new Date().getFullYear();
  return (
    <footer className="footer" data-theme="light">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#top" className="brand" style={{ color: 'var(--ink)' }}>
              <span className="brand-mark">{c.brand.logoText}</span>
              {c.brand.name}
            </a>
            <p style={{ maxWidth: 340, margin: '16px 0 20px' }}>{c.brand.description}</p>
            <SocialLinks socials={c.socials} />
          </div>
          <div>
            <h5>Products</h5>
            <ul>
              {c.garments.slice(0, 5).map((g) => (
                <li key={g.name}>
                  <a href="#garments">{g.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Finishes</h5>
            <ul>
              {c.techniques.map((t) => (
                <li key={t.name}>
                  <a href="#finishes">{t.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>
                <a href={waLink(c.contact.whatsapp)} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`tel:+${c.contact.whatsapp}`}>{c.contact.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
              </li>
              <li>{c.contact.address}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {year} {c.brand.name}. {c.brand.tagline}
          </span>
          <span>
            Crafted by{' '}
            <a href="https://www.pixbeelabs.com" target="_blank" rel="noreferrer" style={{ color: 'var(--ink)' }}>
              PixBee Labs
            </a>{' '}
            · <a href="/admin">Admin</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
