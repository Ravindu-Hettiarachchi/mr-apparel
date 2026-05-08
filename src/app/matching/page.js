'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTshirt, FaArrowRight, FaWhatsapp, FaTag, FaClock, FaCheckCircle,
} from 'react-icons/fa';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import styles from './matching.module.css';

/* ============================
   PRICING DATA
   ============================ */
const GARMENTS = [
  { id: 'crew',      label: 'Crew Neck',   base: 1500 },
  { id: 'vneck',     label: 'V-Neck',      base: 1600 },
  { id: 'polo',      label: 'Polo Shirt',  base: 2200 },
  { id: 'longsleeve',label: 'Long Sleeve', base: 1900 },
  { id: 'hoodie',    label: 'Hoodie',      base: 3500 },
];

const METHODS = [
  {
    id: 'dtf',
    label: 'DTF Printing',
    mult: 1.0,
    note: 'Best for detailed, multi-color artwork on any garment.',
  },
  {
    id: 'sublimation',
    label: 'Sublimation',
    mult: 1.3,
    note: 'All-over prints, photographic quality, polyester garments.',
  },
  {
    id: 'embroidery',
    label: 'Embroidery',
    mult: 1.2,
    note: 'Premium tactile finish — ideal for corporate polo shirts.',
  },
];

const LOCATIONS = [
  { id: 'front',    label: 'Front Only',         addon: 0   },
  { id: 'back',     label: 'Back Only',           addon: 0   },
  { id: 'fb',       label: 'Front + Back',        addon: 400 },
  { id: 'fbs',      label: 'Front + Back + Sleeve', addon: 650 },
];

const TIERS = [
  { min: 10,  max: 24,   discount: 0  },
  { min: 25,  max: 49,   discount: 8  },
  { min: 50,  max: 99,   discount: 12 },
  { min: 100, max: 199,  discount: 18 },
  { min: 200, max: 499,  discount: 22 },
  { min: 500, max: Infinity, discount: 28 },
];

function getTier(qty) {
  return TIERS.find((t) => qty >= t.min && qty <= t.max) || TIERS[0];
}

function getTimeline(qty) {
  if (qty < 25)  return '3 – 5 business days';
  if (qty < 100) return '5 – 8 business days';
  if (qty < 300) return '8 – 12 business days';
  return '12 – 18 business days';
}

function fmtLKR(n) {
  return 'LKR ' + Math.round(n).toLocaleString('en-LK');
}

/* ============================
   MAIN PAGE
   ============================ */
