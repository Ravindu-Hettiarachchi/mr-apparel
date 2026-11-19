'use client';

/*
  Shared by the category tiles, footer links and the "Our work" section.
  A tile asks for a filter ("Polos"); the portfolio turns that into the closest
  matching category chip ("Corporate polo"), or a keyword filter if none fits.
*/
export const WORK_FILTER_EVENT = 'mr-work-filter';

// lower-case, drop spaces/punctuation and a trailing "s": "T-shirts" and "t shirt" both become "tshirt"
export const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/s$/, '');

// A job can list several categories, separated by commas.
export const catsOf = (work) =>
  String(work?.category || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/** Every distinct category used by portfolio jobs, in order of first use. */
export function categoriesOf(works) {
  const seen = new Map();
  (works || []).forEach((w) =>
    catsOf(w).forEach((c) => {
      if (!seen.has(norm(c))) seen.set(norm(c), c);
    })
  );
  return [...seen.values()];
}

/** "Polos" -> the existing chip "Corporate polo"; unknown words stay as keyword filters. */
export function resolveFilter(raw, cats) {
  const f = norm(raw);
  if (!f) return 'All';
  return cats.find((c) => norm(c) === f) || cats.find((c) => norm(c).includes(f)) || String(raw).trim();
}

export function matchWork(work, filter, cats) {
  if (!filter || filter === 'All') return true;
  const f = norm(filter);
  if (cats.some((c) => norm(c) === f)) return catsOf(work).some((c) => norm(c) === f);
  return norm(`${catsOf(work).join(' ')} ${work.title || ''}`).includes(f); // keyword: category or title
}

export function requestWorkFilter(filter) {
  window.dispatchEvent(new CustomEvent(WORK_FILTER_EVENT, { detail: filter }));
}

export function scrollToWork() {
  const el = document.querySelector('#work');
  if (!el) return;
  const head = el.querySelector('.section-head') || el;
  const lenis = window.__mrLenis;
  if (lenis) lenis.scrollTo(head, { offset: -110, duration: 1.2 });
  else window.scrollTo({ top: head.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
}

/** onClick for any link that should open Our work with a filter applied. */
export function goToWork(e, filter) {
  e?.preventDefault?.();
  requestWorkFilter(filter || 'All');
  scrollToWork();
}
