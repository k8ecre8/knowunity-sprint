'use client';

/* Typed turn — SPEC.md → Screens → 6. Typed turn.
   Figma: "Typed input (alt route)" in Exam Section 1 - Claude (Core Flow)
   draws the idle state only. Verdict, hint and answer states follow the
   voice turn's frames ("Verdict / Correct", "Hint 1", "Hint 2", "Answer
   shown") with the recording control replaced by the chat input; thinking,
   slow, error and the leave confirm have no frame. The leave confirm is the
   `BottomSheet` component, promoted from here when the voice turn needed it.

   Same ladder, script and outcomes as the voice turn, with no recording or
   transcript states. Recall is mocked: sending walks the term's script on a
   real delay, and nothing reads the text. Knowie replies in text only. */

import { use, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { AppBar } from '@/components/AppBar';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { MascotSlot, type MascotName } from '@/components/MascotSlot';
import { ResponseBubble } from '@/components/ResponseBubble';
import { ChatInput } from '@/components/ChatInput';
import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/BottomSheet';
import { termsForRound, plateTectonics, type Round, type ScriptStep, type Term } from '@/mock/terms';
import { practiceFor, recordOutcome, roundTerms, updateSession, useSession, type Outcome } from '@/mock/session';
import styles from './page.module.css';

const rounds: Round[] = ['section', 'review', 'eve'];

function isRound(value: string): value is Round {
  return (rounds as string[]).includes(value);
}

/* --- timing (SPEC.md → How the mocked recall behaves, Open 22 decided here) --
   Judging stays under 4s unless a step overrides it: a slow step resolves
   between 4s and 10s, an error step never resolves and passes 10s. */
const JUDGE_MS = 2500;
const JUDGE_SLOW_MS = 6500;
const SLOW_BEAT_MS = 4000;
const ERROR_MS = 10000;

/** 0 = prompt, 1 = hint 1, 2 = hint 2, 3 = answer shown. */
type Rung = 0 | 1 | 2 | 3;

type Phase = 'idle' | 'thinking' | 'thinking-slow' | 'error' | 'verdict';

type Chip = 'Correct' | 'Partial' | 'Incorrect' | null;

/* Copy for the states no frame draws (Open 19, decided here). The helper
   line under Knowie carries the state, so reduced motion loses nothing.
   Idle at the prompt has no helper: SPEC's typed idle is the prompt alone. */
const helper = {
  hint1: 'Give it another try',
  hint2: 'Last try, two hints',
  thinking: 'Thinking…',
  slow: 'Still thinking, nearly there',
  error: 'That took too long. Nothing was lost.',
} as const;

const attemptLine: Record<Rung, string | null> = {
  0: null,
  1: 'Second try, one hint',
  2: 'Last try, two hints',
  3: null,
};

function outcomeFor(rung: Rung): Outcome {
  if (rung === 0) return 'correct-without-help';
  if (rung === 1) return 'needed-a-hint';
  return 'needs-practice';
}

/* While the keyboard is up, the scaffold is pinned to the visual viewport:
   the part of the screen the keyboard leaves. iOS otherwise keeps the page at
   full height and scrolls it to show the input, which takes the question off
   the top. These are device measurements, like 100dvh, not design values. */
function useVisualViewport(active: boolean) {
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const root = document.documentElement.style;
    const sync = () => {
      root.setProperty('--visual-viewport-top', `${viewport.offsetTop}px`);
      root.setProperty('--visual-viewport-height', `${viewport.height}px`);
    };
    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      root.removeProperty('--visual-viewport-top');
      root.removeProperty('--visual-viewport-height');
    };
  }, [active]);
}

function TypedTurn({ round, term }: { round: Round; term: number }) {
  const session = useSession();
  // Null on the server and the first client render; the turn mounts with
  // its resume state read once, so nothing is set from an effect.
  if (!session) return <Scaffold />;
  const resume = session.resume;
  const startRung =
    resume && resume.round === round && resume.term === term
      ? (Math.min(3, Math.max(0, resume.rung)) as Rung)
      : 0;
  return (
    <Turn
      round={round}
      term={term}
      terms={roundTerms(session, round)}
      practice={practiceFor(session, round)}
      startRung={startRung}
      micPermission={session.micPermission}
    />
  );
}

