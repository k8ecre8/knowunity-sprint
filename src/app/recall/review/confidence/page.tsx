'use client';

/* Confidence check — SPEC.md → Screens → 5. Confidence check.
   Figma: "Confidence check (before See what stuck)" in Exam Section 1 - Claude
   (Core Flow). One whole-plan rating on five positions, taken again before
   the review round; the review summary compares it with the mocked
   before-plan rating. Two states: nothing selected (Start disabled) and one
   of five positions selected. The frame draws only the selected state. */

import { useRef, useState } from 'react';
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

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const choose = (position: number) => {
    updateSession((s) => ({ ...s, preReviewRating: position }));
  };

  const LAST = confidenceLabels.length;

  /** Where a point on the track lands, snapped to the nearest of the five positions. */
  const positionFrom = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 1;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (LAST - 1)) + 1;
  };

  /* Press anywhere on the bar and it jumps there, then follows the finger until it lifts.
     Pointer capture keeps the drag alive past the edge of the control, so sliding off the end
     settles on the end rather than stopping wherever the finger left. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    choose(positionFrom(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    choose(positionFrom(event.clientX));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  /* A keyboard drives it too: the arrows step, Home and End go to the ends. An unanswered
     slider starts at the middle on the first key, which is where a student would start. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = rating ?? Math.ceil(LAST / 2);
    const step = (to: number) => {
      event.preventDefault();
      choose(Math.min(LAST, Math.max(1, to)));
    };
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') step(rating === null ? current : current - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') step(rating === null ? current : current + 1);
    else if (event.key === 'Home') step(1);
    else if (event.key === 'End') step(LAST);
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
              <MascotSlot size="3XL" name="standby" label="Knowie, standing by" />
              <p className={styles.label} data-selected={rating !== null} aria-live="polite">
                {rating === null ? unselectedLabel : confidenceLabels[rating - 1]}
              </p>
              {/* answerOption — not in the library, built inline; see docs/component-gaps.md.
                  A real slider since Sep 2026: press the bar and the thumb jumps there, then
                  follows the finger. It was five invisible buttons over a progress bar before,
                  with nothing to grab and no way to drag, which read as a slider and did not
                  behave like one. `role="slider"` rather than a radiogroup, because that is what
                  it now is; `aria-valuetext` carries the words, since "3 of 5" is not the
                  answer the student gave. */}
              <div
                ref={trackRef}
                className={styles.slider}
                role="slider"
                tabIndex={0}
                aria-label="How ready you feel"
                /* The range starts at 0, not 1, because a slider has to carry a value and this
                   one can be unanswered — Start stays disabled until it is not. 0 is that, and
                   `aria-valuetext` says so in words rather than leaving a screen reader to
                   announce a number below the first option. */
                aria-valuemin={0}
                aria-valuemax={LAST}
                aria-valuenow={rating ?? 0}
                aria-valuetext={rating === null ? 'Not answered yet' : confidenceLabels[rating - 1]}
                data-dragging={dragging || undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKeyDown}
                /* Unitless 0-1: the fill multiplies it by 100%, the thumb by the track's
                   width less its own, so both read one number. */
                style={{ '--at': rating === null ? 0 : (rating - 1) / (LAST - 1) } as React.CSSProperties}
              >
                <div className={styles.track} aria-hidden="true">
                  <div className={styles.fill} />
                  {/* One tick per position, drawn under the thumb and over the fill, so the bar
                      shows how many answers there are before any is chosen. */}
                  {confidenceLabels.map((label, index) => (
                    <span key={label} className={styles.tick} style={{ '--i': index } as React.CSSProperties} />
                  ))}
                </div>
                {/* The thumb only appears once there is an answer: an empty slider showing a
                    thumb at the left end would read as "not ready at all" already chosen. */}
                {rating !== null && <div className={styles.thumb} aria-hidden="true" />}
              </div>
            </div>
          </div>
        )
      }
      bottomContent={
        <div className={styles.actions}>
          <Button fullWidth variant="Primary" size="L" state={rating === null ? 'Disabled' : 'Default'} onClick={start}>
            Start the review
          </Button>
        </div>
      }
    />
  );
}
