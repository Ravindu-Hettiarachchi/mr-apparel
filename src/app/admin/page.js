'use client';

import { Component, useEffect, useMemo, useState } from 'react';
import base from '@/content/site.json';
import { DRAFT_KEY, PREVIEW_KEY, readDraft, saveDraft } from '@/lib/content';
import { publishContent, sha256, checkAccess } from '@/lib/github';
import {
  MdLogout,
  MdCloudUpload,
  MdVisibility,
  MdVisibilityOff,
  MdAdd,
  MdDelete,
  MdArrowUpward,
  MdArrowDownward,
  MdDownload,
  MdUpload,
  MdRestore,
  MdCheckCircle,
  MdError,
  MdImage,
  MdWarningAmber,
  MdInfoOutline,
} from 'react-icons/md';

const TOKEN_KEY = 'mr-apparel:gh-token';
const SESSION_KEY = 'mr-apparel:session';

const GROUPS = [
  ['Homepage', [
    ['hero', 'Hero & moving photos'],
    ['categories', 'Category tiles'],
    ['ticker', 'Scrolling ticker'],
    ['sections', 'Headings & intro text'],
  ]],
  ['Fabrics & finishes', [
    ['materials', 'Materials'],
    ['techniques', 'Finishes'],
  ]],
  ['Content', [
    ['works', 'Our work (portfolio)'],
    ['testimonials', 'Testimonials'],
    ['audiences', 'Who we serve'],
    ['quality', 'Quality points'],
    ['stats', 'Numbers'],
    ['process', 'Process steps'],
    ['faq', 'FAQ'],
  ]],
  ['Business', [
    ['brand', 'Brand & logo'],
    ['contact', 'Contact details'],
    ['quoteOptions', 'Quote form choices'],
    ['socials', 'Social media'],
    ['imageguide', 'Image size guide'],
    ['settings', 'Settings & publish'],
  ]],
];
const SECTIONS = GROUPS.flatMap(([, items]) => items);
const ENUMS = { fit: [['cover', 'Photo (fills the tile)'], ['contain', 'Product cut-out (fits inside)']] };
const isImageKey = (k) => k === 'image' || k === 'logo' || /Image$/.test(k);

const TEMPLATES = {
  categories: { label: '', sub: '', image: '', fit: 'cover', filter: '' },
  ticker: '',
  testimonials: { quote: '', name: '', role: '' },
  works: { title: '', client: '', category: '', quantity: '', year: '', text: '', image: '' },
  lookbook: { image: '', fit: 'cover', bgColor: '#dddddd', alt: '' },
  faq: { q: '', a: '' },
};

const LONG = ['text', 'quote', 'a', 'description', 'subtitle', 'title', 'q'];
const LABELS = {
  filter: 'Portfolio filter',
  category: 'Categories (separate several with commas)',
  workLink: 'Link under the buttons',
};
const HINTS = {
  filter: 'What visitors see when they click this tile: the Our work section, filtered to jobs whose Category or Title contains this word. Examples: Polos, T-shirts, sport jersey. Leave empty to use the tile name.',
  category: 'Visitors can filter Our work by these. Use commas to list a job under more than one filter, for example: Corporate polo, Polos.',
};
const pretty = (k) => LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
const clone = (o) => JSON.parse(JSON.stringify(o));
function blank(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  if (typeof v === 'number') return 0;
  if (typeof v === 'string' && v.startsWith('#')) return '#888888';
  return '';
}

/* ---------------- image sizes: what each spot on the site actually needs ----------------
   Sizes are 2x the on-screen size, so pictures stay sharp on retina screens. */
