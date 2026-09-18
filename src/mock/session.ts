/* Session state for the mocked recall — see SPEC.md → How the mocked recall
   behaves. The session lives in `sessionStorage` under one key. The mic
   answer is the exception: it lives in `localStorage`, because iOS keeps a
   permission for the app, not for a tab. `resetPrototype` (`/plan?reset`)
   clears both. Summaries count rows and nothing else. */

import { useSyncExternalStore } from 'react';
import { termsForRound, type Round, type ScriptStep, type Term } from './terms';

export type Outcome = 'correct-without-help' | 'needed-a-hint' | 'needs-practice';

export type InputMode = 'voice' | 'typed';

export type OutcomeRow = {
  termId: string;
  round: Round;
  outcome: Outcome;
  /** Logged, never shown. */
  mode: InputMode;
  lastSeenAt: string;
};

/** Where a round was left after X → Leave, so re-entering resumes it. */
export type Resume = {
  round: Round;
  /** 1-based, matching the `[term]` route segment. */
  term: number;
  /** 0 = prompt, 1 = hint 1, 2 = hint 2, 3 = answer shown. */
  rung: number;
};

/** A practice pass writes no rows. Set by "Try the ones you missed". */
export type Practice = {
  round: Round;
  termIds: string[];
};

/**
 * The simulated day. Finishing a round moves it on: the section summary to
 * review day, the review summary to exam eve. `?day=review|eve` on `/` or
 * `/plan` jumps straight there.
 */
export type Day = 'day1' | 'review' | 'eve';

/** Days between Day 1 and the review, used to age the tester's section rows. */
const REVIEW_GAP_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function dayFrom(value: string | null): Day | null {
  return value === 'day1' || value === 'review' || value === 'eve' ? value : null;
}

/** Days left to the exam, by simulated day. */
export const daysToExam: Record<Day, number> = { day1: 6, review: 3, eve: 1 };

export type Session = {
  day: Day;
  rows: OutcomeRow[];
  inputMode: InputMode;
  micPermission: 'unasked' | 'granted' | 'denied';
  resume: Resume | null;
  practice: Practice | null;
  /** Plan nodes marked done, by section id. */
  doneSections: string[];
  /** The pre-review confidence rating, one of five positions. */
  preReviewRating: number | null;
};

const KEY = 'knowie.session';
const MIC_KEY = 'knowie.mic';

type MicPermission = Session['micPermission'];

export const emptySession: Session = {
  day: 'day1',
  rows: [],
  inputMode: 'voice',
  micPermission: 'unasked',
  resume: null,
  practice: null,
  doneSections: [],
  preReviewRating: null,
};

function storage(kind: 'sessionStorage' | 'localStorage' = 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function readMic(): MicPermission {
  try {
    const raw = storage('localStorage')?.getItem(MIC_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : 'unasked';
  } catch {
    return 'unasked';
  }
}

export function readSession(): Session {
  const store = storage();
  if (!store) return emptySession;
  const micPermission = readMic();
  try {
    const raw = store.getItem(KEY);
    if (!raw) return { ...emptySession, micPermission };
    return { ...emptySession, ...(JSON.parse(raw) as Partial<Session>), micPermission };
  } catch {
    return { ...emptySession, micPermission };
  }
}

export function writeSession(next: Session): void {
  const store = storage();
  if (!store) return;
  const { micPermission, ...rest } = next;
  store.setItem(KEY, JSON.stringify(rest));
  try {
    const local = storage('localStorage');
    if (micPermission === 'unasked') local?.removeItem(MIC_KEY);
    else local?.setItem(MIC_KEY, micPermission);
  } catch {
    // Storage blocked: the prompt shows again next time.
  }
}

/** Clears the session and the mic answer, so the prototype starts fresh. */
export function resetPrototype(): void {
  try {
    storage()?.removeItem(KEY);
    storage('localStorage')?.removeItem(MIC_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();

export function updateSession(patch: (s: Session) => Session): Session {
  const next = patch(readSession());
  writeSession(next);
  listeners.forEach((l) => l());
  return next;
}

/* --- reading from React ---------------------------------------------------- */

let cachedRaw: string | null | undefined;
let cachedSession: Session = emptySession;

/** Snapshot for useSyncExternalStore: stable while the stored strings are unchanged. */
function snapshot(): Session {
  const store = storage();
  const raw = store ? `${store.getItem(KEY)}|${readMic()}` : null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = readSession();
  }
  return cachedSession;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== 'undefined') window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', listener);
  };
}

/**
 * The session as a React store. Returns `null` on the server and on the first
 * client render, so the markup matches; the screen renders once it has it.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

/** Each term writes one row when it ends; a second pass replaces it. */
export function recordOutcome(row: OutcomeRow): void {
  updateSession((s) => ({
    ...s,
    rows: [...s.rows.filter((r) => !(r.termId === row.termId && r.round === row.round)), row],
  }));
}

/**
 * Moves the simulated day on. Going to review day ages the tester's own
 * section rows by the review gap, so the review summary's days-later claim
 * counts real rows.
 */
export function advanceDay(day: Day): void {
  updateSession((s) => {
    if (s.day === day) return s;
    const rows =
      day === 'review'
        ? s.rows.map((r) =>
            r.round === 'section'
              ? { ...r, lastSeenAt: new Date(Date.parse(r.lastSeenAt) - REVIEW_GAP_DAYS * DAY_MS).toISOString() }
              : r,
          )
        : s.rows;
    return { ...s, day, rows };
  });
}

export function rowsForRound(session: Session, round: Round): OutcomeRow[] {
  return session.rows.filter((r) => r.round === round);
}

/**
 * The 1-based term a round is on right now: a left-off term if there is one,
 * otherwise the first term without a row, otherwise the last term.
 */
export function currentTerm(session: Session, round: Round): number {
  if (session.resume?.round === round) return session.resume.term;
  const terms = termsForRound(round);
  const done = new Set(rowsForRound(session, round).map((r) => r.termId));
  const next = terms.findIndex((t) => !done.has(t.id));
  return next === -1 ? Math.max(terms.length, 1) : next + 1;
}

/* --- outcomes from the script -------------------------------------------- */

/** The outcome a term's script produces when walked with no discards. */
export function scriptedOutcome(script: ScriptStep[]): Outcome {
  let hints = 0;
  for (const step of script) {
    if (step.kind === 'correct') break;
    if (step.kind === 'unclear') continue;
    hints += 1;
    if (hints >= 2) break;
  }
  if (hints === 0) return 'correct-without-help';
  if (hints === 1) return 'needed-a-hint';
  return 'needs-practice';
}

/**
 * The rows a summary counts. Until the turn screens have written rows for
 * this round, the summary falls back to what the script would have produced,
 * so it renders the scripted state rather than an empty screen.
 */
export function summaryRows(session: Session, round: Round): { rows: OutcomeRow[]; fromScript: boolean } {
  const real = rowsForRound(session, round);
  if (real.length > 0) return { rows: real, fromScript: false };
  const rows = termsForRound(round).map(
    (t: Term): OutcomeRow => ({
      termId: t.id,
      round,
      outcome: scriptedOutcome(t.script),
      mode: 'voice',
      lastSeenAt: t.lastSeenAt,
    }),
  );
  return { rows, fromScript: true };
}
