'use client';

/* Confidence check — SPEC.md → Screens → 5. Confidence check.
   Figma: "Confidence check (before See what stuck)" in Exam Section 1 - Claude
   (Core Flow). One whole-plan rating on five positions, taken again before
   the review round; the review summary compares it with the mocked
   before-plan rating. Two states: nothing selected (Start disabled) and one
   of five positions selected. The frame draws only the selected state. */

import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { AppBar } from '@/components/AppBar';
import { MascotSlot } from '@/components/MascotSlot';
import { ResponseBubble } from '@/components/ResponseBubble';
import { Button } from '@/components/Button';
import { confidenceLabels } from '@/mock/terms';
import { updateSession, useSession } from '@/mock/session';
import styles from './page.module.css';

const round = 'review';

/* Nothing-selected label: no frame draws it, so the line the headline
   occupies carries an instruction instead, so the stage holds its height. */
const unselectedLabel = 'Tap the bar to answer';

export default function ConfidenceCheckPage() {
  const router = useRouter();
  const session = useSession();
  const rating = session?.preReviewRating ?? null;

  const choose = (position: number) => {
    updateSession((s) => ({ ...s, preReviewRating: position }));
  };

  const start = () => {
    if (rating === null) return;
    // A new round starts on voice, and the review has nothing to resume.
    updateSession((s) => ({
      ...s,
      inputMode: 'voice',
      resume: s.resume?.round === round ? null : s.resume,
      practice: null,
    }));
    router.push(`/recall/${round}/1`);
  };

  return (
    <Scaffold
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          leftIcon="x-close"
          leftLabel="Close"
          onLeftPress={() => router.push('/plan')}
        />
      }
      middleContent={
        session && (
          <div className={styles.content}>
            <ResponseBubble
              showVerdict={false}
              body="How ready do you feel for your exam right now?"
              body2="Be honest, it helps Knowie choose which questions to ask."
            />
            <div className={styles.stage}>
              <MascotSlot size="3XL" name="giggling" />
              <p className={styles.label} data-selected={rating !== null} aria-live="polite">
                {rating === null ? unselectedLabel : confidenceLabels[rating - 1]}
              </p>
              {/* answerOption — not in the library, built inline. Five positions
                  on one bar; each position is its own 48-tall target. */}
              <div
                className={styles.slider}
                role="radiogroup"
                aria-label="How ready you feel"
                style={{ '--fill': rating === null ? '0%' : `${(rating / confidenceLabels.length) * 100}%` } as React.CSSProperties}
              >
                <div className={styles.track} aria-hidden="true">
                  <div className={styles.fill} />
                </div>
                <div className={styles.options}>
                  {confidenceLabels.map((label, index) => {
                    const position = index + 1;
                    return (
                      <button
                        key={label}
                        type="button"
                        role="radio"
                        aria-checked={rating === position}
                        aria-label={label}
                        className={styles.option}
                        onClick={() => choose(position)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      }
      bottomContent={
        <div className={styles.actions}>
          <Button variant="Primary" size="L" state={rating === null ? 'Disabled' : 'Default'} onClick={start}>
            Start the review
          </Button>
        </div>
      }
    />
  );
}