const PHOTO = 'JPG or WebP';
const CUTOUT = 'PNG or WebP with a transparent background';
const SPEC = {
  heroPhoto: { id: 'heroPhoto', title: 'Hero gallery: photo', where: 'Homepage hero, moving photo gallery', w: 1000, h: 1250, shape: '4:5 portrait', fit: 'cover', fmt: PHOTO, size: 'under 300 KB', tip: 'The edges can be trimmed, so keep the main subject in the middle. Using a product cut-out instead? Set "Image style" (below) to Product cut-out.' },
  heroCutout: { id: 'heroCutout', title: 'Hero gallery: product cut-out', where: 'Homepage hero, moving photo gallery', w: 1000, h: 1250, shape: '4:5 portrait', fit: 'contain', alpha: true, fmt: CUTOUT, size: 'under 250 KB', tip: 'Centre the garment and leave about 8% empty space around it. Pick the tile background colour below.' },
  catPhoto: { id: 'catPhoto', title: 'Category tile: photo', where: 'Homepage, the four tiles under the hero', w: 900, h: 1200, shape: '3:4 portrait', fit: 'cover', fmt: PHOTO, size: 'under 300 KB', tip: 'Keep the main subject in the middle. Using a product cut-out instead? Set "Image style" (below) to Product cut-out.' },
  catCutout: { id: 'catCutout', title: 'Category tile: product cut-out', where: 'Homepage, the four tiles under the hero', w: 900, h: 1200, shape: '3:4 portrait', fit: 'contain', alpha: true, fmt: CUTOUT, size: 'under 250 KB', tip: 'Centre the garment with some empty space around it.' },
  work: { id: 'work', title: 'Our work: portfolio photo', where: 'Our work grid and the pop-up viewer', w: 1200, h: 1500, shape: '4:5 portrait (square also works)', fit: 'free', fmt: PHOTO, size: 'under 400 KB', tip: 'Any height works. Keep the width at 1200 px or more.' },
  finish: { id: 'finish', title: 'Finish: card picture', where: 'Finishes section, card picture', w: 1600, h: 1000, shape: '16:10 landscape', fit: 'cover', fmt: PHOTO, size: 'under 350 KB', tip: 'Leave this empty on Embroidery and Screen Printing to keep their animated illustration.' },
  logo: { id: 'logo', title: 'Logo', where: 'Top bar, footer and admin', w: 240, h: 127, shape: 'wide, about 1.9:1', fit: 'contain', alpha: true, fmt: 'PNG with a transparent background', size: 'under 100 KB', tip: 'It is shown only about 30 px tall, so this size is plenty. The opening animation uses its own logo pieces and does not change when you replace this.' },
};
const SPEC_BY_PATH = {
  'hero.lookbook[].image': (sib) => (sib?.fit === 'contain' ? SPEC.heroCutout : SPEC.heroPhoto),
  'categories[].image': (sib) => (sib?.fit === 'contain' ? SPEC.catCutout : SPEC.catPhoto),
  'works[].image': () => SPEC.work,
  'techniques[].image': () => SPEC.finish,
  'brand.logo': () => SPEC.logo,
};
const getSpec = (path, sib) => (path && SPEC_BY_PATH[path] ? SPEC_BY_PATH[path](sib) : null);
const FIT_NOTE = {
  cover: 'Shown cropped to this exact shape. The centre is kept.',
  contain: 'Fits inside the frame without cropping, so a slightly different shape is fine.',
  free: 'Shown at its natural shape, so any height works.',
};

// How much a picture must be scaled up to fill its spot (1 = exact, 2 = twice as big as it has pixels for).
function upscale(nw, nh, spec) {
  if (spec.fit === 'cover') return Math.max(spec.w / nw, spec.h / nh);
  if (spec.fit === 'contain') return Math.min(spec.w / nw, spec.h / nh);
  return spec.w / nw;
}
function checkFit({ w: nw, h: nh }, spec) {
  const scale = upscale(nw, nh, spec);
  const want = spec.w / spec.h;
  const shapeOff = spec.fit === 'cover' && Math.abs(nw / nh - want) / want > 0.08;
  if (scale > 1.5) return { type: 'bad', text: `Too small, so it will look blurry. Please upload at least ${Math.round(spec.w / 1.5)} × ${Math.round(spec.h / 1.5)} px (ideal ${spec.w} × ${spec.h}).` };
  if (scale > 1.15) return { type: 'warn', text: `A little smaller than ideal. It works, but may look slightly soft on big screens.${shapeOff ? ` The shape also differs, so it will be cropped to ${spec.shape}.` : ''}` };
  if (shapeOff) return { type: 'warn', text: `The size is fine, but the shape is different, so it will be cropped to ${spec.shape}. Keep the subject in the centre.` };
  return { type: 'ok', text: 'Perfect, this fits the spot.' };
}

