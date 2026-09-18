'use client';

/* /plan — the exam plan home. The `?day` seed picks the state: none for day
   one and section done, `review` for review day, `eve` for the plan-complete
   reminder. See PlanHome.tsx.

   `?reset` clears the session and the mic answer, then drops itself from the
   URL, so a tester on a phone can start fresh without devtools. */

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPrototype } from '@/mock/session';
import { PlanHome, planDayFrom } from './PlanHome';

function Plan() {
  const params = useSearchParams();
  const router = useRouter();
  const reset = params.has('reset');
  const day = params.get('day');

  useEffect(() => {
    if (!reset) return;
    resetPrototype();
    router.replace(day ? `/plan?day=${day}` : '/plan');
  }, [reset, day, router]);

  return <PlanHome day={planDayFrom(day)} />;
}

export default function PlanPage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Plan />
    </Suspense>
  );
}
