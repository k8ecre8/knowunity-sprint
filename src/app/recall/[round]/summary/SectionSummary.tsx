'use client';

/* Section summary — SPEC.md → Screens → 1. Section summary.
   Figma: "Section summary / Mixed" in Exam Section 1 - Claude (Core Flow).
   Every number on this screen is a count of outcome rows and nothing else. */

import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { SummaryCard } from '@/components/SummaryCard';
import { TextBlock } from '@/components/TextBlock';
import { Button } from '@/components/Button';
import { NoteCard } from '@/components/NoteCard';
import { findTerm } from '@/mock/terms';
import { advanceDay, roundTerms, rowsForRound, updateSession, useSession, type OutcomeRow } from '@/mock/session';
import styles from './page.module.css';

const round = 'section';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function SectionSummary() {
  const router = useRouter();
  const session = useSession();

  // null until the browser has the session, so server and client markup match.
  const rows = session ? rowsForRound(session, round) : null;
  const terms = session ? roundTerms(session, round) : [];
  const nameOf = (row: OutcomeRow) => findTerm(row.termId)?.name ?? row.termId;

  const good = (rows ?? []).filter((r) => r.outcome === 'correct-without-help');
  const partial = (rows ?? []).filter((r) => r.outcome === 'needed-a-hint');
  const practice = (rows ?? []).filter((r) => r.outcome === 'needs-practice');
  // A miss is anything that was not correct without help: those return in the review.
  const missed = [...partial, ...practice];
  const hasMisses = missed.length > 0;

  const onContinue = () => {
    // The plan node is done whatever the outcome; completion is not mastery.
    updateSession((s) => ({
      ...s,
      doneSections: Array.from(new Set([...s.doneSections, 'plate-tectonics'])),
      practice: null,
    }));
    // Three days pass: the plan opens on review day.
    advanceDay('review');
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

  const cards = [
    { tone: 'Good' as const, rows: good },
    { tone: 'Partial' as const, rows: partial },
    { tone: 'NeedsPractice' as const, rows: practice },
  ].filter((c) => c.rows.length > 0);

  return (
    <Scaffold
      showTopNavSlot={false}
      middleContent={
        rows && (
          <div className={styles.content}>
            {/* The frame hides the "1 of 3 without help" subhead on this screen;
                the cards carry the count. */}
            <TextBlock headline="Here’s how it went" showCaption={false} />

            <div className={styles.cards}>
              {cards.map(({ tone, rows: group }) => (
                <SummaryCard
                  key={tone}
                  tone={tone}
                  showRow1={group.length >= 1}
                  showRow2={group.length >= 2}
                  showRow3={group.length >= 3}
                  term1={group[0] ? nameOf(group[0]) : undefined}
                  term2={group[1] ? nameOf(group[1]) : undefined}
                  term3={group[2] ? nameOf(group[2]) : undefined}
                />
              ))}
            </div>

            {/* {partial.length > 0 && (
              <NoteCard tone="outlined" icon="clipboard-check">
                {`${joinNames(partial.map(nameOf))}: you got there, but it took some digging. Worth one more look before the test.`}
              </NoteCard>
            )} */}

            <NoteCard tone="outlined" icon="refresh-cw-01">
              {hasMisses
                ? `${joinNames(missed.map(nameOf))} will be in the review before your test.`
                : `You'll see all ${rows.length} again in the review before your test.`}
            </NoteCard>
          </div>
        )
      }
      bottomContent={
        <div className={styles.actions}>
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
