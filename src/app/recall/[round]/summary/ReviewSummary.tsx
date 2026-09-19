'use client';

/* Review summary — SPEC.md → Screens → 3. Review summary.
   Figma: "Review summary / Days later claim" in Exam Section 1 - Claude
   (Core Flow). The same-day and underconfidence states have no frame.
   The only summary allowed to claim learning, and only for terms the
   student last revised more than a day ago. Every number is a count of
   outcome rows; the gap is the time since the term was last revised. */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { SummaryCard, type SummaryCardTone } from '@/components/SummaryCard';
import { TextBlock } from '@/components/TextBlock';
import { NoteCard } from '@/components/NoteCard';
import { MascotSlot } from '@/components/MascotSlot';
import { IconSlot } from '@/components/IconSlot';
import { Button } from '@/components/Button';
import { beforePlanRating, confidenceLabels, findTerm } from '@/mock/terms';
import { advanceDay, roundTerms, rowsForRound, updateSession, useSession, type OutcomeRow } from '@/mock/session';
import shared from './page.module.css';
import styles from './review.module.css';

const round = 'review';
const ROW_LIMIT = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/* Open 23, decided here: confidence is "same" when the position is the same;
   performance is "same" when the correct-without-help rate moves less than
   a tenth. With three section terms and ten review terms, exact equality
   almost never happens, so a threshold is needed for "same" to exist. */
const SAME_THRESHOLD = 0.1;

type Direction = 'up' | 'same' | 'down';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function direction(delta: number, threshold: number): Direction {
  if (delta > threshold) return 'up';
  if (delta < -threshold) return 'down';
  return 'same';
}

/* The nine copy versions (Open 23, decided here). Confidence direction, then
   performance direction. Overconfidence is named where the feeling ran ahead
   of the evidence; underconfidence gets the evidence and a celebratory Knowie
   where the evidence ran ahead of the feeling. */
const comparison: Record<Direction, Record<Direction, { headline: string; body: string; celebrate?: boolean }>> = {
  up: {
    up: { headline: 'You felt more confident.', body: 'Your answers back that up.' },
    same: {
      headline: 'You felt more confident.',
      body: 'Your answers stayed about where they were. The feeling ran a little ahead of the evidence, so trust the cards above more than the feeling.',
    },
    down: {
      headline: 'You felt more confident, but your answers went the other way.',
      body: 'That’s overconfidence, and it’s common. The cards above are the honest picture, and the misses are where to spend tomorrow.',
    },
  },
  same: {
    up: {
      headline: 'You felt about the same.',
      body: 'Your answers got better than you think. That’s underconfidence, and the cards above are the evidence.',
      celebrate: true,
    },
    same: { headline: 'You felt about the same.', body: 'Your answers say the same. Your read on yourself is accurate.' },
    down: {
      headline: 'You felt about the same, but your answers slipped.',
      body: 'That gap is worth knowing about. The misses above are the terms the feeling is skipping over.',
    },
  },
  down: {
    up: {
      headline: 'You felt less confident, but your answers got better.',
      body: 'That’s underconfidence. Look at the cards above: the evidence says you know more than you feel.',
      celebrate: true,
    },
    same: {
      headline: 'You felt less confident.',
      body: 'Your answers stayed about where they were, so nothing has actually slipped. You know more than you feel.',
      celebrate: true,
    },
    down: {
      headline: 'You felt less confident, and your answers agree.',
      body: 'Your read on yourself is accurate. The misses above are where to start.',
    },
  },
};

/* One card whose row count the screen decides: everything when `open`, else
   three rows and an overflow row that opens it. Opening changes only the view. */
