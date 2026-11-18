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
  ['Shop', [
    ['garments', 'Products, prices & colours'],
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
    ['socials', 'Social media'],
    ['settings', 'Settings & publish'],
  ]],
];
const SECTIONS = GROUPS.flatMap(([, items]) => items);
const ENUMS = { fit: [['cover', 'Photo (fills the tile)'], ['contain', 'Product cut-out (fits inside)']] };
const isImageKey = (k) => k === 'image' || k === 'logo' || /Image$/.test(k);

const TEMPLATES = {
  categories: { label: '', sub: '', image: '', fit: 'cover', link: '#garments' },
  ticker: '',
  garments: { name: '', category: 'Polos', fabric: '', from: 'LKR 0', tag: '', image: '', variants: [{ name: '', hex: '#888888', image: '' }] },
  testimonials: { quote: '', name: '', role: '' },
  works: { title: '', client: '', category: '', quantity: '', year: '', text: '', image: '' },
  lookbook: { image: '', fit: 'cover', bgColor: '#dddddd', alt: '' },
  faq: { q: '', a: '' },
};

const LONG = ['text', 'quote', 'a', 'description', 'subtitle', 'title', 'q'];
const pretty = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
const clone = (o) => JSON.parse(JSON.stringify(o));
function blank(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  if (typeof v === 'number') return 0;
  if (typeof v === 'string' && v.startsWith('#')) return '#888888';
  return '';
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const alpha = /png|webp|gif|svg/.test(file.type);
      const max = alpha ? 1100 : 1600; // cut-outs are shown small, photos need more room
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * sc);
      c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      if (!alpha) return resolve(c.toDataURL('image/jpeg', 0.84));
      // keep transparency: WebP where the browser can encode it, otherwise PNG
      const w = c.toDataURL('image/webp', 0.86);
      resolve(w.startsWith('data:image/webp') ? w : c.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* ---------------- generic editors ---------------- */
function Field({ name, value, onChange, template }) {
  if (typeof value === 'number') {
    return (
      <label className="a-field">
        <span>{pretty(name)}</span>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (Array.isArray(value)) return <ArrayEditor name={name} value={value} onChange={onChange} template={template} />;
  if (value && typeof value === 'object') {
    return (
      <fieldset className="a-group">
        <legend>{pretty(name)}</legend>
        <ObjectEditor value={value} onChange={onChange} />
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
  if (isImageKey(name)) {
    return (
      <div className="a-field">
        <span>{name === 'logo' ? 'Logo image' : 'Image'}</span>
        <div className="a-image">
          {v ? <img src={v} alt="" /> : <div className="a-image-empty"><MdImage size={28} /></div>}
          <div className="a-image-actions">
            <label className="a-btn a-btn-tonal">
              <MdUpload /> {v ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) onChange(await resizeImage(f));
                }}
              />
            </label>
            {v && (
              <button className="a-btn a-btn-text" onClick={() => onChange('')}>
                Remove
              </button>
            )}
            <input className="a-path" placeholder="/images/… or https://…" value={v.startsWith('data:') ? '(new upload — saved on publish)' : v} onChange={(e) => onChange(e.target.value)} disabled={v.startsWith('data:')} />
          </div>
        </div>
      </div>
    );
  }
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
    </label>
  );
}

function ObjectEditor({ value, onChange, skip = [] }) {
  const NESTED = { lookbook: TEMPLATES.lookbook, variants: TEMPLATES.garments.variants[0] };
  return (
    <div className="a-grid">
      {Object.entries(value)
        .filter(([k]) => !skip.includes(k))
        .map(([k, v]) => (
          <div key={k} className={Array.isArray(v) || (v && typeof v === 'object') || isImageKey(k) || LONG.includes(k) ? 'a-span' : ''}>
            <Field name={k} value={v} template={NESTED[k]} onChange={(nv) => onChange({ ...value, [k]: nv })} />
          </div>
        ))}
    </div>
  );
}

function ArrayEditor({ name, value, onChange, template }) {
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
              <ObjectEditor value={it} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
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

/* ---------------- login ---------------- */
function Login({ hash, onOk }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
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
        <label className="a-field">
          <span>Password</span>
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={setup ? 'new-password' : 'current-password'} />
        </label>
        {setup && (
          <label className="a-field">
            <span>Confirm password</span>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
          </label>
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
          {tab === 'settings' ? (
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
                  <label className="a-field a-span">
                    <span>GitHub token</span>
                    <input
                      type="password"
                      value={token}
                      placeholder="github_pat_…"
                      onChange={(e) => {
                        setToken(e.target.value);
                        try {
                          localStorage.setItem(TOKEN_KEY, e.target.value);
                        } catch {}
                      }}
                    />
                  </label>
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
                  <input className="a-input" type="password" placeholder="New password (8+ characters)" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
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
            <ArrayEditor value={data[tab] ?? base[tab]} onChange={(v) => setData({ ...data, [tab]: v })} name={section?.[1]} template={TEMPLATES[tab]} />
          ) : (
            <ObjectEditor value={data[tab] ?? base[tab]} onChange={(v) => setData({ ...data, [tab]: v })} />
          )}
          </EditorBoundary>
        </div>
      </main>
    </div>
  );
}
