'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import base from '@/content/site.json';

export const DRAFT_KEY = 'mr-apparel:draft';
export const PREVIEW_KEY = 'mr-apparel:preview';

const ContentContext = createContext(base);

export function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
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
