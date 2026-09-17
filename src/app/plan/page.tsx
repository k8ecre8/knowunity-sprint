'use client';

/* /plan — the exam plan home. The `?day` seed picks the state: none for day
   one and section done, `review` for review day, `eve` for the plan-complete
   reminder. See PlanHome.tsx. */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlanHome, planDayFrom } from './PlanHome';

function Plan() {
  const params = useSearchParams();
  return <PlanHome day={planDayFrom(params.get('day'))} />;
}

export default function PlanPage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Plan />
    </Suspense>
  );
}
