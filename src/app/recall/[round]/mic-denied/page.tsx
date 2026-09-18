'use client';

/* Mic denied — SPEC.md → Screens → 4. Mic denied. No Figma frame; the content
   follows docs/voice-ux.md → "design the No": say what is missing, say how to
   re-enable it, and never dead-end. Denied is permanent for the session
   because the OS cannot re-prompt, so there is no "try again" here.

   Two states, told apart by `?from=typed`:
   - first denial, straight from the mocked iOS prompt;
   - reached again from "Use my voice instead" while still denied. */

import { Suspense, use, useEffect } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { MascotSlot } from '@/components/MascotSlot';
import { TextBlock } from '@/components/TextBlock';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/Button';
import type { Round } from '@/mock/terms';
import { currentTerm, updateSession, useSession } from '@/mock/session';
import styles from './page.module.css';

const rounds: Round[] = ['section', 'review', 'eve'];

function isRound(value: string): value is Round {
  return (rounds as string[]).includes(value);
}

const copy = {
  first: {
    headline: 'Knowie can’t hear you',
    caption: 'The mic is off for Knowunity, so this round is typed. It counts the same as saying it out loud.',
  },
  again: {
    headline: 'The mic is still off',
    caption: 'Knowunity can only ask once. Keep typing for now, and turn the mic on in Settings when you want to use your voice.',
  },
} as const;

function MicDenied({ round }: { round: Round }) {
  const router = useRouter();
  const session = useSession();
  const params = useSearchParams();
  const again = params.get('from') === 'typed';
  const text = again ? copy.again : copy.first;

  // Landing here means the prompt was refused. Record it if nothing did, so
  // "Use my voice instead" on the typed turn comes back here.
  useEffect(() => {
    if (session && session.micPermission !== 'denied') {
      updateSession((s) => ({ ...s, micPermission: 'denied' }));
    }
  }, [session]);

  const onTypeInstead = () => {
    // Typing sticks for the rest of the session.
    // The turn passes its term, so a practice pass returns to the term it was on.
    const passed = Number(params.get('term'));
    const term = Number.isInteger(passed) && passed > 0 ? passed : session ? currentTerm(session, round) : 1;
    updateSession((s) => ({ ...s, inputMode: 'typed' }));
    router.push(`/recall/${round}/${term}/typed`);
  };

  return (
    <Scaffold
      showTopNavSlot={false}
      middleContent={
        session && (
          <div className={styles.content}>
            <MascotSlot size="2XL" name="confused" className={styles.mascot} />
            <TextBlock headline={text.headline} showCaption caption={text.caption} />
            <NoteCard tone="neutral" icon="microphone-off-01">
              To turn it back on: open Settings, find Knowunity, and switch on Microphone.
            </NoteCard>
          </div>
        )
      }
      bottomContent={
        <div className={styles.actions}>
          <Button variant="Primary" size="L" onClick={onTypeInstead}>
            Type instead
          </Button>
          <Button variant="Text" size="L" onClick={() => router.push('/plan')}>
            Back to plan
          </Button>
        </div>
      }
    />
  );
}

export default function MicDeniedPage({ params }: { params: Promise<{ round: string }> }) {
  const { round } = use(params);
  if (!isRound(round)) notFound();
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <MicDenied round={round} />
    </Suspense>
  );
}
