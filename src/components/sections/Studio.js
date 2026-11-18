'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'framer-motion';
import { MdOutline3dRotation } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { useContent, waLink } from '@/lib/content';
import { Reveal, SplitWords } from '@/components/Motion';

const StudioScene = dynamic(() => import('@/components/three/StudioScene'), { ssr: false });

export default function Studio() {
  const c = useContent();
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '100px 0px' });
  const [color, setColor] = useState(c.colorways[0]);
  const [tip, setTip] = useState(null);
  const [fabric, setFabric] = useState(c.materials[0]?.name || '');
  const [finish, setFinish] = useState(c.techniques[0]?.name || '');
  const [qty, setQty] = useState(50);
  const [logo, setLogo] = useState(c.brand.logoText);

  const message = [
    `Hi ${c.brand.name}! I designed a polo on your website:`,
    `• Colour: ${color.name}`,
    `• Collar tipping: ${tip ? tip.name : 'Same as body'}`,
    `• Fabric: ${fabric}`,
    `• Finish: ${finish}`,
    `• Quantity: ${qty}`,
    `Please send me a quote.`,
  ].join('\n');

  return (
    <section className="section" id="studio" data-theme="light">
      <div className="container">
        <div className="section-head center">
          <Reveal>
            <p className="eyebrow">Polo studio</p>
          </Reveal>
          <SplitWords as="h2" className="h1" text="Design yours in seconds." />
          <Reveal delay={0.1}>
            <p className="lead">Pick a colour, add contrast tipping and choose a fabric. Send the spec straight to us on WhatsApp.</p>
          </Reveal>
        </div>
        <Reveal y={60}>
          <div className="studio">
            <div className="studio-stage" ref={ref}>
              <StudioScene color={color.hex} tipColor={tip?.hex} logoText={logo || c.brand.logoText} active={inView} />
              <span className="studio-hint">
                <MdOutline3dRotation style={{ verticalAlign: '-3px', marginRight: 6 }} />
                Drag to rotate
              </span>
            </div>
            <div className="studio-panel">
              <div>
                <h4>
                  Body colour <span>{color.name}</span>
                </h4>
                <div className="swatches">
                  {c.colorways.map((cw) => (
                    <button key={cw.hex} className="swatch" style={{ background: cw.hex }} aria-label={cw.name} aria-pressed={color.hex === cw.hex} onClick={() => setColor(cw)} />
                  ))}
                </div>
              </div>
              <div>
                <h4>
                  Collar & cuff tipping <span>{tip ? tip.name : 'Same as body'}</span>
                </h4>
                <div className="swatches">
                  <button className="chip" aria-pressed={!tip} onClick={() => setTip(null)}>
                    None
                  </button>
                  {c.colorways.map((cw) => (
                    <button key={cw.hex} className="swatch" style={{ background: cw.hex, width: 30, height: 30 }} aria-label={cw.name} aria-pressed={tip?.hex === cw.hex} onClick={() => setTip(cw)} />
                  ))}
                </div>
              </div>
              <div>
                <h4>Fabric</h4>
                <div className="chips">
                  {c.materials.map((m) => (
                    <button key={m.name} className="chip" aria-pressed={fabric === m.name} onClick={() => setFabric(m.name)}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4>Logo finish</h4>
                <div className="chips">
                  {c.techniques.map((t) => (
                    <button key={t.name} className="chip" aria-pressed={finish === t.name} onClick={() => setFinish(t.name)}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <h4>Quantity</h4>
                  <div className="stepper">
                    <button aria-label="Fewer" onClick={() => setQty((q) => Math.max(10, q - 10))}>
                      −
                    </button>
                    <input aria-label="Quantity" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value.replace(/\D/g, '') || '0', 10)))} />
                    <button aria-label="More" onClick={() => setQty((q) => q + 10)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="field" style={{ flex: 1, minWidth: 140 }}>
                  <label htmlFor="logoText">Chest initials</label>
                  <input id="logoText" maxLength={3} value={logo} onChange={(e) => setLogo(e.target.value.toUpperCase())} />
                </div>
              </div>
              <a className="btn btn-wa btn-lg" href={waLink(c.contact.whatsapp, message)} target="_blank" rel="noreferrer" style={{ marginTop: 'auto' }}>
                <FaWhatsapp size={20} /> Send this design
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
