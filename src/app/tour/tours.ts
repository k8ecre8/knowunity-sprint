/* The tours on /tour — a tester harness, not a product screen. Each tour
   clears the prototype, seeds whatever its start needs, and opens its first
   screen. Every step says what to tap and what should happen, in the words
   the screens use, so a tester who has never seen the app can check it. */

import type { IconName } from '@/components/IconSlot';
import { seedDay, seedFinishedRound, updateSession } from '@/mock/session';

export type TourStep = {
  /** What to tap, using the label on screen. */
  action: string;
  /** What should happen. */
  result: string;
};

export type Tour = {
  id: string;
  /** Row title. One short line: rows are fixed height and clip. */
  title: string;
  /** Row subtitle. One short line. */
  subtitle: string;
  icon: IconName;
  /** The sheet's caption: what this tour shows and why it matters. */
  about: string;
  steps: TourStep[];
  /** How the tester knows the tour is over. */
  done: string;
  /** Seeds the session after the reset and returns the first route. */
  start: () => string;
};

export type TourGroup = {
  heading: string;
  caption: string;
  tours: Tour[];
};

const record = 'Tap the mic ring, then tap it again to stop. Tap send on “Here’s what Knowie heard”.';

export const tourGroups: TourGroup[] = [
  {
    heading: 'The story, in order',
    caption: 'Three rounds across the week before a test. Each one picks up where the last left off.',
    tours: [
      {
        id: 'day1',
        title: 'Day 1: explain a section',
        subtitle: '3 questions, about 3 min',
        icon: 'book-open-02',
        about:
          'The first pass. Knowie checks each answer and helps with hints, but the summary makes no claim that anything is learned yet. It’s too soon to tell.',
        steps: [
          { action: 'Tap “Continue studying”.', result: 'The exam plan opens, 6 days before the test.' },
          {
            action: 'Tap “Explain it out loud”, then “Start”, then “Allow”.',
            result: 'The first question. The mic prompt is a mock: nothing is recorded in this prototype.',
          },
          {
            action: `Answer question 1. ${record}`,
            result: 'Whatever you say, Knowie shows a scripted answer, then marks it correct.',
          },
          {
            action: 'Answer question 2, then answer it again after the hint.',
            result:
              'The first answer is “Partial” and Knowie gives a hint. Judging is slow on purpose, so you’ll see “Still reading, nearly there” after 4 seconds. The second answer is correct.',
          },
          {
            action: 'Answer question 3 three times.',
            result:
              'Wrong each time. On the second try judging times out after 10 seconds: tap the ring to send again. After the third miss Knowie shows the full answer.',
          },
          {
            action: 'Tap “Practice in my own words”, record, then tap “Next question”.',
            result: 'Saying it back is practice only. It isn’t judged and doesn’t change the summary.',
          },
          {
            action: 'Read the summary, then tap “Continue”.',
            result:
              'One term in each group: correct without help, needed a hint, and needs practice. The plan then jumps to 3 days later.',
          },
        ],
        done: 'The plan shows “3 days” and the review is the next step. Carry straight on with “3 days later: the review” from its step 1.',
        start: () => '/',
      },
      {
        id: 'review',
        title: '3 days later: the review',
        subtitle: '10 questions, about 6 min',
        icon: 'refresh-cw-01',
        about:
          'The second pass, days later. This is the only round allowed to claim what stuck, because enough time has passed for the answers to mean something.',
        steps: [
          { action: 'Tap “Cumulative Review”.', result: 'Before any questions, Knowie asks how ready you feel.' },
          {
            action: 'Tap a spot on the bar, then “Start the review”.',
            result: 'The summary will compare this with how you felt before the plan (“Getting there”).',
          },
          {
            action: `Answer question 1. ${record} The first time, tap “Allow”.`,
            result: '“Didn’t catch that. No hint used.” Knowie heard too little to judge, so you try again with no penalty.',
          },
          {
            action: 'Answer all 10 questions the same way.',
            result:
              'The terms you found hardest on day 1 come first. Most are correct; one needs a hint and one ends with the answer shown.',
          },
          {
            action: 'Read the summary.',
            result:
              'It counts what you got right without help “3 days after you last revised”, then puts how you felt next to how you did.',
          },
          { action: 'Tap “Continue”.', result: 'The plan jumps to the night before the test.' },
        ],
        done: 'The plan says “Test tomorrow” and shows “Warm up now”. Carry straight on with “The night before the test” from its step 2.',
        start: () => {
          seedDay('review');
          return '/plan';
        },
      },
      {
        id: 'eve',
        title: 'The night before the test',
        subtitle: '12 questions, about 6 min',
        icon: 'calendar-check-01',
        about:
          'A last warm-up. Every term comes back, asked a new way, and the summary leads with what’s left to look at tonight.',
        steps: [
          {
            action: 'Look at app home.',
            result: '“Your test is tomorrow” replaces the usual study reminder.',
          },
          { action: 'Tap “Warm up now”.', result: 'The first question starts straight away, with no plan in between.' },
          {
            action: `Answer all 12 questions. ${record} The first time, tap “Allow”.`,
            result: 'Each question is worded differently from before. Some need a hint and one ends with the answer shown.',
          },
          {
            action: 'Read the summary.',
            result:
              'The headline counts the terms to look at tonight. “Needs practice” is fully open; the other groups show three terms, then “N more”.',
          },
          { action: 'Tap “N more”.', result: 'The rest of that group opens.' },
          { action: 'Tap “Finish”.', result: 'The plan shows as complete.' },
        ],
        done: 'The plan shows “Plan complete”. That’s the whole story.',
        start: () => {
          seedDay('eve');
          return '/';
        },
      },
    ],
  },
  {
    heading: 'Jump to a summary',
    caption: 'Each opens a summary with its round already answered, so you can skip the questions.',
    tours: [
      {
        id: 'review-more-ready',
        title: 'Felt more ready',
        subtitle: 'Review summary',
        icon: 'arrow-narrow-up-right',
        about:
          'The review is already answered, and you said you felt “Ready”. Your answers improved too, so Knowie agrees with you.',
        steps: [
          {
            action: 'Read the headline.',
            result: 'It counts what you got right without help “3 days after you last revised”.',
          },
          {
            action: 'Read “How you felt”.',
            result: '“Getting there” before the plan, “Ready” today, then “You felt more confident. Your answers back that up.”',
          },
          {
            action: 'Tap “Try the ones you missed”.',
            result: 'Only the missed terms, then back to this summary, unchanged.',
          },
        ],
        done: 'You’re back on the review summary. Compare it with “Felt less ready”.',
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
        subtitle: 'Review summary',
        icon: 'arrow-narrow-down-right',
        about:
          'The same answers as “Felt more ready”, but you said you felt “So cooked”. Knowie points out that you know more than you feel.',
        steps: [
          {
            action: 'Read “How you felt”.',
            result:
              '“Getting there” before the plan, “So cooked” today, then “You felt less confident, but your answers got better.” Knowie celebrates.',
          },
        ],
        done: 'You’ve seen the underconfident version. The rest of the summary is the same as “Felt more ready”.',
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
        subtitle: 'Review summary, same day',
        icon: 'clock',
        about:
          'What the review says if everything was revised today. Tapping through can’t get you here, because the review always comes 3 days after day 1.',
        steps: [
          {
            action: 'Read the headline.',
            result: '“…but you revised these today, so they’re still fresh. Come back tomorrow to see what stuck.”',
          },
          {
            action: 'Read “How you felt”.',
            result: 'Only the feeling is compared. Knowie says today’s answers can’t tell you yet whether it’s right.',
          },
        ],
        done: 'You’ve seen the same-day version, which claims nothing.',
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
        subtitle: 'Night-before summary',
        icon: 'list',
        about: 'The night-before warm-up, already answered with a few misses.',
        steps: [
          { action: 'Read the headline.', result: 'It counts the terms to look at tonight, not whether you’re ready.' },
          {
            action: 'Look at the groups.',
            result: '“Needs practice” is fully open. The others show three terms, then “N more”. Tap “N more” to open the rest.',
          },
          {
            action: 'Tap “One more try at the misses”.',
            result: 'Only the missed terms, then back to this summary, unchanged.',
          },
        ],
        done: 'You’re back on the summary. Compare it with “All correct”.',
        start: () => {
          seedDay('eve');
          seedFinishedRound('eve');
          return '/recall/eve/summary';
        },
      },
      {
        id: 'eve-ready',
        title: 'All correct',
        subtitle: 'Night-before summary',
        icon: 'trophy-02',
        about: 'The night-before warm-up with every term right the first time. The only place the app says you’re ready.',
        steps: [
          {
            action: 'Read the headline.',
            result: '“You’re ready!” and “You got all 12 correct without help, asked a new way, the day before your test.”',
          },
          { action: 'Tap “Finish”.', result: 'The plan shows as complete.' },
        ],
        done: 'The plan shows “Plan complete”.',
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
    heading: 'Moments inside a question',
    caption: 'Short tours of the states a student hits when something doesn’t go to plan.',
    tours: [
      {
        id: 'mic-blocked',
        title: 'The mic is blocked',
        subtitle: 'Saying no to the mic prompt',
        icon: 'microphone-off-01',
        about: 'What happens when a student says no to the mic. The round carries on typed, and nothing is lost.',
        steps: [
          { action: 'Tap “Start”.', result: 'The mock iPhone prompt asks for the microphone.' },
          {
            action: 'Tap “Don’t Allow”.',
            result: '“Knowie can’t hear you.” The round will be typed, and a note says how to turn the mic back on.',
          },
          { action: 'Tap “Type instead”.', result: 'The same question, with a text box in place of the mic.' },
          {
            action: 'Tap “Use my voice instead”.',
            result: '“The mic is still off.” An iPhone only asks once, so Knowie can’t ask again.',
          },
        ],
        done: 'You see “The mic is still off”. The mic stays blocked until you start another tour.',
        start: () => '/plan/plate-tectonics/intro',
      },
      {
        id: 'typed',
        title: 'Typing instead of talking',
        subtitle: 'For when you can’t talk',
        icon: 'keyboard-01',
        about: 'For a student on a bus or in a library. Typing counts the same as talking.',
        steps: [
          { action: 'Tap “I can’t talk right now”.', result: 'The first question, with a text box in place of the mic.' },
          { action: 'Type anything and send it.', result: 'Knowie marks it correct. Typed answers follow the same script as spoken ones.' },
          { action: 'Tap “Next question”.', result: 'Question 2 stays typed.' },
          {
            action: 'Tap “Use my voice instead”.',
            result: 'The mic comes back for the same question. Tap the ring and “Allow” to answer out loud.',
          },
        ],
        done: 'You’re on question 2 with the mic.',
        start: () => '/plan/plate-tectonics/intro',
      },
      {
        id: 'start-over',
        title: 'Starting over',
        subtitle: 'Throwing away an answer',
        icon: 'trash-01',
        about: 'A student can throw away an answer at any point before it’s judged, and it costs nothing.',
        steps: [
          { action: 'Tap the mic ring, then “Allow”.', result: '“Listening.” A bin button appears beside the ring.' },
          {
            action: 'Tap the bin.',
            result: '“No harm done, go again.” No hint is used and the progress bar doesn’t move.',
          },
          {
            action: 'Record again, tap to stop, then tap the bin on “Here’s what Knowie heard”.',
            result: 'The same: back to the start of the question.',
          },
          {
            action: 'Record, stop and send, then tap the bin while Knowie is reading.',
            result: 'The same again. The answer is dropped, not judged.',
          },
        ],
        done: 'You’re on question 1 with “No harm done, go again”.',
        start: () => '/recall/section/1',
      },
      {
        id: 'unclear',
        title: 'Didn’t catch that',
        subtitle: 'An answer too short to judge',
        icon: 'info-circle',
        about: 'When Knowie hears too little to judge, it asks again without using up a hint.',
        steps: [
          {
            action: 'Tap the mic ring, then “Allow”, then tap it again to stop.',
            result: '“Didn’t catch that. No hint used.” Nothing is judged.',
          },
          { action: 'Record again and send.', result: 'This time the answer is judged.' },
        ],
        done: 'Knowie has judged the answer.',
        start: () => {
          seedDay('review');
          updateSession((s) => ({ ...s, preReviewRating: 2 }));
          return '/recall/review/1';
        },
      },
      {
        id: 'dont-know',
        title: 'I don’t know the answer',
        subtitle: 'Asking for help straight away',
        icon: 'help-circle',
        about: 'A student can ask for help without having to get it wrong first.',
        steps: [
          {
            action: 'Tap “I don’t know the answer”.',
            result: 'Knowie gives the first hint straight away, with no judging and no verdict.',
          },
          { action: 'Tap it again.', result: 'The second hint: “Last try, two hints”.' },
          { action: 'Tap it once more.', result: 'Knowie shows the full answer.' },
        ],
        done: 'The full answer is showing. On the summary this term would count as needs practice.',
        start: () => '/recall/section/1',
      },
      {
        id: 'leave',
        title: 'Leaving and coming back',
        subtitle: 'Picking up at the same hint',
        icon: 'x-close',
        about: 'A student who leaves mid-question comes back to the same question, at the same hint.',
        steps: [
          { action: 'Tap “I don’t know the answer” twice.', result: 'The second hint is showing.' },
          { action: 'Tap the X at the top left.', result: '“Leave this round?”' },
          { action: 'Tap “Stay”.', result: 'The sheet closes and nothing is lost.' },
          { action: 'Tap the X again, then “Leave”.', result: 'Back on the exam plan.' },
          {
            action: 'Tap “Explain it out loud”, then “Start”, then “Allow”.',
            result: 'The same question, still on the second hint.',
          },
        ],
        done: 'You’re back on question 1 with the second hint showing.',
        start: () => '/recall/section/1',
      },
    ],
  },
];