// Shrinks big uploads to just what the spot needs (never enlarges), keeping transparency.
function resizeImage(file, spec) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ow = img.naturalWidth || img.width;
      const oh = img.naturalHeight || img.height;
      const alpha = /png|webp|gif|svg/.test(file.type);
      // upscale() is the factor that makes the picture exactly fill its spot; below 1 means it has pixels to spare
      const sc = Math.min(1, spec ? upscale(ow, oh, spec) : 1600 / Math.max(ow, oh));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(ow * sc));
      c.height = Math.max(1, Math.round(oh * sc));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let dataUrl;
      if (!alpha) dataUrl = c.toDataURL('image/jpeg', 0.84);
      else {
        // keep transparency: WebP where the browser can encode it, otherwise PNG
        const w = c.toDataURL('image/webp', 0.86);
        dataUrl = w.startsWith('data:image/webp') ? w : c.toDataURL('image/png');
      }
      resolve({ dataUrl, ow, oh, w: c.width, h: c.height, alpha, kb: Math.round((dataUrl.length * 0.75) / 1024) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

/* ---------------- generic editors ---------------- */
const VERDICT_ICON = { ok: MdCheckCircle, warn: MdWarningAmber, bad: MdError, info: MdInfoOutline };
function Verdict({ type, children }) {
  const Icon = VERDICT_ICON[type] || MdInfoOutline;
  return (
    <p className={`a-verdict ${type}`}>
      <Icon size={18} />
      <span>{children}</span>
    </p>
  );
}

function ImageField({ name, value, onChange, path, siblings }) {
  const v = value ?? '';
  const spec = getSpec(path, siblings);
  const [dims, setDims] = useState(null); // real size of the picture currently shown
  const [broken, setBroken] = useState(false);
  const [note, setNote] = useState(null);
  const verdict = dims && spec ? checkFit(dims, spec) : null;

  useEffect(() => {
    if (!v) {
      setDims(null);
      setBroken(false);
    }
  }, [v]);

  const upload = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const r = await resizeImage(f, spec);
      onChange(r.dataUrl);
      const needsAlpha = spec?.alpha && !r.alpha;
      setNote({
        type: needsAlpha ? 'warn' : 'info',
        text: `Your file was ${r.ow} × ${r.oh} px. Saved as ${r.w} × ${r.h} px (about ${r.kb} KB).${needsAlpha ? ' This spot looks best with a transparent PNG or WebP. A JPG has a solid background.' : ''}`,
      });
    } catch {
      setNote({ type: 'bad', text: "That file couldn't be read. Please use a JPG, PNG or WebP image." });
    }
  };

  const frameStyle = spec && spec.fit !== 'free' ? { aspectRatio: `${spec.w} / ${spec.h}` } : undefined;
  return (
    <div className="a-field">
      <span>{name === 'logo' ? 'Logo image' : 'Image'}</span>
      <div className="a-image">
        <div className={`a-frame ${spec ? spec.fit : 'none'} ${spec?.alpha ? 'checker' : ''}`} style={frameStyle}>
          {v ? (
            <img
              src={v}
              alt=""
              onLoad={(e) => {
                setBroken(false);
                setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
              }}
              onError={() => {
                setDims(null);
                setBroken(true);
              }}
            />
          ) : (
            <MdImage size={28} />
          )}
        </div>
        <div className="a-image-main">
          {spec && (
            <div className="a-spec">
              <div className="a-spec-head">
                <b>
                  {spec.w} × {spec.h} px
                </b>
                <span>{spec.shape}</span>
              </div>
              <dl>
                <dt>Used for</dt>
                <dd>{spec.where}</dd>
                <dt>Format</dt>
                <dd>
                  {spec.fmt}, {spec.size}
                </dd>
                <dt>Fit</dt>
                <dd>{FIT_NOTE[spec.fit]}</dd>
              </dl>
              {spec.tip && <p className="a-spec-tip">{spec.tip}</p>}
            </div>
          )}
          <div className="a-image-actions">
            <label className="a-btn a-btn-tonal">
              <MdUpload /> {v ? 'Replace' : 'Upload'}
              <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={upload} />
            </label>
            {v && (
              <button
                className="a-btn a-btn-text"
                onClick={() => {
                  onChange('');
                  setNote(null);
                }}
              >
                Remove
              </button>
            )}
            <input className="a-path" placeholder="/images/… or https://…" value={v.startsWith('data:') ? '(new upload — saved on publish)' : v} onChange={(e) => onChange(e.target.value)} disabled={v.startsWith('data:')} />
          </div>
          {broken && <Verdict type="bad">No picture was found at this address.</Verdict>}
          {!broken && dims && (
            <p className="a-current">
              Current picture: <b>{dims.w} × {dims.h} px</b>
            </p>
          )}
          {verdict && <Verdict type={verdict.type}>{verdict.text}</Verdict>}
          {note && <Verdict type={note.type}>{note.text}</Verdict>}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, autoComplete, autoFocus, label, className = '' }) {
  return (
    <div className={`a-pw ${className}`}>
      <input
        className="a-input a-pw-input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-label={label}
        spellCheck={false}
        autoCapitalize="off"
      />
      <button type="button" className="a-pw-toggle" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} title={show ? 'Hide password' : 'Show password'}>
        {show ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
      </button>
    </div>
  );
}

