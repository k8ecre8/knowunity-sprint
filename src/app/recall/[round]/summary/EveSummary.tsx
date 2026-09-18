'use client';

/* Exam-eve repeat summary — SPEC.md → Screens → 2. Exam-eve repeat summary.
   Figma: "Repeat summary / Test tomorrow" and "Repeat summary / Test
   tomorrow, misses" in Exam Section 1 - Claude (Core Flow).
   Two groups only, wrong and right. Wrong is the work, so Needs practice is
   always fully open; Needed a hint and Correct without help show three rows
   then "N more". Every number is a count of outcome rows. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { SummaryCard, type SummaryCardTone } from '@/components/SummaryCard';
import { TextBlock } from '@/components/TextBlock';
import { Button } from '@/components/Button';
import { findTerm } from '@/mock/terms';
import { advanceDay, roundTerms, rowsForRound, updateSession, useSession, type OutcomeRow } from '@/mock/session';
import shared from './page.module.css';
import styles from './eve.module.css';

const round = 'eve';
const ROW_LIMIT = 3;

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/* The group label with its count has no component; SPEC.md files it under
   `textBlock`, but a label with a trailing count is not a heading with a
   caption, so it is built here as `groupLabel`. See docs/component-gaps.md. */
function GroupLabel({ label, count, total }: { label: string; count: number; total: number }) {
  return (
    <div className={styles.groupLabel}>
      <h2 className={styles.groupTitle}>{label}</h2>
      <span className={styles.groupCount}>{`${count} of ${total}`}</span>
    </div>
  );
}

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

export function EveSummary() {
  const router = useRouter();
  const session = useSession();

  // null until the browser has the session, so server and client markup match.
  // The all-correct state comes from `/?day=eve&ready`, which scripts every
  // term correct; the default seeds produce the misses state.
  const rows = session ? rowsForRound(session, round) : null;
  const terms = session ? roundTerms(session, round) : [];
  const nameOf = (row: OutcomeRow) => findTerm(row.termId)?.name ?? row.termId;

  const good = (rows ?? []).filter((r) => r.outcome === 'correct-without-help');
  const partial = (rows ?? []).filter((r) => r.outcome === 'needed-a-hint');
  const practice = (rows ?? []).filter((r) => r.outcome === 'needs-practice');
  const missed = [...practice, ...partial];
  const total = rows?.length ?? 0;
  const hasMisses = missed.length > 0;

  const headline = hasMisses ? 'You’re almost ready.' : 'You’re ready!';
  const caption = !hasMisses
    ? `You got all ${total} correct without help, asked a new way, the day before your test.`
    : practice.length > 0
      ? `${joinNames(practice.map(nameOf))} ${practice.length === 1 ? 'is' : 'are'} still shaky, but you still have tonight to review ${practice.length === 1 ? 'it' : 'them'}.`
      : `${joinNames(partial.map(nameOf))} needed a hint, but you still have tonight to review ${partial.length === 1 ? 'it' : 'them'}.`;

  const onFinish = () => {
    // The plan opens in complete mode: the repeat is done whatever the outcome.
    updateSession((s) => ({
      ...s,
      doneSections: Array.from(new Set([...s.doneSections, 'exam-eve-repeat'])),
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
        rows && (
          <div className={styles.content}>
            <TextBlock headline={headline} caption={caption} showCaption />

            <div className={styles.groups}>
              {hasMisses && (
                <section className={styles.group}>
                  <GroupLabel label="Look at these before your test" count={missed.length} total={total} />
                  {practice.length > 0 && <Card tone="NeedsPractice" names={practice.map(nameOf)} open />}
                  {partial.length > 0 && <Card tone="Partial" names={partial.map(nameOf)} open={false} />}
                </section>
              )}
              {good.length > 0 && (
                <section className={styles.group}>
                  <GroupLabel label="You’ve got these" count={good.length} total={total} />
                  <Card tone="Good" names={good.map(nameOf)} open={false} />
                </section>
              )}
            </div>
          </div>
        )
      }
      bottomContent={
        <div className={shared.actions}>
          {hasMisses ? (
            <>
              <Button fullWidth variant="Primary" size="L" onClick={onPractice}>
                One more try at the misses
              </Button>
              <Button fullWidth variant="Text" size="L" onClick={onFinish}>
                Finish
              </Button>
            </>
          ) : (
            <Button fullWidth variant="Primary" size="L" onClick={onFinish}>
              Finish
            </Button>
          )}
        </div>
      }
    />
  );
}
