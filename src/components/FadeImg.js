'use client';

import { useEffect, useRef, useState } from 'react';

/** Image that fades/un-blurs in once loaded, over a shimmer placeholder. */
export default function FadeImg({ className = '', wrapClass = '', ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, []);
  return (
    <span className={`fimg-wrap ${loaded ? 'is-loaded' : ''} ${wrapClass}`}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img ref={ref} {...props} className={`fimg ${className}`} onLoad={() => setLoaded(true)} />
    </span>
  );
}
