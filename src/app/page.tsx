'use client';

/* App home — SPEC.md → Screens → 10. App home. The prototype opens here.
   Figma, Exam Section 1 - Claude (Core Flow): "App home / Default (study
   reminder)" and "App home / Reminder state".

   Two states, from the `?day` seed:
   - Default: the hero is the study reminder ("…exam is in 6 days") and
     "Continue studying" goes into the plan.
   - Exam-eve reminder (`?day=eve`): "Your test is tomorrow", and "Warm up now"
     is a shortcut straight into the repeat, not the plan.

   Everything else on the page (top bar, counters, Dream College, quick
   actions, Ask Knowie, the tab bar) is the existing app as built, and inert. */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { MascotSlot } from '@/components/MascotSlot';
import { Button } from '@/components/Button';
import { ListItem } from '@/components/ListItem';
import { Chips } from '@/components/Chips';
import { IconSlot, type IconName } from '@/components/IconSlot';
import { BottomNav } from '@/components/BottomNav';
import { currentTerm, updateSession, useSession } from '@/mock/session';
import styles from './page.module.css';

type Day = 'default' | 'eve';

/* Glyphs the frames use that IconSlot does not carry. Each placeholder is
   marked so it can be swapped when the glyph is added. */
type Glyph = { icon: IconName; placeholderFor?: string };
const glyphs = {
  menu: { icon: 'dots-vertical', placeholderFor: 'list' },
  focus: { icon: 'clock' },
  college: { icon: 'star-01', placeholderFor: 'graduation-hat-02' },
  quiz: { icon: 'file-question-02', placeholderFor: 'ai-quiz' },
  practiceTest: { icon: 'check', placeholderFor: 'clipboard-check' },
  upload: { icon: 'arrows-up', placeholderFor: 'upload-cloud-02' },
  plus: { icon: 'plus' },
  mic: { icon: 'microphone-01' },
} satisfies Record<string, Glyph>;

/* The three counters: a Body S Bold number and an `art/*` asset from
   public/images. XP, streaks and Pro are outside this flow, so the row is
   decoration. */
type Counter = { id: string; label: string; art: string; tone: string; wide?: boolean };
const counters: readonly Counter[] = [
  { id: 'pro', label: 'Get', art: '/images/pro-badge-yellow.svg', tone: styles.counterPro, wide: true },
  { id: 'xp', label: '48', art: '/images/bolt-blue-sm.svg', tone: styles.counterInfo },
  { id: 'streak', label: '1', art: '/images/flame-orange-sm.svg', tone: styles.counterCoral },
];

const quickActions = [
  { id: 'quiz', label: 'Quiz', glyph: glyphs.quiz },
  { id: 'practice-test', label: 'Practice test', glyph: glyphs.practiceTest },
  { id: 'upload', label: 'Upload', glyph: glyphs.upload },
] as const;

function AppHome({ day }: { day: Day }) {
  const router = useRouter();
  const session = useSession();

  const warmUp = () => {
    if (!session) return;
    // A new round starts on voice; a round left mid-way resumes as it was.
    const term = currentTerm(session, 'eve');
    if (session.resume?.round !== 'eve') {
      updateSession((s) => ({ ...s, inputMode: 'voice', practice: null }));
    }
    router.push(`/recall/eve/${term}`);
  };

  /* topBar: menu, the three counters, and the focus timer. All decoration. */
  const topBar = (
    <div className={styles.topBar}>
      <span className={styles.barIcon} data-placeholder-glyph={glyphs.menu.placeholderFor} aria-hidden="true">
        <IconSlot size="300" name={glyphs.menu.icon} />
      </span>
      <ul className={styles.counters} aria-label="Account">
        {counters.map((counter) => (
          <li key={counter.id} className={[styles.counter, counter.tone].join(' ')}>
            <span>{counter.label}</span>
            {/* Decorative art; the number beside it is the content. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={[styles.counterArt, counter.wide && styles.counterArtWide].filter(Boolean).join(' ')}
              src={counter.art}
              alt=""
            />
          </li>
        ))}
      </ul>
      <span className={styles.barIcon} aria-hidden="true">
        <IconSlot size="300" name={glyphs.focus.icon} />
      </span>
    </div>
  );

  const hero =
    day === 'eve' ? (
      /* reminderHero: Knowie, one line, one action. */
      <section className={[styles.hero, styles.heroEve].join(' ')} aria-labelledby="home-headline">
        <MascotSlot size="2XL" name="standby" />
        <h1 className={styles.headlineM} id="home-headline">
          Your test is tomorrow
        </h1>
        <p className={styles.body}>Let’s review the material and make sure it’s still fresh.</p>
        <div className={styles.cta}>
          <Button variant="Primary" size="L" onClick={warmUp}>
            Warm up now
          </Button>
        </div>
      </section>
    ) : (
      /* hero: the ordinary study reminder. */
      <section className={styles.hero} aria-labelledby="home-headline">
        <MascotSlot size="2XL" name="standby" />
        <h1 className={styles.headlineS} id="home-headline">
          Your Earth and Space Science exam is in 6 days
        </h1>
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
        <span className={styles.college} data-placeholder-glyph={glyphs.college.placeholderFor}>
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
            <Chips size="M" color="Primary" active="False" showRightIcon={false} leftIcon={action.glyph.icon}>
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

  return <Scaffold topNavigation={topBar} middleContent={middle} bottomContent={<BottomNav active="chat" />} />;
}

function Home() {
  const params = useSearchParams();
  return <AppHome day={params.get('day') === 'eve' ? 'eve' : 'default'} />;
}

export default function HomePage() {
  // useSearchParams needs a Suspense boundary in Next.
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