function Card({ tone, names, open }: { tone: SummaryCardTone; names: string[]; open: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const showAll = open || expanded || names.length <= ROW_LIMIT;
  if (showAll) return <SummaryCard tone={tone} terms={names} showOverflowRow={false} />;
  return (
    <SummaryCard
      tone={tone}
      showRow1
      showRow2
      showRow3
      term1={names[0]}
      term2={names[1]}
      term3={names[2]}
      showOverflowRow
      overflowText={`${names.length - ROW_LIMIT} more`}
      onOverflowPress={() => setExpanded(true)}
    />
  );
}

/* "How you felt": the before-plan and today ratings side by side. No component
   exists for it; built here as `confidenceReads`. See docs/component-gaps.md. */
function ConfidenceReads({ before, today }: { before: string; today: string }) {
  return (
    <div className={styles.reads}>
      <div className={styles.read}>
        <span className={styles.readLabel}>Before the plan</span>
        <span className={styles.readValue}>{before}</span>
      </div>
      <span className={styles.readArrow}>
        <IconSlot size="250" name="arrow-right" />
      </span>
      <div className={styles.read}>
        <span className={styles.readLabel}>Today</span>
        <span className={styles.readValue}>{today}</span>
      </div>
    </div>
  );
}

export function ReviewSummary() {
  const router = useRouter();
  const session = useSession();
  const search = useSearchParams();

  // null until the browser has the session, so server and client markup match.
  const rows = session ? rowsForRound(session, round) : null;

  // Nothing answered yet (a direct URL): there is no summary to show, so start the round.
  const empty = rows !== null && rows.length === 0;
  useEffect(() => {
    if (empty) router.replace('/recall/review/confidence');
  }, [empty, router]);
  const terms = session ? roundTerms(session, round) : [];
  const nameOf = (row: OutcomeRow) => findTerm(row.termId)?.name ?? row.termId;

  const good = (rows ?? []).filter((r) => r.outcome === 'correct-without-help');
  const partial = (rows ?? []).filter((r) => r.outcome === 'needed-a-hint');
  const practice = (rows ?? []).filter((r) => r.outcome === 'needs-practice');
  const missed = [...practice, ...partial];
  const total = rows?.length ?? 0;
  const hasMisses = missed.length > 0;

  /* The gap per term is the time since it was last revised: the seed's
     timestamp, or the tester's own section row if that is later. `?fresh`
     shows the all-same-day state, which ten seeded terms cannot reach by
     tapping; the mixed state is what a section round done today produces. */
  const [now] = useState(() => Date.now());
  const sectionRows = session ? rowsForRound(session, 'section') : [];
  const lastRevised = (termId: string): number => {
    const seeded = Date.parse(terms.find((t) => t.id === termId)?.lastSeenAt ?? '') || 0;
    const own = sectionRows.find((r) => r.termId === termId);
    const ownAt = own ? Date.parse(own.lastSeenAt) || 0 : 0;
    return Math.max(seeded, ownAt);
  };
  const isFresh = (row: OutcomeRow) => search.has('fresh') || now - lastRevised(row.termId) < DAY_MS;
  const fresh = (rows ?? []).filter(isFresh);
  const settled = (rows ?? []).filter((r) => !isFresh(r));
  const settledGood = settled.filter((r) => r.outcome === 'correct-without-help');
  const gapDays = settled.length
    ? Math.floor((now - Math.max(...settled.map((r) => lastRevised(r.termId)))) / DAY_MS)
    : 0;
  const gapText = gapDays === 1 ? '1 day' : `${gapDays} days`;

  let caption: string;
  if (settled.length === 0) {
    caption = `You got ${good.length} of ${total} correct without help, but you revised these today, so they’re still fresh. Come back tomorrow to see what stuck.`;
  } else if (fresh.length === 0) {
    caption = `You got ${good.length} of ${total} correct without help, ${gapText} after you last revised.`;
  } else {
    caption = `You got ${settledGood.length} of ${settled.length} correct without help, ${gapText} after you last revised. ${joinNames(fresh.map(nameOf))} ${fresh.length === 1 ? 'is' : 'are'} still fresh from today, so come back tomorrow for ${fresh.length === 1 ? 'that one' : 'those'}.`;
  }

  /* Confidence: before-plan is a constant; today comes from the confidence
     check. Until that screen writes it, the frame's value stands in. */
  const todayRating = session?.preReviewRating ?? 4;
  const beforeLabel = confidenceLabels[beforePlanRating - 1];
  const todayLabel = confidenceLabels[todayRating - 1];
  const confidenceDir = direction(todayRating - beforePlanRating, 0);

  const rate = (list: OutcomeRow[]) =>
    list.length ? list.filter((r) => r.outcome === 'correct-without-help').length / list.length : 0;
  const sectionRate = session ? rate(rowsForRound(session, 'section')) : 0;
  const reviewRate = rate(rows ?? []);
  const performanceDir = direction(reviewRate - sectionRate, SAME_THRESHOLD);
  /* Same-day: answers from a fresh revision can't confirm or contradict the
     feeling, so only the confidence half is said and the rest waits. */
  const verdict =
    settled.length === 0
      ? {
          headline: comparison[confidenceDir].same.headline,
          body: 'Today’s answers are still fresh, so they can’t tell you yet whether that feeling is right. Tomorrow’s will.',
          celebrate: false,
        }
      : comparison[confidenceDir][performanceDir];

  const firstPractice = practice[0] ? nameOf(practice[0]) : partial[0] ? nameOf(partial[0]) : null;
  const note = firstPractice
    ? `Knowie will remind you to review this material the day before your test. You’ll see new questions, ${firstPractice} first.`
    : 'Knowie will remind you to review this material the day before your test. You’ll see every term again, asked a new way.';

  const onContinue = () => {
    // The review node is done whatever the outcome, and the plan moves on to
    // the day before the test.
    updateSession((s) => ({
      ...s,
      doneSections: Array.from(new Set([...s.doneSections, 'see-what-stuck'])),
    }));
    advanceDay('eve');
    router.push('/plan');
  };

  const onPractice = () => {
    // Practice only: the turn writes no rows. Opens the first missed term.
    // In round order, not by outcome group; typing sticks within a session.
    const missedIds = new Set(missed.map((r) => r.termId));
    const termIds = terms.filter((t) => missedIds.has(t.id)).map((t) => t.id);
    const first = terms.findIndex((t) => t.id === termIds[0]);
    const typed = session?.inputMode === 'typed' ? '/typed' : '';
    updateSession((s) => ({ ...s, practice: { round, termIds }, resume: null }));
    router.push(`/recall/${round}/${first + 1}${typed}`);
  };

  return (
    <Scaffold
      showTopNavSlot={false}
      middleContent={
        rows && !empty && (
          <div className={styles.content}>
            <section className={styles.group}>
              <TextBlock as="h1" headline="How it went" caption={caption} showCaption />
              <div className={styles.cards}>
                {good.length > 0 && <Card tone="Good" names={good.map(nameOf)} open={false} />}
                {partial.length > 0 && <Card tone="Partial" names={partial.map(nameOf)} open />}
                {practice.length > 0 && <Card tone="NeedsPractice" names={practice.map(nameOf)} open />}
              </div>
            </section>

            <section className={styles.group}>
              <TextBlock as="h2" headline="How you felt" />
              <div className={styles.confidence}>
                <ConfidenceReads before={beforeLabel} today={todayLabel} />
                {verdict.celebrate && (
                  <div className={styles.mascot}>
                    <MascotSlot size="XL" name="excited" />
                  </div>
                )}
                <TextBlock size="S" as="h3" headline={verdict.headline} showCaption caption={verdict.body} />
              </div>
            </section>

            <NoteCard tone="highlight" icon="calendar">
              {note}
            </NoteCard>
          </div>
        )
      }
      bottomContent={
        <div className={shared.actions}>
          <Button fullWidth variant="Primary" size="L" onClick={onContinue}>
            Continue
          </Button>
          {hasMisses && (
            <Button fullWidth variant="Secondary" size="L" onClick={onPractice}>
              Try the ones you missed
            </Button>
          )}
        </div>
      }
    />
  );
}
