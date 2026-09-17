'use client';

/* Voice turn — SPEC.md → Screens → 7. Voice turn.
   Figma, Exam Section 1 - Claude (Core Flow): "Q1 idle", "Start over",
   "Recording", "Processing", "Verdict / Correct, halting", "Hint 1",
   "Hint 2", "Answer shown" and "Say it back" (recording). No frame exists
   for didn't catch that, transcribing, the transcript, the slow beat, the
   error, the say-it-back acknowledgement, the mic prompt or the leave
   confirm; those follow docs/voice-ux.md and the frames' notes.

   Recall is mocked: nothing listens. Tapping the control starts a visual
   recording state, tapping again stops it, and the term's script decides
   what the transcription says and how Knowie judges it. Knowie replies in
   text only. There is never a transcript after judging, and never an
   editable one. */

import { use, useEffect, useRef, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Scaffold } from '@/components/Scaffold';
import { AppBar } from '@/components/AppBar';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { MascotSlot, type MascotName } from '@/components/MascotSlot';
import { ResponseBubble } from '@/components/ResponseBubble';
import { IconSlot } from '@/components/IconSlot';
import { ButtonIcon } from '@/components/ButtonIcon';
import { Button } from '@/components/Button';
import { NoteCard } from '@/components/NoteCard';
import { BottomSheet } from '@/components/BottomSheet';
import { PermissionAlert } from '@/components/PermissionAlert';
import { termsForRound, plateTectonics, type Round, type ScriptStep } from '@/mock/terms';
import { recordOutcome, updateSession, useSession, type Outcome } from '@/mock/session';
import styles from './page.module.css';

const rounds: Round[] = ['section', 'review', 'eve'];

function isRound(value: string): value is Round {
  return (rounds as string[]).includes(value);
}

/* --- timing (SPEC.md → How the mocked recall behaves, Open 22 decided here) --
   Transcribing takes about 2s. Judging stays under 4s unless a step
   overrides it: a slow step resolves between 4s and 10s, an error step
   never resolves and passes 10s. Same numbers as the typed turn. */
const TRANSCRIBE_MS = 2000;
const JUDGE_MS = 2500;
const JUDGE_SLOW_MS = 6500;
const SLOW_BEAT_MS = 4000;
const ERROR_MS = 10000;

/** 0 = prompt, 1 = hint 1, 2 = hint 2, 3 = answer shown. */
type Rung = 0 | 1 | 2 | 3;

type Phase =
  | 'idle'
  | 'start-over'
  | 'unclear'
  | 'prompt'
  | 'recording'
  | 'transcribing'
  | 'transcript'
  | 'thinking'
  | 'thinking-slow'
  | 'error'
  | 'verdict'
  | 'sayback-recording'
  | 'sayback-done';

type Chip = 'Correct' | 'Partial' | 'Incorrect' | null;

/* The helper under Knowie carries the state, so reduced motion loses nothing.
   Frames give idle, start over, recording, thinking and the hints; the rest
   is Open 19, decided here. */
const helper: Record<string, { lead?: string; body: string }> = {
  idle: { lead: 'Tap to answer', body: 'Even a partial answer is a great start' },
  hint1: { body: 'Give it another try' },
  hint2: { body: 'Last try, two hints' },
  'start-over': { body: 'No harm done, go again' },
  unclear: { lead: 'Didn’t catch that', body: 'No hint used, tap to try again' },
  recording: { body: 'Listening…' },
  transcribing: { body: 'Writing that down…' },
  transcript: { body: 'Here’s what Knowie heard' },
  thinking: { body: 'Thinking…' },
  'thinking-slow': { body: 'Still thinking, nearly there' },
  error: { body: 'That took too long. Nothing was lost.' },
};

function outcomeFor(rung: Rung): Outcome {
  if (rung === 0) return 'correct-without-help';
  if (rung === 1) return 'needed-a-hint';
  return 'needs-practice';
}

