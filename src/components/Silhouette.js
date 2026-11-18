// Flat garment illustrations used on cards when no photo is uploaded.
function shade(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

export default function Silhouette({ kind = 'polo', color = '#1d2a44' }) {
  const dark = shade(color, -28);
  const light = shade(color, 22);
  const id = `g${color.replace('#', '')}${kind}`;
  const longSleeve = kind === 'long' || kind === 'hoodie';
  const body = longSleeve
    ? 'M70 40 L40 52 L14 150 L34 156 L58 86 L60 190 L140 190 L142 86 L166 156 L186 150 L160 52 L130 40 Z'
    : 'M70 40 L36 54 L14 96 L40 110 L58 88 L60 190 L140 190 L142 88 L160 110 L186 96 L164 54 L130 40 Z';
  return (
    <svg viewBox="0 0 200 200" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={body} fill={`url(#${id})`} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
      {kind === 'polo' || kind === 'long' ? (
        <>
          <path d="M70 40 Q100 52 130 40 L122 62 L100 50 L78 62 Z" fill={dark} />
          <rect x="95" y="50" width="10" height="34" rx="2" fill={shade(color, -12)} />
          <circle cx="100" cy="62" r="2" fill="#f1efe9" />
          <circle cx="100" cy="74" r="2" fill="#f1efe9" />
        </>
      ) : kind === 'hoodie' ? (
        <>
          <path d="M70 40 Q100 10 130 40 Q120 70 100 72 Q80 70 70 40 Z" fill={dark} />
          <rect x="74" y="140" width="52" height="28" rx="8" fill={shade(color, -14)} />
        </>
      ) : (
        <path d="M70 40 Q100 62 130 40" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
      )}
      <path d="M60 182 L140 182" stroke={dark} strokeWidth="3" opacity="0.5" />
    </svg>
  );
}

export function kindFor(name = '') {
  const n = name.toLowerCase();
  if (n.includes('hood')) return 'hoodie';
  if (n.includes('long')) return 'long';
  if (n.includes('polo')) return 'polo';
  return 'tee';
}
