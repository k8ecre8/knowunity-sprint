'use client';

/* App home — SPEC.md → Screens → 10. App home. The prototype opens here.
   Figma, Exam Section 1 - Claude (Core Flow): "App home / Default (study
   reminder)" and "App home / Reminder state".

   Two states, from the simulated day in the session (seeded by `?day=eve`):
   - Default (Day 1 and review day): the hero is the study reminder
     ("…exam is in N days") and "Continue studying" goes into the plan.
   - Exam-eve reminder: "Your test is tomorrow", and "Warm up now" is a
     shortcut straight into the repeat, not the plan.

   The tab bar's Plans tab goes to the plan. Everything else on the page (top
   bar, counters, Dream College, quick actions, Ask Knowie, the other tabs) is
   the existing app as built, and inert. */

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { MascotSlot } from '@/components/MascotSlot';
import { Button } from '@/components/Button';
import { TextBlock } from '@/components/TextBlock';
import { TestDayPanel } from '@/components/TestDayPanel';
import { TopBar } from '@/components/TopBar';
import { ListItem } from '@/components/ListItem';
import { Chips } from '@/components/Chips';
import { IconSlot, type IconName } from '@/components/IconSlot';
import { BottomNav } from '@/components/BottomNav';
import { currentTerm, daysToExam, enterRound, updateSession, useSession, type Day } from '@/mock/session';
import { useEntryLink } from '@/mock/useEntryLink';
import styles from './page.module.css';

/* `ai-quiz` is not in IconSlot. Its placeholder is marked so it can be
   swapped when the glyph is added. */
type Glyph = { icon: IconName; placeholderFor?: string };
const glyphs = {
  college: { icon: 'graduation-hat-02' },
  quiz: { icon: 'file-question-02', placeholderFor: 'ai-quiz' },
  practiceTest: { icon: 'clipboard-check' },
  upload: { icon: 'upload-cloud-02' },
  plus: { icon: 'plus' },
  mic: { icon: 'microphone-01' },
} satisfies Record<string, Glyph>;

const quickActions: readonly { id: string; label: string; glyph: Glyph }[] = [
  { id: 'quiz', label: 'Quiz', glyph: glyphs.quiz },
  { id: 'practice-test', label: 'Practice test', glyph: glyphs.practiceTest },
  { id: 'upload', label: 'Upload', glyph: glyphs.upload },
];

function AppHome({ seeded }: { seeded: Day | null }) {
  const router = useRouter();
  const session = useSession();
  const day = seeded ?? session?.day ?? 'day1';

  const warmUp = () => {
    if (!session) return;
    // A new round starts on voice; a round left mid-way resumes as it was.
    const term = currentTerm(session, 'eve');
    enterRound('eve');
    if (session.resume?.round !== 'eve') {
      updateSession((s) => ({ ...s, inputMode: 'voice' }));
    }
    router.push(`/recall/eve/${term}`);
  };

  /* topBar, home: menu, the three counters and the focus timer. Decoration. */
  const topBar = <TopBar variant="home" xp={48} streak={1} />;

  const hero =
    day === 'eve' ? (
      /* reminderHero: Knowie, one line, one action. */
      <section className={[styles.hero, styles.heroEve].join(' ')} aria-label="Test reminder">
        <TestDayPanel
          size="M"
          as="h1"
          headline="Your test is tomorrow"
          body="Let’s review the material and make sure it’s still fresh."
          cta="Warm up now"
          onAction={warmUp}
        />
      </section>
    ) : (
      /* hero: the ordinary study reminder. */
      <section className={styles.hero} aria-label="Study reminder">
        <MascotSlot size="2XL" name="standby" />
        <TextBlock size="S" headline={`Your Earth and Space Science exam is in ${daysToExam[day]} days`} />
        <div className={styles.cta}>
          <Button variant="Primary" size="M" onClick={() => router.push('/plan')}>
            Continue studying
          </Button>
        </div>
      </section>
    );

  const middle = session && (
    <div className={styles.content}>
      {hero}

      {/* marginWrap: Space/1600 above Dream College on the default frame, none on eve. */}
      <div className={day === 'eve' ? styles.collegeWrapEve : styles.collegeWrap}>
        <span className={styles.college}>
          <ListItem
            variant="Outlined Compact"
            trailing="None"
            title="Dream College"
            showSubtitle={false}
            showImage={false}
            showEmoji={false}
            leadingIcon={glyphs.college.icon}
          />
        </span>
      </div>

      {/* quickActions: three chips in a row that scrolls sideways if strings grow. */}
      <ul className={styles.quickActions} aria-label="Quick actions">
        {quickActions.map((action) => (
          <li key={action.id} className={styles.quickAction} data-placeholder-glyph={action.glyph.placeholderFor}>
            <Chips size="M" color="Primary" active="False" showRightIcon={false} leftIcon={action.glyph.icon} iconTone="info">
              {action.label}
            </Chips>
          </li>
        ))}
      </ul>

      {/* askRow: the Ask Knowie bar. AI Chat is out of scope, so it is drawn, not wired. */}
      <div className={styles.askRow} aria-hidden="true">
        <span className={styles.plus}>
          <IconSlot size="300" name={glyphs.plus.icon} />
        </span>
        <span className={styles.askKnowie}>
          <span className={styles.askPlaceholder}>Ask Knowie...</span>
          <IconSlot size="300" name={glyphs.mic.icon} />
        </span>
      </div>
    </div>
  );

  return (
    <Scaffold
      topNavigation={topBar}
      middleContent={middle}
      bottomContent={<BottomNav active="chat" hrefs={{ chat: '/', plans: '/plan' }} />}
    />
  );
}

function Home() {
  const seeded = useEntryLink('/');
  return <AppHome seeded={seeded} />;
}

export default function HomePage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