function Field({ name, value, onChange, template, path, siblings }) {
  if (typeof value === 'number') {
    return (
      <label className="a-field">
        <span>{pretty(name)}</span>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (Array.isArray(value)) return <ArrayEditor name={name} value={value} onChange={onChange} template={template} path={path} />;
  if (value && typeof value === 'object') {
    return (
      <fieldset className="a-group">
        <legend>{pretty(name)}</legend>
        <ObjectEditor value={value} onChange={onChange} path={path} />
      </fieldset>
    );
  }
  const v = value ?? '';
  if (ENUMS[name]) {
    return (
      <label className="a-field">
        <span>{pretty(name === 'fit' ? 'Image style' : name)}</span>
        <select value={v} onChange={(e) => onChange(e.target.value)}>
          {ENUMS[name].map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (isImageKey(name)) return <ImageField name={name} value={v} onChange={onChange} path={path} siblings={siblings} />;
  if (/color|hex/i.test(name)) {
    return (
      <label className="a-field">
        <span>{pretty(name)}</span>
        <div className="a-color">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : '#888888'} onChange={(e) => onChange(e.target.value)} />
          <input value={v} onChange={(e) => onChange(e.target.value)} />
        </div>
      </label>
    );
  }
  const long = v.includes('\n') || (LONG.includes(name) && (v.length > 50 || name !== 'title'));
  return (
    <label className="a-field">
      <span>{pretty(name)}</span>
      {long ? <textarea rows={3} value={v} onChange={(e) => onChange(e.target.value)} /> : <input value={v} onChange={(e) => onChange(e.target.value)} />}
      {HINTS[name] && <small className="a-hint">{HINTS[name]}</small>}
    </label>
  );
}

function ObjectEditor({ value, onChange, skip = [], path = '' }) {
  const NESTED = { lookbook: TEMPLATES.lookbook };
  return (
    <div className="a-grid">
      {Object.entries(value)
        .filter(([k]) => !skip.includes(k))
        .map(([k, v]) => (
          <div key={k} className={Array.isArray(v) || (v && typeof v === 'object') || isImageKey(k) || LONG.includes(k) ? 'a-span' : ''}>
            <Field name={k} value={v} template={NESTED[k]} path={path ? `${path}.${k}` : k} siblings={value} onChange={(nv) => onChange({ ...value, [k]: nv })} />
          </div>
        ))}
    </div>
  );
}

function ArrayEditor({ name, value, onChange, template, path = '' }) {
  const tpl = template ?? value[0];
  const move = (i, d) => {
    const a = [...value];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    onChange(a);
  };
  const titleOf = (it, i) => (typeof it === 'object' ? it.name || it.title || it.q || it.label || it.kicker || it.alt || `Item ${i + 1}` : String(it) || `Item ${i + 1}`);
  return (
    <div className="a-array">
      {name && <div className="a-array-head">{pretty(name)}</div>}
      {value.map((it, i) => (
        <details key={i} className="a-item" open={value.length <= 3}>
          <summary>
            <span className="a-item-title">
              {it?.image && <img className="a-thumb" src={it.image} alt="" />}
              {it?.hex && !it?.image && <i className="a-dot" style={{ background: it.hex }} />}
              {it?.color && <i className="a-dot" style={{ background: it.color }} />}
              {titleOf(it, i)}
            </span>
            <span className="a-item-actions" onClick={(e) => e.preventDefault()}>
              <button title="Move up" onClick={() => move(i, -1)}>
                <MdArrowUpward />
              </button>
              <button title="Move down" onClick={() => move(i, 1)}>
                <MdArrowDownward />
              </button>
              <button
                title="Delete"
                className="danger"
                onClick={() => {
                  if (confirm(`Delete "${titleOf(it, i)}"?`)) onChange(value.filter((_, k) => k !== i));
                }}
              >
                <MdDelete />
              </button>
            </span>
          </summary>
          <div className="a-item-body">
            {typeof it === 'object' ? (
              <ObjectEditor value={it} path={`${path}[]`} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
            ) : (
              <input value={it} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
            )}
          </div>
        </details>
      ))}
      <button className="a-btn a-btn-tonal" onClick={() => onChange([...value, tpl ? (template ? clone(template) : blank(tpl)) : ''])}>
        <MdAdd /> Add {name ? pretty(name).replace(/s$/, '').toLowerCase() : 'item'}
      </button>
    </div>
  );
}

/* ---------------- safety net ---------------- */
class EditorBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="a-settings">
        <section>
          <h2>This section couldn&apos;t be shown</h2>
          <p className="a-help">Something in your saved draft doesn&apos;t match the site any more. Resetting the draft loads the live version again (your published content is not affected).</p>
          <button
            className="a-btn a-btn-filled"
            onClick={() => {
              try {
                localStorage.removeItem(DRAFT_KEY);
              } catch {}
              location.reload();
            }}
          >
            Reset draft &amp; reload
          </button>
        </section>
      </div>
    );
  }
}

/* ---------------- image size guide ---------------- */
function ImageGuide() {
  return (
    <div className="a-guide">
      <p className="a-help">
        Upload pictures at these sizes for the sharpest result. Pictures bigger than the size are shrunk automatically when you upload. Smaller ones are never stretched, but can look soft. The exact size for each picture is also shown next to its upload button.
      </p>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Picture</th>
              <th>Size (px)</th>
              <th>Shape</th>
              <th>Format</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SPEC).map((x) => (
              <tr key={x.id}>
                <td>
                  <b>{x.title}</b>
                  <small>{x.where}</small>
                </td>
                <td className="num">
                  {x.w} × {x.h}
                </td>
                <td>
                  <i className="a-shape" style={{ aspectRatio: `${x.w} / ${x.h}` }} />
                  {x.shape}
                </td>
                <td>
                  {x.fmt}
                  <small>{x.size}</small>
                </td>
                <td>
                  {FIT_NOTE[x.fit]} {x.tip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="a-tips">
        <li>File names don&apos;t matter. Only the picture itself does.</li>
        <li>Use JPG for photos and PNG or WebP for cut-outs that need a transparent background.</li>
        <li>For product colours, shoot or render every colour from the same angle, with the same size and position.</li>
        <li>Pictures are saved when you press Publish, so keep each one small to keep the site fast.</li>
      </ul>
    </div>
  );
}

/* ---------------- login ---------------- */
function Login({ hash, onOk }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const setup = !hash;
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (setup) {
      if (pw.length < 8) return setErr('Use at least 8 characters.');
      if (pw !== pw2) return setErr('Passwords do not match.');
      onOk(await sha256(pw));
      return;
    }
    if ((await sha256(pw)) === hash) onOk();
    else setErr('Incorrect password.');
  };
  return (
    <div className="a-login">
      <form className="a-login-card" onSubmit={submit}>
        <img className="a-logo-img" src={base.brand.logo || '/images/mr-logo-wide.png'} alt={base.brand.name} />
        <h1>{setup ? 'Create admin password' : 'Admin sign in'}</h1>
        <p>{setup ? 'This password protects the editor on this site.' : `Manage ${base.brand.name} website content.`}</p>
        <div className="a-field">
          <span>Password</span>
          <PasswordInput label="Password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} show={show} onToggle={() => setShow((x) => !x)} autoComplete={setup ? 'new-password' : 'current-password'} />
        </div>
        {setup && (
          <div className="a-field">
            <span>Confirm password</span>
            <PasswordInput label="Confirm password" value={pw2} onChange={(e) => setPw2(e.target.value)} show={show} onToggle={() => setShow((x) => !x)} autoComplete="new-password" />
          </div>
        )}
        {setup && (
          <ul className="a-pw-hints">
            <li className={pw.length >= 8 ? 'ok' : ''}>At least 8 characters</li>
            <li className={pw2 && pw === pw2 ? 'ok' : ''}>Both passwords match</li>
          </ul>
        )}
        {err && <div className="a-err">{err}</div>}
        <button className="a-btn a-btn-filled a-btn-lg" type="submit">
          {setup ? 'Continue' : 'Sign in'}
        </button>
        <a href="/" className="a-back">
          ← Back to website
        </a>
      </form>
    </div>
  );
}

/* ---------------- main ---------------- */
export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(base);
  const [tab, setTab] = useState('hero');
  const [token, setToken] = useState('');
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState(null); // {type, msg}
  const [busy, setBusy] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    try {
      const d = readDraft();
      if (d) setData(d);
      setToken(localStorage.getItem(TOKEN_KEY) || '');
      setPreview(localStorage.getItem(PREVIEW_KEY) === '1');
      setAuthed(sessionStorage.getItem(SESSION_KEY) === '1');
    } catch {}
    setReady(true);
  }, []);

  // autosave draft
  useEffect(() => {
    if (!ready || !authed) return;
    try {
      saveDraft(data);
    } catch {
      setStatus({ type: 'error', msg: 'Draft is too large for browser storage — publish to save your images.' });
    }
  }, [data, ready, authed]);

  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(base), [data]);

  if (!ready) return null;
  if (!authed) {
    return (
      <Login
        hash={data.admin?.passwordHash}
        onOk={(newHash) => {
          if (newHash) setData((d) => ({ ...d, admin: { ...d.admin, passwordHash: newHash } }));
          try {
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {}
          setAuthed(true);
        }}
      />
    );
  }

  const togglePreview = () => {
    const v = !preview;
    setPreview(v);
    try {
      localStorage.setItem(PREVIEW_KEY, v ? '1' : '0');
    } catch {}
  };

  const publish = async () => {
    if (!token) {
      setTab('settings');
      setStatus({ type: 'error', msg: 'Add a GitHub token in Settings first.' });
      return;
    }
    setBusy(true);
    try {
      const saved = await publishContent(token, data.admin, data, (m) => setStatus({ type: 'info', msg: m }));
      setData(saved);
      setStatus({ type: 'ok', msg: 'Published! The live site rebuilds automatically in about a minute.' });
    } catch (e) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site.json';
    a.click();
  };
  const importJson = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setData(JSON.parse(await f.text()));
      setStatus({ type: 'ok', msg: 'Imported. Review and publish.' });
    } catch {
      setStatus({ type: 'error', msg: 'That file is not valid JSON.' });
    }
  };

  const section = SECTIONS.find(([k]) => k === tab);

  return (
    <div className="a-app">
      <aside className="a-side">
        <div className="a-side-brand">
          <img className="a-logo-img sm" src={data.brand?.logo || base.brand.logo || '/images/mr-logo-wide.png'} alt="" />
          <div>
            <strong>{data.brand.name}</strong>
            <small>Content editor</small>
          </div>
        </div>
        <nav>
          {GROUPS.map(([g, items]) => (
            <div key={g} className="a-group-nav">
              <small>{g}</small>
              {items.map(([k, l]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                  {l}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          className="a-btn a-btn-text"
          onClick={() => {
            try {
              sessionStorage.removeItem(SESSION_KEY);
            } catch {}
            setAuthed(false);
          }}
        >
          <MdLogout /> Sign out
        </button>
      </aside>

      <main className="a-main">
        <header className="a-top">
          <div>
            <h1>{section?.[1]}</h1>
            <span className={`a-badge ${dirty ? 'warn' : ''}`}>{dirty ? 'Unpublished changes' : 'Up to date'}</span>
          </div>
          <div className="a-top-actions">
            <button className="a-btn a-btn-outline" onClick={togglePreview} title="Show your draft on the website in this browser only">
              {preview ? <MdVisibility /> : <MdVisibilityOff />} Preview {preview ? 'on' : 'off'}
            </button>
            <a className="a-btn a-btn-outline" href="/" target="_blank" rel="noreferrer">
              Open site
            </a>
            <button className="a-btn a-btn-filled" onClick={publish} disabled={busy}>
              <MdCloudUpload /> {busy ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </header>

        {status && (
          <div className={`a-status ${status.type}`} onClick={() => setStatus(null)}>
            {status.type === 'ok' ? <MdCheckCircle /> : status.type === 'error' ? <MdError /> : null}
            {status.msg}
          </div>
        )}

        <div className="a-card">
          <EditorBoundary key={tab}>
          {tab === 'imageguide' ? (
            <ImageGuide />
          ) : tab === 'settings' ? (
            <div className="a-settings">
              <section>
                <h2>Publishing</h2>
                <p className="a-help">
                  Edits are saved as a draft in this browser. <b>Publish</b> commits them to GitHub, and Vercel rebuilds the live site automatically. Create a{' '}
                  <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                    fine-grained GitHub token
                  </a>{' '}
                  with <b>Contents: Read and write</b> access to only this repository. The token is stored only in this browser.
                </p>
                <div className="a-grid">
                  <div className="a-field a-span">
                    <span>GitHub token</span>
                    <PasswordInput
                      label="GitHub token"
                      value={token}
                      placeholder="github_pat_…"
                      show={showToken}
                      onToggle={() => setShowToken((x) => !x)}
                      autoComplete="off"
                      onChange={(e) => {
                        setToken(e.target.value);
                        try {
                          localStorage.setItem(TOKEN_KEY, e.target.value);
                        } catch {}
                      }}
                    />
                  </div>
                  <Field name="repo" value={data.admin.repo} onChange={(v) => setData({ ...data, admin: { ...data.admin, repo: v } })} />
                  <Field name="branch" value={data.admin.branch} onChange={(v) => setData({ ...data, admin: { ...data.admin, branch: v } })} />
                </div>
                <button
                  className="a-btn a-btn-tonal"
                  onClick={async () => {
                    try {
                      await checkAccess(token, data.admin.repo);
                      setStatus({ type: 'ok', msg: 'Token works and can publish.' });
                    } catch (e) {
                      setStatus({ type: 'error', msg: e.message });
                    }
                  }}
                >
                  Test connection
                </button>
              </section>
              <section>
                <h2>Admin password</h2>
                <p className="a-help">The new password takes effect after you publish.</p>
                <div className="a-row">
                  <PasswordInput label="New password" placeholder="New password (8+ characters)" value={newPw} onChange={(e) => setNewPw(e.target.value)} show={showNewPw} onToggle={() => setShowNewPw((x) => !x)} autoComplete="new-password" />
                  <button
                    className="a-btn a-btn-tonal"
                    onClick={async () => {
                      if (newPw.length < 8) return setStatus({ type: 'error', msg: 'Use at least 8 characters.' });
                      const h = await sha256(newPw);
                      setData({ ...data, admin: { ...data.admin, passwordHash: h } });
                      setNewPw('');
                      setStatus({ type: 'ok', msg: 'Password updated in draft. Publish to apply.' });
                    }}
                  >
                    Change password
                  </button>
                </div>
                <ul className="a-pw-hints">
                  <li className={newPw.length >= 8 ? 'ok' : ''}>At least 8 characters</li>
                </ul>
              </section>
              <section>
                <h2>Backup</h2>
                <div className="a-row">
                  <button className="a-btn a-btn-outline" onClick={exportJson}>
                    <MdDownload /> Export JSON
                  </button>
                  <label className="a-btn a-btn-outline">
                    <MdUpload /> Import JSON
                    <input type="file" accept="application/json" hidden onChange={importJson} />
                  </label>
                  <button
                    className="a-btn a-btn-text danger"
                    onClick={() => {
                      if (confirm('Discard all unpublished changes?')) {
                        setData(clone(base));
                        setStatus({ type: 'ok', msg: 'Draft reset to the live version.' });
                      }
                    }}
                  >
                    <MdRestore /> Discard draft
                  </button>
                </div>
              </section>
            </div>
          ) : Array.isArray(data[tab] ?? base[tab]) ? (
            <ArrayEditor value={data[tab] ?? base[tab]} onChange={(v) => setData({ ...data, [tab]: v })} name={section?.[1]} template={TEMPLATES[tab]} path={tab} />
          ) : (
            <ObjectEditor value={data[tab] ?? base[tab]} onChange={(v) => setData({ ...data, [tab]: v })} path={tab} />
          )}
          </EditorBoundary>
        </div>
      </main>
    </div>
  );
}