function VoiceTurn({ round, term }: { round: Round; term: number }) {
  const router = useRouter();
  const session = useSession();
  // Typing sticks within a session: a typed student re-entering the round
  // lands on the typed turn, not here.
  const typed = session?.inputMode === 'typed';
  useEffect(() => {
    if (typed) router.replace(`/recall/${round}/${term}/typed`);
  }, [typed, round, term, router]);
  // Null on the server and the first client render; the turn mounts with
  // its resume state read once, so nothing is set from an effect.
  if (!session || typed) return <Scaffold />;
  const resume = session.resume;
  const startRung =
    resume && resume.round === round && resume.term === term
      ? (Math.min(3, Math.max(0, resume.rung)) as Rung)
      : 0;
  return <Turn round={round} term={term} startRung={startRung} micPermission={session.micPermission} />;
}

function Turn({
  round,
  term,
  startRung,
  micPermission,
}: {
  round: Round;
  term: number;
  startRung: Rung;
  micPermission: 'unasked' | 'granted' | 'denied';
}) {
  const router = useRouter();
  const terms = termsForRound(round);
  const current = terms[term - 1];

  const [rung, setRung] = useState<Rung>(startRung);
  const [phase, setPhase] = useState<Phase>('idle');
  const [chip, setChip] = useState<Chip>(null);
  const [take, setTake] = useState<ScriptStep | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  /* The script pointer. Advances only when a verdict is shown, or past a
     scripted unclear take once it has been shown; discards, cancelled waits
     and "I don't know" leave it alone. On resume, the steps judged so far
     equal the hints used. */
  const pointer = useRef(Math.min(startRung, current.script.length));
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  /* --- the mocked recorder and judge ------------------------------------- */

  const finish = (outcome: Outcome) => {
    recordOutcome({
      termId: current.id,
      round,
      outcome,
      mode: 'voice',
      lastSeenAt: new Date().toISOString(),
    });
  };

  const resolve = (step: ScriptStep) => {
    pointer.current += 1;
    setTake(null);
    if (step.kind === 'correct') {
      setChip('Correct');
      setPhase('verdict');
      finish(outcomeFor(rung));
      return;
    }
    // partial, miss or a clarifying question: the next hint, or the answer
    // after hint 2. A question gets no chip, because it was not an answer.
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

  const startRecording = () => setPhase('recording');

  /** Tap the control. What it does depends on the state it is in. */
  const tapControl = () => {
    if (phase === 'idle' || phase === 'start-over' || phase === 'unclear') {
      // The mocked iOS prompt comes first on the first mic use in the app.
      if (micPermission === 'unasked') setPhase('prompt');
      else startRecording();
      return;
    }
    if (phase === 'recording') {
      // A script that ran out keeps missing, so the ladder still ends.
      const step = current.script[pointer.current] ?? { kind: 'miss', transcript: 'I’m not sure.' };
      if (step.kind === 'unclear') {
        // Shown once, uses no hint, and is not judged.
        pointer.current += 1;
        setPhase('unclear');
        return;
      }
      setPhase('transcribing');
      timers.current.push(
        window.setTimeout(() => {
          setTake(step);
          setPhase('transcript');
        }, TRANSCRIBE_MS),
      );
      return;
    }
    if (phase === 'sayback-recording') {
      // Nothing is recorded, nothing is judged, nothing is saved.
      setPhase('sayback-done');
    }
  };

  const allowMic = () => {
    updateSession((s) => ({ ...s, micPermission: 'granted' }));
    startRecording();
  };

  const denyMic = () => {
    clearTimers();
    updateSession((s) => ({ ...s, micPermission: 'denied' }));
    router.push(`/recall/${round}/mic-denied`);
  };

  /** From recording, the transcript or the wait: back to idle, nothing used. */
  const discard = () => {
    clearTimers();
    setTake(null);
    // From say it back, Discard returns to the answer.
    setPhase(phase === 'sayback-recording' ? 'idle' : 'start-over');
  };

  const send = () => {
    if (take) judge(take);
  };

  const retry = () => {
    if (take) judge(take, true);
  };

  /** The next rung with no transcript and no judging. */
  const dontKnow = () => {
    setChip(null);
    if (rung >= 2) {
      setRung(3);
      finish('needs-practice');
    } else {
      setRung((rung + 1) as Rung);
    }
    setPhase('idle');
  };

  /* --- actions ----------------------------------------------------------- */

  const typeInstead = () => {
    clearTimers();
    updateSession((s) => ({ ...s, inputMode: 'typed' }));
    router.push(`/recall/${round}/${term}/typed`);
  };

  const nextQuestion = () => {
    updateSession((s) => ({ ...s, resume: s.resume?.round === round ? null : s.resume }));
    if (term < terms.length) router.push(`/recall/${round}/${term + 1}`);
    else router.push(`/recall/${round}/summary`);
  };

  const leave = () => {
    clearTimers();
    updateSession((s) => ({ ...s, resume: { round, term, rung } }));
    router.push('/plan');
  };

  /* --- what Knowie says -------------------------------------------------- */

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
  } else if (phase === 'sayback-recording') {
    bubble = {
      showVerdict: false,
      body: 'Your turn. Say it back however it comes out. This one is just practice.',
      body2: prompt,
    };
  } else if (phase === 'sayback-done') {
    bubble = {
      showVerdict: false,
      body: 'Nice, that’s the shape of it. Nothing here is scored, and this one comes back in your review.',
    };
  } else if (rung === 3) {
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

  const answerShown = rung === 3 && (phase === 'idle' || phase === 'prompt');
  const answering = phase !== 'verdict' && phase !== 'sayback-done' && !answerShown;
  const restingPhase = phase === 'idle' || phase === 'start-over' || phase === 'unclear' || phase === 'prompt';
  const waiting = phase === 'thinking' || phase === 'thinking-slow';
  const recording = phase === 'recording' || phase === 'sayback-recording';

  const helperKey =
    phase === 'idle' ? (rung === 1 ? 'hint1' : rung === 2 ? 'hint2' : 'idle') : phase === 'prompt' ? 'idle' : phase;
  const label = helper[helperKey] ?? helper.recording;

  const mascot: MascotName =
    phase === 'verdict' || phase === 'sayback-done'
      ? 'approving'
      : phase === 'error' || phase === 'unclear'
        ? 'confused'
        : waiting
          ? 'thinking'
          : 'standby';

  /* --- the push-to-talk control (voiceInput, not in the library) --------- */

  let control: React.ReactNode;
  if (phase === 'transcript' && take) {
    // The student's words never go in Knowie's bubble: noteCard neutral.
    control = <NoteCard tone="neutral">{take.transcript}</NoteCard>;
  } else if (restingPhase) {
    control = (
      <button type="button" className={styles.micButton} onClick={tapControl} aria-label="Start recording">
        <IconSlot size="500" name="microphone-01" />
      </button>
    );
  } else {
    const blob = recording ? (
      <button
        type="button"
        className={styles.blob}
        data-phase={phase}
        onClick={tapControl}
        aria-label={phase === 'sayback-recording' ? undefined : 'Stop and send'}
      >
        {phase === 'sayback-recording' ? <span className={styles.blobLabel}>Tap to send</span> : <IconSlot size="500" name="send-01" />}
      </button>
    ) : phase === 'transcribing' ? (
      <div className={styles.blob} data-phase={phase} aria-hidden="true" />
    ) : (
      <div className={styles.ring} data-phase={phase} aria-hidden="true" />
    );
    const canDiscard = recording || waiting;
    control = (
      <div className={styles.recordRow}>
        {canDiscard ? (
          <ButtonIcon variant="Tertiary" size="M" name="trash-01" label="Discard" onClick={discard} />
        ) : (
          <span className={styles.spacer} />
        )}
        {blob}
        <span className={styles.spacer} />
      </div>
    );
  }

  const blocked = sheetOpen || phase === 'prompt';

  /* --- bottomContent: only ever the action the state calls for ----------- */

  let actions: React.ReactNode = null;
  if (phase === 'transcript') {
    actions = (
      <>
        <Button variant="Primary" size="L" onClick={send}>
          Send
        </Button>
        <Button variant="Text" size="L" onClick={discard}>
          Discard
        </Button>
      </>
    );
  } else if (phase === 'error') {
    actions = (
      <Button variant="Primary" size="L" onClick={retry}>
        Retry
      </Button>
    );
  } else if (answerShown) {
    actions = (
      <>
        <Button variant="Primary" size="L" onClick={nextQuestion}>
          Next question
        </Button>
        <Button variant="Text" size="L" onClick={() => setPhase('sayback-recording')}>
          Practice in my own words
        </Button>
      </>
    );
  } else if (phase === 'verdict' || phase === 'sayback-done') {
    actions = (
      <Button variant="Primary" size="L" onClick={nextQuestion}>
        Next question
      </Button>
    );
  }

  return (
    <Scaffold
      showBottomSheetBackground={blocked}
      topNavigation={
        <AppBar
          variant="leftAndRightIconButton"
          leftIcon="x-close"
          leftLabel="Leave this round"
          onLeftPress={() => setSheetOpen(true)}
          rightIcon="zap"
          rightLabel="Streak"
          slot={<ProgressIndicator thickness="16" current={term - 1} total={terms.length} />}
        />
      }
      middleContent={
        <div className={styles.content} inert={blocked}>
          <div className={styles.knowiePrompt}>
            <MascotSlot size="2XL" name={mascot} />
            <ResponseBubble
              showVerdict={bubble.showVerdict}
              verdictTone={bubble.verdictTone}
              showAction={false}
              body={bubble.body}
              body2={bubble.body2}
            />
          </div>
          {answering && (
            <div className={styles.stage} data-phase={phase}>
              <div className={styles.helper} aria-live="polite">
                {label.lead && <p className={styles.helperLead}>{label.lead}</p>}
                <p className={styles.helperBody}>{label.body}</p>
              </div>
              {control}
              {restingPhase && (
                <div className={styles.escapes}>
                  <Button variant="Tertiary" size="M" onClick={dontKnow}>
                    I don’t know the answer
                  </Button>
                  <Button variant="Text" size="M" onClick={typeInstead}>
                    Type instead
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      }
      bottomContent={
        actions && (
          <div className={styles.actions} inert={blocked}>
            {actions}
          </div>
        )
      }
      bottomSheetOnly={
        sheetOpen ? (
          /* Copy is Open 18, decided on the typed turn: Stay is the safe
             primary, Leave the quiet escape. */
          <BottomSheet
            headline="Leave this round?"
            showCaption
            caption="You’ll pick up this question at the same step when you come back."
          >
            <Button variant="Primary" size="L" onClick={() => setSheetOpen(false)}>
              Stay
            </Button>
            <Button variant="Text" size="L" onClick={leave}>
              Leave
            </Button>
          </BottomSheet>
        ) : phase === 'prompt' ? (
          /* The mocked iOS mic prompt, for a round entered without the tray
             (the tray asks on Start). Copy is Open 6, decided here. */
          <PermissionAlert
            title="“Knowunity” would like to access the microphone"
            body="Knowie listens while you explain, so your answer can be checked. Nothing is recorded in this prototype."
            onDeny={denyMic}
            onAllow={allowMic}
          />
        ) : undefined
      }
    />
  );
}

export default function VoiceTurnPage({ params }: { params: Promise<{ round: string; term: string }> }) {
  const { round, term } = use(params);
  if (!isRound(round)) notFound();
  const index = Number(term);
  if (!Number.isInteger(index) || index < 1 || index > termsForRound(round).length) notFound();
  return <VoiceTurn key={`${round}-${index}`} round={round} term={index} />;
}
