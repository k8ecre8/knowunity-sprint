/* The line above the question, on both turns.

   One helper so voice and typed cannot drift: they had two different strings
   for the same beat before this existed.

   The first question a student sees on entering a round carries three things,
   each doing separate work: where they are, what counts as an answer, and what
   to do. "Even a partial answer is a great start" lives here rather than on the
   recording control's label, because the bubble is read and the label is easy
   to miss, and it says something the intro tray's "pause, stumble, or even
   start over" does not: an incomplete answer still makes progress.

   Every question after that keeps only the topic anchor and the one cue that
   is permission as much as instruction. Knowie never says "explain to Knowie":
   it is Knowie's own bubble, with the mascot beside it. */

import type { Round, Term } from '@/mock/terms';

const PARTIAL = 'Even a partial answer is a great start.';

const opener: Record<Round, (term: Term) => string> = {
  section: (term) => `Let’s see what you remember from ${term.section}.`,
  review: () => 'Let’s see what stuck.',
  eve: () => 'Last look before tomorrow.',
};

/**
 * `first` is the first question of this entry into the round, not term 1: a
 * student resuming on term 2 has not seen the frame yet.
 */
export function turnFrame(round: Round, term: Term, first: boolean): string {
  if (first) return `${opener[round](term)} ${PARTIAL} Explain in your own words:`;
  return `${term.section}, in your own words:`;
}
