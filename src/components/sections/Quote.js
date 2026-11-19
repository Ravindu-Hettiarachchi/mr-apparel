'use client';

import { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn } from 'react-icons/fa';
import { MdEmail, MdPhone, MdPlace, MdSchedule, MdSend } from 'react-icons/md';
import { useContent, waLink, sec } from '@/lib/content';
import { Reveal, SplitWords, useRipple } from '@/components/Motion';

export function SocialLinks({ socials }) {
  const items = [
    ['instagram', FaInstagram, 'Instagram'],
    ['facebook', FaFacebookF, 'Facebook'],
    ['tiktok', FaTiktok, 'TikTok'],
    ['linkedin', FaLinkedinIn, 'LinkedIn'],
  ].filter(([k]) => socials?.[k]);
  return (
    <div className="socials">
      {items.map(([k, Icon, label]) => (
        <a key={k} href={socials[k]} target="_blank" rel="noreferrer" aria-label={label}>
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}

export default function Quote() {
  const c = useContent();
  const ripple = useRipple();
  const [f, setF] = useState({
    name: '',
    company: '',
    phone: '',
    garment: (c.quoteOptions?.garments || [])[0] || '',
    finish: c.techniques[0]?.name || '',
    qty: '50',
    date: '',
    notes: '',
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const body = [
    `Quote request — ${c.brand.name}`,
    `Name: ${f.name}`,
    f.company && `Company / event: ${f.company}`,
    f.phone && `Phone: ${f.phone}`,
    `Garment: ${f.garment}`,
    `Finish: ${f.finish}`,
    `Quantity: ${f.qty}`,
    f.date && `Needed by: ${f.date}`,
    f.notes && `Notes: ${f.notes}`,
  ]
    .filter(Boolean)
    .join('\n');

  const sendWa = (e) => {
    e.preventDefault();
    if (!e.currentTarget.form?.reportValidity?.() && e.currentTarget.form) return;
    window.open(waLink(c.contact.whatsapp, body), '_blank', 'noopener');
  };
  const sendMail = (e) => {
    e.preventDefault();
    if (e.currentTarget.form && !e.currentTarget.form.reportValidity()) return;
    window.location.href = `mailto:${c.contact.email}?subject=${encodeURIComponent(`Quote request — ${f.company || f.name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="section" id="quote" data-theme="light" style={{ background: 'var(--surface-1)' }}>
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">{sec(c, 'quote').eyebrow}</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text={sec(c, 'quote').title} />
          <Reveal delay={0.1}>
            <p className="lead">{sec(c, 'quote').lead}</p>
          </Reveal>
        </div>
        <div className="quote-wrap">
          <Reveal x={-40} y={0} className="contact-card">
            <h3 className="h2">Let&apos;s talk.</h3>
            <p>Prefer chatting? Message us on WhatsApp and share your logo directly.</p>
            <a className="btn btn-wa btn-lg" style={{ alignSelf: 'flex-start', position: 'relative', zIndex: 1 }} href={waLink(c.contact.whatsapp, `Hi ${c.brand.name}! I'd like a quote.`)} target="_blank" rel="noreferrer">
              <FaWhatsapp size={20} /> Chat on WhatsApp
            </a>
            <div className="contact-rows">
              <a className="contact-row" href={`tel:+${c.contact.whatsapp}`}>
                <span className="ic">
                  <MdPhone size={20} />
                </span>
                <span>
                  <small>Call</small>
                  {c.contact.phoneDisplay}
                </span>
              </a>
              <a className="contact-row" href={`mailto:${c.contact.email}`}>
                <span className="ic">
                  <MdEmail size={20} />
                </span>
                <span>
                  <small>Email</small>
                  {c.contact.email}
                </span>
              </a>
              <div className="contact-row">
                <span className="ic">
                  <MdPlace size={20} />
                </span>
                <span>
                  <small>Studio</small>
                  {c.contact.address}
                </span>
              </div>
              <div className="contact-row">
                <span className="ic">
                  <MdSchedule size={20} />
                </span>
                <span>
                  <small>Hours</small>
                  {c.contact.hours}
                </span>
              </div>
            </div>
            <SocialLinks socials={c.socials} />
          </Reveal>

          <Reveal x={40} y={0} delay={0.1}>
            <form className="form" onSubmit={sendWa}>
              <div className="field">
                <label htmlFor="q-name">Your name *</label>
                <input id="q-name" required value={f.name} onChange={set('name')} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="q-company">Company or event</label>
                <input id="q-company" value={f.company} onChange={set('company')} autoComplete="organization" />
              </div>
              <div className="field">
                <label htmlFor="q-phone">Phone</label>
                <input id="q-phone" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="q-qty">Quantity *</label>
                <input id="q-qty" required inputMode="numeric" value={f.qty} onChange={set('qty')} />
              </div>
              <div className="field">
                <label htmlFor="q-garment">Garment</label>
                <select id="q-garment" value={f.garment} onChange={set('garment')}>
                  {(c.quoteOptions?.garments || []).map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="q-finish">Finish</label>
                <select id="q-finish" value={f.finish} onChange={set('finish')}>
                  {(c.techniques || []).filter((t) => t.name?.trim()).map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="q-date">Needed by</label>
                <input id="q-date" type="date" value={f.date} onChange={set('date')} />
              </div>
              <div className="field full">
                <label htmlFor="q-notes">Colours, sizes, logo placement…</label>
                <textarea id="q-notes" value={f.notes} onChange={set('notes')} />
              </div>
              <div className="form-actions full">
                <button type="submit" className="btn btn-lg btn-wa" onMouseDown={ripple}>
                  <FaWhatsapp size={20} /> Send via WhatsApp
                </button>
                <button type="button" className="btn btn-lg btn-tonal" onClick={sendMail} onMouseDown={ripple}>
                  <MdSend size={18} /> Send by email
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
