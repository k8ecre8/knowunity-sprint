/* The tours on /tour — a tester harness, not a product screen. Each tour
   clears the prototype, seeds whatever its start needs, and opens a screen.
   Copy is kept to what a reviewer can't work out by looking: which taps get
   there, and which simulated day they land on. */

import type { IconName } from '@/components/IconSlot';
import { seedDay, seedFinishedRound, updateSession } from '@/mock/session';

export type TourStep = {
  /** What to tap, using the label on screen. */
  action: string;
  /** Only where the result is a state worth naming. */
  result?: string;
};

export type Tour = {
  id: string;
  /** Row title. One short line: rows are fixed height and clip. */
  title: string;
  /** Row subtitle, after the day. One short line: rows clip. */
  detail: string;
  /** The simulated day this tour lands on, shown on the row. */
  day: string;
  icon: IconName;
  steps: TourStep[];
  /** Seeds the session after the reset and returns the route to open. */
  start: () => string;
};

export type TourGroup = {
  heading: string;
  tours: Tour[];
};

const answer = 'Answer each question: tap the ring, tap again to stop, then send.';

export const tourGroups: TourGroup[] = [
  {
    heading: 'The story',
    tours: [
      {
        id: 'day1',
        title: 'Explain a section',
        detail: '3 questions',
        day: 'Day 1',
        icon: 'book-open-02',
        steps: [
          { action: 'Tap “Continue studying”, “Explain It Out Loud”, “Start”, “Allow”.' },
          { action: answer, result: 'Q1 correct, Q2 partial then correct, Q3 wrong three times, then the answer.' },
          { action: 'Wait on Q2 and Q3.', result: 'Judging is slow past 4s, and times out at 10s on Q3’s second try.' },
          { action: 'Tap “Continue” on the summary.', result: 'The app moves on 3 days.' },
        ],
        start: () => '/',
      },
      {
        id: 'review',
        title: 'The review',
        detail: '10 questions',
        day: '3 days later',
        icon: 'refresh-cw-01',
        steps: [
          { action: 'Tap “Cumulative Review”, pick a spot on the bar, then “Start the review”.' },
          { action: answer, result: 'Q1 lands on “didn’t catch that” first. The hardest terms from day 1 come first.' },
          { action: 'Tap “Continue” on the summary.', result: 'The app moves on to the night before the test.' },
        ],
        start: () => {
          seedDay('review');
          return '/plan';
        },
      },
      {
        id: 'eve',
        title: 'The warm-up',
        detail: '12 questions',
        day: 'Night before',
        icon: 'calendar-check-01',
        steps: [
          { action: 'Tap “Warm up now”.' },
          { action: answer, result: 'Every term again, worded a new way.' },
          { action: 'Tap “N more” on the summary, then “Finish”.' },
        ],
        start: () => {
          seedDay('eve');
          return '/';
        },
      },
    ],
  },
  {
    heading: 'Summaries',
    tours: [
      {
        id: 'review-more-ready',
        title: 'Felt more ready',
        detail: 'review summary',
        day: '3 days later',
        icon: 'arrow-narrow-up-right',
        steps: [{ action: 'Read it.', result: 'Rated “Ready”, and the answers agree.' }],
        start: () => {
          seedDay('review');
          updateSession((s) => ({ ...s, preReviewRating: 5 }));
          seedFinishedRound('review');
          return '/recall/review/summary';
        },
      },
      {
        id: 'review-less-ready',
        title: 'Felt less ready',
        detail: 'review summary',
        day: '3 days later',
        icon: 'arrow-narrow-down-right',
        steps: [{ action: 'Read it.', result: 'Rated “So cooked”, but the answers got better: underconfidence.' }],
        start: () => {
          seedDay('review');
          updateSession((s) => ({ ...s, preReviewRating: 1 }));
          seedFinishedRound('review');
          return '/recall/review/summary';
        },
      },
      {
        id: 'review-fresh',
        title: 'Too soon to tell',
        detail: 'review summary',
        day: 'Same day',
        icon: 'clock',
        steps: [{ action: 'Read it.', result: 'Revised today, so it claims nothing. Unreachable by tapping.' }],
        start: () => {
          seedDay('review');
          updateSession((s) => ({ ...s, preReviewRating: 4 }));
          seedFinishedRound('review');
          return '/recall/review/summary?fresh';
        },
      },
      {
        id: 'eve-misses',
        title: 'Some misses left',
        detail: 'warm-up summary',
        day: 'Night before',
        icon: 'list',
        steps: [{ action: 'Tap “N more”, then “One more try at the misses”.' }],
        start: () => {
          seedDay('eve');
          seedFinishedRound('eve');
          return '/recall/eve/summary';
        },
      },
      {
        id: 'eve-ready',
        title: 'All correct',
        detail: 'warm-up summary',
        day: 'Night before',
        icon: 'trophy-02',
        steps: [{ action: 'Read it.', result: 'The only place the app says you’re ready.' }],
        start: () => {
          seedDay('eve');
          updateSession((s) => ({ ...s, eveReady: true }));
          seedFinishedRound('eve');
          return '/recall/eve/summary';
        },
      },
    ],
  },
  {
    heading: 'Moments',
    tours: [
      {
        id: 'mic-blocked',
        title: 'The mic is blocked',
        detail: 'mic denied twice',
        day: 'Day 1',
        icon: 'microphone-off-01',
        steps: [
          { action: 'Tap “Start”, then “Don’t Allow”.' },
          { action: 'Tap “Type instead”, then “Use my voice instead”.', result: 'The second denial: iOS only asks once.' },
        ],
        start: () => '/plan/plate-tectonics/intro',
      },
      {
        id: 'typed',
        title: 'Typing instead',
        detail: 'typed turn',
        day: 'Day 1',
        icon: 'keyboard-01',
        steps: [
          { action: 'Tap “Type instead”.' },
          { action: 'Type anything, send, then “Next question”.', result: 'Same script as voice, and typing sticks.' },
        ],
        start: () => '/plan/plate-tectonics/intro',
      },
      {
        id: 'start-over',
        title: 'Starting over',
        detail: 'discard an answer',
        day: 'Day 1',
        icon: 'trash-01',
        steps: [
          { action: 'Tap the ring, “Allow”, then the bin.', result: 'Nothing used, nothing moves.' },
          { action: 'Repeat from the transcript, and while Knowie is reading.' },
        ],
        start: () => '/recall/section/1',
      },
      {
        id: 'unclear',
        title: 'Didn’t catch that',
        detail: 'too short to judge',
        day: '3 days later',
        icon: 'info-circle',
        steps: [{ action: 'Tap the ring, “Allow”, then tap to stop.', result: 'Asked again, no hint used.' }],
        start: () => {
          seedDay('review');
          updateSession((s) => ({ ...s, preReviewRating: 2 }));
          return '/recall/review/1';
        },
      },
      {
        id: 'dont-know',
        title: 'I don’t know',
        detail: 'the hint ladder',
        day: 'Day 1',
        icon: 'help-circle',
        steps: [{ action: 'Tap “I don’t know the answer” three times.', result: 'Hint 1, hint 2, then the answer.' }],
        start: () => '/recall/section/1',
      },
      {
        id: 'leave',
        title: 'Leaving and coming back',
        detail: 'resume at the same hint',
        day: 'Day 1',
        icon: 'x-close',
        steps: [
          { action: 'Tap “I don’t know the answer” twice, then the X.' },
          { action: 'Tap “Stay”, then the X and “Leave”.' },
          { action: 'Tap “Explain It Out Loud”, “Start”, “Allow”.', result: 'Same question, still on hint 2.' },
        ],
        start: () => '/recall/section/1',
      },
    ],
  },
];
