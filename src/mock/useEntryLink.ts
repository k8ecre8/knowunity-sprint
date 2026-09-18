'use client';

/* The seeded entry links — SPEC.md → How the mocked recall behaves.
   `?reset` clears the session and the mic answer. `?day=review|eve` sets the
   simulated day in the session (see seedDay). `&ready` alongside `?day=eve`
   scripts every exam-eve term correct, for the all-correct summary. Each one
   then drops itself from the URL, so the day survives navigation and a
   tester on a phone can start fresh without devtools. */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dayFrom, resetPrototype, seedDay, updateSession, type Day } from './session';

/** Applies the seed on `path`, and returns the seeded day for the first render. */
export function useEntryLink(path: string): Day | null {
  const params = useSearchParams();
  const router = useRouter();
  const reset = params.has('reset');
  const day = dayFrom(params.get('day'));
  const ready = params.has('ready');

  useEffect(() => {
    if (!reset && !day && !ready) return;
    if (reset) resetPrototype();
    if (day) seedDay(day);
    if (ready) updateSession((s) => ({ ...s, eveReady: true }));
    router.replace(path);
  }, [reset, day, ready, path, router]);

  return day;
}