function Turn({
  round,
  term,
  terms,
  practice,
  startRung,
  micPermission,
}: {
  round: Round;
  term: number;
  /** The round in the order it is asked; see roundTerms. */
  terms: Term[];
  /** The missed terms, on a practice pass. A practice pass writes no rows. */
  practice: string[] | null;
  startRung: Rung;
  micPermission: 'unasked' | 'granted' | 'denied';
}) {
  const router = useRouter();
  const current = terms[term - 1];

  const [rung, setRung] = useState<Rung>(startRung);
  const [phase, setPhase] = useState<Phase>('idle');
  const [chip, setChip] = useState<Chip>(null);
  const [text, setText] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  // The chat input has focus, so the keyboard is up.
  const [typing, setTyping] = useState(false);
  useVisualViewport(typing);
  /* The script pointer. Advances only when a verdict is shown; a cancelled
     wait or a retry re-runs the same step. On resume, the steps judged so
     far equal the hints used. */
  const pointer = useRef(Math.min(startRung, current.script.length));
  const timers = useRef<number[]>([]);
  /* The leave sheet pauses a wait: its timers stop when the sheet opens, and
     the step in flight runs again at normal speed on Stay. */
  const inFlight = useRef<ScriptStep | null>(null);
  const paused = useRef<Phase | null>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Typing sticks for the rest of the session.
  useEffect(() => {
    updateSession((s) => (s.inputMode === 'typed' ? s : { ...s, inputMode: 'typed' }));
  }, []);

  useEffect(() => clearTimers, []);

  /* --- the mocked judge -------------------------------------------------- */

  /** The next judged step. Unclear takes cannot happen typed, so they are skipped. */
  const nextStep = (): ScriptStep | undefined => {
    while (current.script[pointer.current]?.kind === 'unclear') pointer.current += 1;
    // A script that ran out keeps missing, so the ladder still ends.
    return current.script[pointer.current] ?? { kind: 'miss', transcript: '' };
  };

  const finish = (outcome: Outcome) => {
    if (practice) return;
    recordOutcome({
      termId: current.id,
      round,
      outcome,
      mode: 'typed',
      lastSeenAt: new Date().toISOString(),
    });
  };

  const resolve = (step: ScriptStep) => {
    pointer.current += 1;
    if (step.kind === 'correct') {
      setChip('Correct');
      setPhase('verdict');
      finish(outcomeFor(rung));
      return;
    }
    // partial, miss or a clarifying question: the next rung, no judging retry.
    setChip(step.kind === 'partial' ? 'Partial' : step.kind === 'miss' ? 'Incorrect' : null);
    setPhase('idle');
    if (rung >= 2) {
      setRung(3);
      finish('needs-practice');
    } else {
      setRung((rung + 1) as Rung);
    }
  };

  const judge = (step: ScriptStep, atNormalSpeed = false) => {
    clearTimers();
    inFlight.current = step;
    setPhase('thinking');
    const delay = atNormalSpeed ? 'none' : (step.delay ?? 'none');
    timers.current.push(window.setTimeout(() => setPhase('thinking-slow'), SLOW_BEAT_MS));
    if (delay === 'error') {
      timers.current.push(window.setTimeout(() => setPhase('error'), ERROR_MS));
      return;
    }
    const wait = delay === 'slow' ? JUDGE_SLOW_MS : JUDGE_MS;
    timers.current.push(
      window.setTimeout(() => {
        clearTimers();
        resolve(step);
      }, wait),
    );
  };

  const send = (value: string) => {
    if (value.trim().length === 0 || phase !== 'idle') return;
    const step = nextStep();
    if (!step) return;
    setText('');
    judge(step);
  };

  const retry = () => {
    const step = nextStep();
    if (step) judge(step, true);
  };

  /* --- actions ----------------------------------------------------------- */

  const useVoice = () => {
    clearTimers();
    // The voice turn, or mic denied then back here, resumes at this hint step.
    updateSession((s) => ({ ...s, resume: { round, term, rung } }));
    if (micPermission === 'denied') {
      router.push(`/recall/${round}/mic-denied?from=typed&term=${term}`);
      return;
    }
    updateSession((s) => ({ ...s, inputMode: 'voice' }));
    router.push(`/recall/${round}/${term}`);
  };

  const nextQuestion = () => {
    updateSession((s) => ({ ...s, resume: s.resume?.round === round ? null : s.resume }));
    // A practice pass walks only the missed terms, then back to the summary.
    const next = practice
      ? terms.findIndex((t) => t.id === practice[practice.indexOf(current.id) + 1]) + 1
      : term < terms.length
        ? term + 1
        : 0;
    if (next > 0) {
      router.push(`/recall/${round}/${next}/typed`);
      return;
    }
    updateSession((s) => ({ ...s, practice: null }));
    router.push(`/recall/${round}/summary`);
  };

  const openSheet = () => {
    if (phase === 'thinking' || phase === 'thinking-slow') {
      clearTimers();
      paused.current = phase;
    }
    setSheetOpen(true);
  };

  const stay = () => {
    setSheetOpen(false);
    const was = paused.current;
    paused.current = null;
    if (was && inFlight.current) judge(inFlight.current, true);
  };

  const leave = () => {
    clearTimers();
    updateSession((s) => ({ ...s, resume: { round, term, rung } }));
    router.push('/plan');
  };

  /* --- what Knowie says -------------------------------------------------- */

  const progress = practice ? practice.indexOf(current.id) : term - 1;
  const prompt = round === 'eve' ? current.promptB : current.prompt;
  const intro =
    round === 'section'
      ? `Let’s see what you remember from ${plateTectonics.name}. In your own words:`
      : 'Let’s see what stuck. In your own words:';

  let bubble: { body: string; body2?: string; showVerdict: boolean; verdictTone?: Exclude<Chip, null> };
  if (phase === 'verdict') {
    bubble = {
      showVerdict: true,
      verdictTone: 'Correct',
      body: 'That’s the whole idea, in the right order.',
      body2: current.answer,
    };
  } else if (rung === 3) {
    // No chip: the Incorrect chip reads "Try again", and at answer shown there is no next try.
    bubble = { showVerdict: false, body: 'Here is a complete answer:', body2: current.answer };
  } else if (rung === 0) {
    bubble = { showVerdict: false, body: intro, body2: prompt };
  } else {
    bubble = {
      showVerdict: chip !== null,
      verdictTone: chip ?? undefined,
      body: current.hints[(rung - 1) as 0 | 1],
    };
  }

  const helperText =
    phase === 'thinking'
      ? helper.thinking
      : phase === 'thinking-slow'
        ? helper.slow
        : phase === 'error'
          ? helper.error
          : rung === 1
            ? helper.hint1
            : rung === 2
              ? helper.hint2
              : null;

  const mascot: MascotName =
    phase === 'verdict'
      ? 'approving'
      : phase === 'error'
        ? 'confused'
        : phase === 'thinking' || phase === 'thinking-slow'
          ? 'thinking'
          : 'standby';

  const answering = phase !== 'verdict' && rung !== 3;
  const waiting = phase === 'thinking' || phase === 'thinking-slow';

  return (
    <Scaffold
      className={[styles.turn, typing && styles.typing].filter(Boolean).join(' ')}
      showBottomSheetBackground={sheetOpen}
      topNavigation={
        <AppBar
          variant="leftAndRightIconButton"
          leftIcon="x-close"
          leftLabel="Leave this round"
          onLeftPress={openSheet}
          rightIcon="zap"
          rightLabel="Streak"
          slot={<ProgressIndicator thickness="16" current={progress} total={practice?.length ?? terms.length} />}
        />
      }
      middleContent={
        (
          <div className={styles.content} inert={sheetOpen}>
            <div className={styles.knowiePrompt}>
              {/* Knowie steps down to XL while typing, as the frame draws the
                  keyboard state, so the question fits above the keyboard. */}
              <MascotSlot size={typing ? 'XL' : '2XL'} name={mascot} />
              <ResponseBubble
                showVerdict={bubble.showVerdict}
                verdictTone={bubble.verdictTone}
                showAction={false}
                body={bubble.body}
                body2={bubble.body2}
              />
            </div>
            {attemptLine[rung] && phase !== 'verdict' && (
              <p className={styles.attemptLine}>{attemptLine[rung]}</p>
            )}
            {answering && (
              /* stage: the input sits directly under the bubble, as the frame
                 draws it, so with the keyboard up the question, the input and
                 the voice link all stay above it and nothing is pushed off. */
              <div
                className={styles.stage}
                onFocus={(e) => setTyping(e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setTyping(false);
                }}
              >
                {phase !== 'error' && (
                  <>
                    <ChatInput
                      value={text}
                      onValueChange={setText}
                      onSend={send}
                      onMicPress={useVoice}
                      Status={waiting ? 'Loading' : undefined}
                    />
                    {/* Shown while typing too: once there is text the input's own
                        mic gives way to Send, so this is the only way to voice. */}
                    <div className={styles.voiceRow}>
                      <Button variant="Text" size="M" onClick={useVoice} state={waiting ? 'Disabled' : 'Default'}>
                        Use my voice instead
                      </Button>
                    </div>
                  </>
                )}
                {/* The attempt line above already says the hint step, so the
                    helper stays empty rather than repeat it. */}
                <p className={styles.helper} data-phase={phase} aria-live="polite">
                  {helperText !== attemptLine[rung] ? helperText : null}
                </p>
              </div>
            )}
          </div>
        )
      }
      bottomContent={
        phase === 'error' ? (
          /* The error takes the input's place, so nothing can be typed that
             Send would ignore; Retry is the one action, in reach. */
          <div className={styles.actions} inert={sheetOpen}>
            <Button fullWidth variant="Primary" size="L" onClick={retry}>
              Retry
            </Button>
          </div>
        ) : !answering ? (
          <div className={styles.actions} inert={sheetOpen}>
            <Button fullWidth variant="Primary" size="L" onClick={nextQuestion}>
              Next question
            </Button>
          </div>
        ) : undefined
      }
      bottomSheetOnly={
        sheetOpen && (
          /* Copy is Open 18, decided here: Stay is the safe primary, Leave
             the quiet escape. */
          <BottomSheet
            headline="Leave this round?"
            showCaption
            caption="You’ll pick up this question at the same step when you come back."
          >
            <Button variant="Primary" size="L" onClick={stay}>
              Stay
            </Button>
            <Button variant="Text" size="L" onClick={leave}>
              Leave
            </Button>
          </BottomSheet>
        )
      }
    />
  );
}

export default function TypedTurnPage({ params }: { params: Promise<{ round: string; term: string }> }) {
  const { round, term } = use(params);
  if (!isRound(round)) notFound();
  const index = Number(term);
  if (!Number.isInteger(index) || index < 1 || index > termsForRound(round).length) notFound();
  return <TypedTurn key={`${round}-${index}`} round={round} term={index} />;
}
