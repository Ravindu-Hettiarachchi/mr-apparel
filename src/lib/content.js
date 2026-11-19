'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import base from '@/content/site.json';

export const DRAFT_KEY = 'mr-apparel:draft';
export const PREVIEW_KEY = 'mr-apparel:preview';

const ContentContext = createContext(base);

const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const fingerprint = (o) => {
  const t = JSON.stringify(o);
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return String(h);
};

// Make `d` (possibly from an older version of the site) match the shape of `b`:
// keys the site no longer has are dropped, keys it gained are filled from `b`.
function shapeLike(b, d) {
  if (isObj(b)) {
    if (!isObj(d)) return clone(b);
    const out = {};
    for (const k of Object.keys(b)) out[k] = k in d ? shapeLike(b[k], d[k]) : clone(b[k]);
    return out;
  }
  if (Array.isArray(b)) return Array.isArray(d) ? d : clone(b);
  return typeof d === typeof b ? d : clone(b);
}

/**
 * Drafts store only the top-level sections you actually changed, plus a
 * fingerprint of the live site they were based on. That way a draft can never
 * silently override newer published content or hide new sections.
 */
export function saveDraft(data) {
  const touched = Object.keys(base).filter((k) => JSON.stringify(data[k]) !== JSON.stringify(base[k]));
  if (!touched.length) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }
  const picked = {};
  const hashes = {};
  touched.forEach((k) => {
    picked[k] = data[k];
    hashes[k] = fingerprint(base[k]);
  });
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 3, touched, hashes, data: picked }));
}

/**
 * Returns the live content with your unpublished edits applied, or null.
 * A section's draft is only used while that section is unchanged on the live
 * site, so an old draft can never overwrite content that was published since.
 */
export function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d?.v !== 3 || !Array.isArray(d.touched)) {
      localStorage.removeItem(DRAFT_KEY); // older format: can't be trusted, drop it
      return null;
    }
    const out = clone(base);
    let used = 0;
    d.touched.forEach((k) => {
      if (k in base && d.data && k in d.data && d.hashes?.[k] === fingerprint(base[k])) {
        out[k] = shapeLike(base[k], d.data[k]);
        used++;
      }
    });
    if (!used) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return out;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(base);

  useEffect(() => {
    // Admins can preview unpublished edits in their own browser.
    try {
      if (localStorage.getItem(PREVIEW_KEY) === '1') {
        const d = readDraft();
        if (d) setContent(d);
      }
    } catch {}
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

export function waLink(number, text = '') {
  const n = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Section copy from content with safe fallbacks: sec(c, 'works') -> { eyebrow, title, lead } */
export function sec(c, key) {
  return { eyebrow: '', title: '', lead: '', ...(c.sections?.[key] || {}) };
}
