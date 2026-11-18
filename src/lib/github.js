// Minimal GitHub Contents API client used by the admin panel to publish
// content without a backend. The token lives only in the admin's browser.

const API = 'https://api.github.com';

function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

async function gh(token, path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok && res.status !== 404) {
    const t = await res.text();
    throw new Error(`GitHub ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.status === 404 ? null : res.json();
}

export async function getSha(token, repo, branch, path) {
  const r = await gh(token, `/repos/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`);
  return r?.sha;
}

export async function putFile(token, repo, branch, path, base64Content, message) {
  const sha = await getSha(token, repo, branch, path);
  return gh(token, `/repos/${repo}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64Content, branch, ...(sha ? { sha } : {}) }),
  });
}

export async function checkAccess(token, repo) {
  const r = await gh(token, `/repos/${repo}`);
  if (!r) throw new Error('Repository not found or token has no access.');
  if (!r.permissions?.push) throw new Error('Token cannot write to this repository.');
  return r;
}

// Walk content, upload any data: URL images to /public/uploads, swap for paths.
export async function uploadImages(token, repo, branch, content, onStep) {
  const copy = JSON.parse(JSON.stringify(content));
  const jobs = [];
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'string' && v.startsWith('data:image/')) jobs.push([node, k, v]);
        else walk(v);
      }
    }
  };
  walk(copy);
  for (let i = 0; i < jobs.length; i++) {
    const [obj, key, dataUrl] = jobs[i];
    const [, mime, data] = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.*)$/) || [];
    if (!data) continue;
    const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const name = `uploads/${Date.now()}-${i}.${ext}`;
    onStep?.(`Uploading image ${i + 1} of ${jobs.length}…`);
    await putFile(token, repo, branch, `public/${name}`, data, `admin: upload ${name}`);
    obj[key] = `/${name}`;
  }
  return copy;
}

export async function publishContent(token, cfg, content, onStep) {
  const { repo, branch, contentPath } = cfg;
  onStep?.('Checking access…');
  await checkAccess(token, repo);
  const withImages = await uploadImages(token, repo, branch, content, onStep);
  onStep?.('Publishing content…');
  await putFile(token, repo, branch, contentPath, b64(JSON.stringify(withImages, null, 2) + '\n'), 'admin: update site content');
  return withImages;
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
