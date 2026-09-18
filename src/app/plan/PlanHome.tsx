'use client';

/* Exam plan home — SPEC.md → Screens → 9. Exam plan home.
   Figma, Exam Section 1 - Claude (Core Flow): "Exam plan home / Day 1" and
   "Exam plan home / Plan done, test tomorrow". There is no frame for the
   section-done or review-day states; both are the Day 1 frame with the node
   states moved along.

   Four states, from the simulated day in the session (`session.day`, moved
   on by the summaries, or seeded by `?day=`):
   - Day 1: the Plate tectonics voice node is `next`.
   - Section done: that node is `done` (the section summary marks it).
   - Review day: every section node is done and "See what stuck" is `next`,
     or `done` once the review summary has marked it.
   - Plan complete, test tomorrow (eve): the path collapses into the
     "Plan complete" card and the warm-up reminder.

   The section intro tray renders this same screen behind its sheet, so it
   takes the sheet slots as props. */

import { type ReactNode, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { PlanNode, type PlanNodeState } from '@/components/PlanNode';
import { MascotSlot } from '@/components/MascotSlot';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/Button';
import { IconSlot, type IconName } from '@/components/IconSlot';
import { BottomNav } from '@/components/BottomNav';
import { plateTectonics } from '@/mock/terms';
import { currentTerm, daysToExam, updateSession, useSession, type Day, type Session } from '@/mock/session';
import styles from './PlanHome.module.css';

type Glyph = { icon: IconName };
const glyphs = {
  globe: { icon: 'globe-01' },
  target: { icon: 'target-04' },
  book: { icon: 'book-open-02' },
  clipboard: { icon: 'clipboard-check' },
  calendar: { icon: 'calendar' },
} satisfies Record<string, Glyph>;

function GlyphSlot({ glyph, size }: { glyph: Glyph; size: '250' | '300' | '400' }) {
  return (
    <span className={styles.glyph}>
      <IconSlot size={size} name={glyph.icon} />
    </span>
  );
}

/* --- the path -------------------------------------------------------------- */

type Step = {
  id: string;
  title: string;
  /** Question count and duration. Shown only while the step is `next`. */
  caption?: string;
  state: PlanNodeState;
  glyph: Glyph;
  /** Where the node goes. Left out, the node is inert. */
  onPress?: () => void;
};

type Path = { section?: string; phase?: string; steps: Step[] };

const SECTION_ID = plateTectonics.id;
const REVIEW_ID = 'see-what-stuck';

function buildPaths(day: Day,session: Session, go: (href: string) => void): Path[] {
  const sectionDone = day === 'review' || session.doneSections.includes(SECTION_ID);
  const reviewDone = day === 'review' && session.doneSections.includes(REVIEW_ID);
  // Review day seeds every section node as done.
  const seeded: PlanNodeState = day === 'review' ? 'done' : 'todo';
  const afterVoice: PlanNodeState = day === 'review' ? 'done' : sectionDone ? 'next' : 'todo';

  return [
    {
      section: 'Plate tectonics',
      steps: [
        { id: 'pt-1', title: 'Plate tectonics 1', caption: '3 questions, ~5 mins', state: 'done', glyph: { icon: 'star-01' } },
        {
          id: 'pt-voice',
          title: 'Explain it out loud',
          caption: `${plateTectonics.terms.length} questions, ~5 mins`,
          state: sectionDone ? 'done' : 'next',
          glyph: { icon: 'microphone-01' },
          onPress: () => go(`/plan/${SECTION_ID}/intro`),
        },
        { id: 'pt-2', title: 'Plate tectonics 2', caption: '3 questions, ~5 mins', state: afterVoice, glyph: { icon: 'file-question-02' } },
        { id: 'pt-3', title: 'Plate tectonics 3', caption: '3 questions, ~5 mins', state: seeded, glyph: { icon: 'file-question-02' } },
      ],
    },
    {
      section: 'Earthquakes and volcanoes',
      steps: [
        { id: 'eq-1', title: 'Earthquakes 1', caption: '3 questions, ~5 mins', state: seeded, glyph: { icon: 'file-question-02' } },
        { id: 'vo-1', title: 'Volcanoes 1', caption: '3 questions, ~5 mins', state: seeded, glyph: { icon: 'file-question-02' } },
      ],
    },
    {
      phase: 'Comprehensive review',
      steps: [
        {
          id: REVIEW_ID,
          title: 'Cumulative Review',
          caption: '10 questions, ~10 min',
          state: day === 'review' ? (reviewDone ? 'done' : 'next') : 'todo',
          glyph: { icon: 'refresh-cw-01' },
          onPress: day === 'review' ? () => go('/recall/review/confidence') : undefined,
        },
        { id: 'practice-test', title: 'Practice test', caption: '12 questions, ~12 min', state: reviewDone ? 'next' : 'todo', glyph: glyphs.clipboard },
      ],
    },
  ];
}

function StepRow({ step, index }: { step: Step; index: number }) {
  const inner = (
    <>
      <PlanNode state={step.state} tone="blue" size="M" name={step.glyph.icon} />
      <span className={styles.stepText}>
        <span className={styles.stepTitle}>{step.title}</span>
        {step.state === 'next' && step.caption && <span className={styles.stepCaption}>{step.caption}</span>}
      </span>
    </>
  );
  const className = [styles.step, index % 2 === 0 ? styles.stepOut : styles.stepIn].join(' ');
  if (step.onPress) {
    return (
      <li className={styles.stepItem}>
        <button
          type="button"
          className={className}
          data-state={step.state}
          onClick={step.onPress}
        >
          {inner}
        </button>
      </li>
    );
  }
  return (
    <li className={styles.stepItem}>
      <div className={className} data-state={step.state}>
        {inner}
      </div>
    </li>
  );
}

/* --- the screen ---------------------------------------------------------- */

export type PlanHomeProps = {
  /** A seeded day for the first render, before the session has it. Left out, the session's day. */
  day?: Day;
  /** A sheet over the plan: the scaffold's slots behind it go inert. */
  bottomSheetOnly?: ReactNode;
  showBottomSheetBackground?: boolean;
};

export function PlanHome({ day: seeded, bottomSheetOnly, showBottomSheetBackground = false }: PlanHomeProps) {
  const router = useRouter();
  const session = useSession();
  const day = seeded ?? session?.day ?? 'day1';
  const titleId = useId();
  const behindSheet = Boolean(bottomSheetOnly);

  const warmUp = () => {
    if (!session) return;
    // A new round starts on voice; a round left mid-way resumes as it was.
    const term = currentTerm(session, 'eve');
    if (session.resume?.round !== 'eve') {
      updateSession((s) => ({ ...s, inputMode: 'voice', practice: null }));
    }
    router.push(`/recall/eve/${term}`);
  };

  const daysLeft = day === 'eve' ? 'Test tomorrow' : `${daysToExam[day]} days`;

  /* topBar: the plan-home bar is a kebab on the right and nothing else. The
     menu is app chrome outside this flow, so it is decoration here. */
  const topBar = (
    <div className={styles.topBar} inert={behindSheet}>
      <span className={styles.kebab} aria-hidden="true">
        <IconSlot size="300" name="dots-vertical" />
      </span>
    </div>
  );

  /* bottomNav: `plans` active, Chat goes to the app home. Inert behind a sheet. */
  const bottomNav = (
    <div inert={behindSheet}>
      <BottomNav active="plans" hrefs={{ chat: '/', plans: '/plan' }} />
    </div>
  );

  const middle = session && (
    <div className={styles.content} inert={behindSheet}>
      {/* planIdentity: subject icon, title with its switcher chevron, meta. */}
      <div className={styles.identity}>
        <span className={styles.subjectIcon}>
          <GlyphSlot glyph={glyphs.globe} size="400" />
        </span>
        <h1 className={styles.title} id={titleId}>
          <span>Earth and Space Science Exam</span>
          <span className={styles.titleChevron} aria-hidden="true">
            <IconSlot size="300" name="chevron-down" />
          </span>
        </h1>
        <ul className={styles.meta} aria-label="Plan details">
          <li className={styles.metaItem}>
            <GlyphSlot glyph={glyphs.calendar} size="250" />
            <span>{daysLeft}</span>
          </li>
          <li className={styles.metaItem}>
            <GlyphSlot glyph={glyphs.target} size="250" />
            <span>Grade goal: A</span>
          </li>
        </ul>
      </div>

      {/* tabs: Plan is the only tab that exists here, so the bar is inert. */}
      <div className={styles.tabs} role="tablist" aria-label="Plan views">
        <span className={styles.tab} role="tab" aria-selected="true" data-active>
          Plan
        </span>
        <span className={styles.tab} role="tab" aria-selected="false" aria-disabled="true">
          Materials
        </span>
      </div>

      {day === 'eve' ? (
        <div className={[styles.planBody, styles.planBodyComplete].join(' ')}>
          <NoteCard tone="outlined" badge="blue" showTitle title="Plan complete" showChevron>
            9 steps over 4 days
          </NoteCard>
          {/* testDayPanel: the space the path left becomes the reminder. */}
          <div className={styles.testDayPanel}>
            <MascotSlot size="2XL" name="standby" />
            <h2 className={styles.panelHeadline}>Your test is tomorrow</h2>
            <p className={styles.panelBody}>Let’s review the material and make sure it’s still fresh.</p>
            <div className={styles.panelCta}>
              <Button variant="Primary" size="L" onClick={warmUp}>
                Warm up now
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.planBody}>
          {buildPaths(day, session, (href) => router.push(href)).map((path) => (
            <section key={path.section ?? path.phase} className={styles.path} aria-label={path.section ?? path.phase}>
              {path.section && (
                <div className={styles.sectionRow}>
                  <span className={styles.sectionName}>{path.section}</span>
                  <span className={styles.sectionBook} aria-hidden="true">
                    <GlyphSlot glyph={glyphs.book} size="300" />
                  </span>
                </div>
              )}
              {path.phase && (
                <div className={styles.phaseDivider}>
                  <span className={styles.phaseLine} />
                  <span className={styles.phaseLabel}>{path.phase}</span>
                  <span className={styles.phaseLine} />
                </div>
              )}
              <ol className={styles.steps}>
                {path.steps.map((step, i) => (
                  <StepRow key={step.id} step={step} index={i} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Scaffold
      topNavigation={topBar}
      middleContent={middle}
      bottomContent={bottomNav}
      bottomSheetOnly={bottomSheetOnly}
      showBottomSheetBackground={showBottomSheetBackground}
    />
  );
}