export default function QuotePage() {
  const [garmentId,  setGarmentId]  = useState('crew');
  const [methodId,   setMethodId]   = useState('dtf');
  const [locationId, setLocationId] = useState('front');
  const [qty, setQty] = useState(50);

  const garment  = GARMENTS.find((g) => g.id === garmentId);
  const method   = METHODS.find((m) => m.id === methodId);
  const location = LOCATIONS.find((l) => l.id === locationId);
  const tier     = getTier(qty);

  const basePerUnit = (garment.base + location.addon) * method.mult;
  const discountAmt = basePerUnit * (tier.discount / 100);
  const finalPerUnit = basePerUnit - discountAmt;
  const total = finalPerUnit * qty;
  const totalSaved = discountAmt * qty;
  const timeline = getTimeline(qty);

  const nextTier = TIERS.find((t) => t.min > tier.min);

  const summary = {
    garment:   garment.label,
    method:    method.label,
    location:  location.label,
    qty,
    basePerUnit,
    discount:  tier.discount,
    finalPerUnit,
    total,
    totalSaved,
    timeline,
  };

  return (
    <div className={styles.page}>

      {/* ======= PAGE HEADER ======= */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div>
            <h1 className={styles.pageTitle}>
              <FaTag className={styles.pageTitleIcon} />
              Instant Price Calculator
            </h1>
            <p className={styles.pageSubtitle}>
              Configure your order and get a live price estimate — no calls needed
            </p>
          </div>
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBtn}
          >
            <FaWhatsapp /> WhatsApp for instant quote
          </a>
        </div>
      </div>

      {/* ======= CALCULATOR LAYOUT ======= */}
      <div className={styles.calcLayout}>

        {/* ---- LEFT: CONFIGURATION ---- */}
        <div className={styles.configPanel}>

          {/* Garment Type */}
          <div className={styles.configSection}>
            <h3 className={styles.configTitle}>
              <span className={styles.configStep}>1</span>
              Garment Type
            </h3>
            <div className={styles.garmentGrid}>
              {GARMENTS.map((g) => (
                <button
                  key={g.id}
                  className={`${styles.garmentBtn} ${garmentId === g.id ? styles.garmentActive : ''}`}
                  onClick={() => setGarmentId(g.id)}
                >
                  <FaTshirt className={styles.garmentIcon} />
                  <span className={styles.garmentLabel}>{g.label}</span>
                  <span className={styles.garmentBase}>from {fmtLKR(g.base)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Print Method */}
          <div className={styles.configSection}>
            <h3 className={styles.configTitle}>
              <span className={styles.configStep}>2</span>
              Print Method
            </h3>
            <div className={styles.methodGrid}>
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`${styles.methodBtn} ${methodId === m.id ? styles.methodActive : ''}`}
                  onClick={() => setMethodId(m.id)}
                >
                  <div className={styles.methodTop}>
                    <span className={styles.methodLabel}>{m.label}</span>
                    {m.mult > 1 && (
                      <span className={styles.methodMult}>+{Math.round((m.mult - 1) * 100)}%</span>
                    )}
                  </div>
                  <span className={styles.methodNote}>{m.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className={styles.configSection}>
            <h3 className={styles.configTitle}>
              <span className={styles.configStep}>3</span>
              Quantity
              <span className={styles.qtyDisplay}>{qty} pcs</span>
            </h3>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>10 pcs</span>
              <span>500 pcs</span>
            </div>

            {/* Discount tier progress */}
            <div className={styles.tierRow}>
              {TIERS.map((t, i) => {
                const active   = tier.min === t.min;
                const unlocked = qty >= t.min;
                return (
                  <div
                    key={i}
                    className={`${styles.tierChip} ${active ? styles.tierActive : ''} ${unlocked && !active ? styles.tierUnlocked : ''}`}
                  >
                    {t.min}+
                    <span className={styles.tierDiscount}>
                      {t.discount === 0 ? 'No disc.' : `-${t.discount}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            {nextTier && (
              <p className={styles.tierNudge}>
                Add {nextTier.min - qty} more pieces to unlock{' '}
                <strong style={{ color: 'var(--primary)' }}>{nextTier.discount}% off</strong>
              </p>
            )}
          </div>

          {/* Print Location */}
          <div className={styles.configSection}>
            <h3 className={styles.configTitle}>
              <span className={styles.configStep}>4</span>
              Print Location
            </h3>
            <div className={styles.locationGrid}>
              {LOCATIONS.map((l) => (
                <button
                  key={l.id}
                  className={`${styles.locationBtn} ${locationId === l.id ? styles.locationActive : ''}`}
                  onClick={() => setLocationId(l.id)}
                >
                  <span className={styles.locationLabel}>{l.label}</span>
                  {l.addon > 0 && (
                    <span className={styles.locationAddon}>+{fmtLKR(l.addon)}/pc</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---- RIGHT: LIVE PRICE SUMMARY ---- */}
        <div className={styles.summaryPanel}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <span className={styles.summaryHeaderLabel}>Your Estimate</span>
              <span className={styles.summaryLive}>Live</span>
            </div>

            {/* Order breakdown */}
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Garment</span>
                <span>{summary.garment}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Print Method</span>
                <span>{summary.method}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Location</span>
                <span>{summary.location}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Quantity</span>
                <span>{summary.qty} pieces</span>
              </div>
            </div>

            <div className={styles.summaryDivider} />

            {/* Pricing breakdown */}
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Base price / unit</span>
                <span>{fmtLKR(summary.basePerUnit)}</span>
              </div>
              {summary.discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                  <span>Volume discount ({tier.min}+ pcs)</span>
                  <span>- {summary.discount}%</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.summaryFinalUnit}`}>
                <span>Final price / unit</span>
                <motion.span
                  key={summary.finalPerUnit}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {fmtLKR(summary.finalPerUnit)}
                </motion.span>
              </div>
            </div>

            <div className={styles.summaryDivider} />

            {/* Total */}
            <div className={styles.totalBlock}>
              <span className={styles.totalLabel}>Total Estimate</span>
              <motion.span
                key={summary.total}
                className={styles.totalValue}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
              >
                {fmtLKR(summary.total)}
              </motion.span>
            </div>

            {summary.totalSaved > 0 && (
              <motion.div
                className={styles.savingsBadge}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FaCheckCircle />
                You save {fmtLKR(summary.totalSaved)} with bulk pricing
              </motion.div>
            )}

            {/* Timeline */}
            <div className={styles.timelineBlock}>
              <FaClock className={styles.timelineIcon} />
              <div>
                <span className={styles.timelineLabel}>Estimated Production Time</span>
                <span className={styles.timelineValue}>{summary.timeline}</span>
              </div>
            </div>

            <div className={styles.summaryDivider} />

            {/* Note */}
            <p className={styles.summaryNote}>
              This is an estimate based on standard configurations. Final pricing may vary
              based on design complexity, custom sizing, and material availability.
            </p>

            {/* CTAs */}
            <Link
              href={`/contact?garment=${summary.garment}&method=${summary.method}&qty=${summary.qty}`}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
            >
              Get Formal Quote <FaArrowRight />
            </Link>
            <a
              href={`https://wa.me/94771234567?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20${summary.qty}x%20${encodeURIComponent(summary.garment)}%20with%20${encodeURIComponent(summary.method)}%20(${encodeURIComponent(summary.location)}).%20My%20estimate%20shows%20${encodeURIComponent(fmtLKR(summary.total))}.`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waQuoteBtn}
            >
              <FaWhatsapp /> Send via WhatsApp
            </a>
          </div>

          {/* Discount Tiers Table */}
          <div className={styles.tiersTable}>
            <h4 className={styles.tiersTableTitle}>Volume Discount Tiers</h4>
            {TIERS.map((t, i) => {
              const active = tier.min === t.min;
              return (
                <div key={i} className={`${styles.tiersRow} ${active ? styles.tiersRowActive : ''}`}>
                  <span className={styles.tiersQty}>
                    {t.max === Infinity ? `${t.min}+ pcs` : `${t.min} – ${t.max} pcs`}
                  </span>
                  <span className={styles.tiersDiscount}>
                    {t.discount === 0 ? 'Standard price' : `${t.discount}% off`}
                  </span>
                  {active && <span className={styles.tiersYouAreHere}>You</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======= WHY SECTION ======= */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className="heading-sm text-gradient">Why MR Apparel</span>
              <h2 className="heading-lg" style={{ marginTop: '12px' }}>
                Bulk Orders, <span className="text-gradient">Better Prices</span>
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className={styles.whyGrid}>
            {[
              {
                title: 'Transparent Pricing',
                desc: 'No hidden costs. The price you calculate here reflects our standard rates — what you see is what you get.',
              },
              {
                title: 'Volume Discounts',
                desc: 'The more you order, the better the rate. Unlock up to 28% off when you order 500+ pieces.',
              },
              {
                title: 'Fast Turnaround',
                desc: 'Small orders ready in 3–5 days. Bulk corporate orders completed in under 3 weeks.',
              },
              {
                title: 'No Minimum Order',
                desc: 'Order as few as 10 pieces. We cater to startups, corporates, and events of all sizes.',
              },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className={styles.whyCard}>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyDesc}>{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
