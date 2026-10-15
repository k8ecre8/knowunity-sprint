'use client';

// Desktop preview: the app in an iPhone 13 frame, so a shared link shows the
// phone layout. Not a screen in SPEC.md. ?path= picks the route to frame.

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

// Only same-origin routes. Resolving against our own origin catches full URLs
// and the protocol-relative tricks (//site, /\site) that a "starts with /"
// check lets through. /preview itself would frame itself, so it falls back too.
// A placeholder origin rather than window.location keeps the server render and
// the client render the same, so hydration matches.
const BASE = 'http://preview.invalid';

function safePath(raw: string | null): string {
  if (!raw) return '/';
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return '/';
    if (url.pathname.startsWith('/preview')) return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}

function Preview() {
  const params = useSearchParams();
  const src = safePath(params.get('path'));
  return (
    <main className={styles.page}>
      <iframe className={styles.phone} src={src} title="Explain it to Knowie, phone preview" />
    </main>
  );
}

export default function PreviewPage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Preview />
    </Suspense>
  );
}
