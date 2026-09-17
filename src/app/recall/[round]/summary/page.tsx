'use client';

/* The summary route for every round. Each round's summary is its own screen
   in SPEC.md, so each lives in its own file beside this one; this page only
   decides which one the segment names. */

import { Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import type { Round } from '@/mock/terms';
import { SectionSummary } from './SectionSummary';
import { EveSummary } from './EveSummary';
import { ReviewSummary } from './ReviewSummary';

const rounds: Round[] = ['section', 'review', 'eve'];

function isRound(value: string): value is Round {
  return (rounds as string[]).includes(value);
}

export default function SummaryPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = use(params);
  if (!isRound(round)) notFound();
  if (round === 'section') return <SectionSummary />;
  // These two read the search params, which Next needs behind Suspense.
  if (round === 'eve')
    return (
      <Suspense>
        <EveSummary />
      </Suspense>
    );
  return (
    <Suspense>
      <ReviewSummary />
    </Suspense>
  );
}
