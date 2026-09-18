'use client';

/* /plan — the exam plan home. The simulated day in the session picks the
   state; see PlanHome.tsx. `?day=review|eve` and `?reset` are the seeded
   entry links, applied by useEntryLink. */

import { Suspense } from 'react';
import { useEntryLink } from '@/mock/useEntryLink';
import { PlanHome } from './PlanHome';

function Plan() {
  const seeded = useEntryLink('/plan');
  return <PlanHome day={seeded ?? undefined} />;
}

export default function PlanPage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Plan />
    </Suspense>
  );
}
