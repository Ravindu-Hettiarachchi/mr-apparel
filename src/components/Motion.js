'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, transform, animate, useReducedMotion } from 'framer-motion';

/**
 * Scroll-linked mapping computed in JS. Avoids framer's native
 * ScrollTimeline acceleration, which is unreliable across browsers.
 */
export function useRange(mv, input, output) {
  return useTransform(mv, (v) => transform(v, input, output));
}

const EASE = [0.16, 1, 0.3, 1];

/**
 * Reveal — animates in when scrolled into view and back out when it
 * leaves, so the motion plays in both scroll directions.
 */
export function Reveal({ children, delay = 0, y = 40, x = 0, scale = 1, blur = true, className, as = 'div', amount = 0.25, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y, x, scale, filter: blur ? 'blur(8px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Stagger({ children, className, gap = 0.08, amount = 0.2 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
};

export function Item({ children, className, ...rest }) {
  return (
    <motion.div className={className} variants={itemVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/** Splits a headline into words that rise in one after another. */
export function SplitWords({ text, className, as = 'h2', delay = 0 }) {
  const Comp = motion[as];
  const words = String(text).split(' ');
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.5 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em' }} aria-hidden>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.8, ease: EASE } } }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

/** Apple-style text whose words light up as you scroll through it. */
export function ScrubText({ text, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const words = String(text).split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }) {
  const opacity = useRange(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }}>
      {children}{' '}
    </motion.span>
  );
}

export function CountUp({ value, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) {
      setN(0);
      return;
    }
    const c = animate(0, Number(value) || 0, { duration, ease: EASE, onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [inView, value, duration]);
  return (
    <strong ref={ref}>
      {Math.round(n).toLocaleString()}
      {suffix}
    </strong>
  );
}

/** Parallax wrapper — moves children slower/faster than the scroll. */
export function Parallax({ children, speed = 0.15, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useRange(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y, height: '100%' }}>{children}</motion.div>
    </div>
  );
}

/** Material ripple on click. */
export function useRipple() {
  return (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = `${s}px`;
    span.style.left = `${e.clientX - r.left - s / 2}px`;
    span.style.top = `${e.clientY - r.top - s / 2}px`;
    el.appendChild(span);
    setTimeout(() => span.remove(), 650);
  };
}
