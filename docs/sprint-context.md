# Sprint context: Explain it to Knowie

Voice active recall for Knowunity: Knowie asks, the student speaks, Knowie answers in text with a verdict.
Prototype is a web app that looks like iOS, 390px, dark mode only, recall mocked.

**Concept:** one recall loop in two places, framed differently, where only the second pass is allowed to claim the student has learned anything.

**Where it lives:** three rounds on the same loop.

- **Section round:** 3 to 5 terms after each section's quiz. The plan node is done whatever the outcome, because completion is not mastery and the misses return in the review.
- **Review round:** 10 terms inside the comprehensive review node ("See what stuck"), preceded by a confidence check.
- **Exam-eve repeat:** 12 terms, reached from the day-before reminder, every term asked with a second wording.

Review and repeat pick terms weakest first: needs practice, then needed a hint, then correct without help.

## Decisions

### The turn

- Recording has a read-only transcript step before judging: record, stop, a short transcribing beat, the transcript with send or discard, then judging. Because only the student can tell a mishearing from a real miss, and a misheard answer that reaches a verdict leaks a hint they didn't need. The transcript is never editable, because editing it is similar effort to typing.
- Discard, from recording, the transcript or the wait, always returns to idle ("Start over"), because there is a beat to reread the question before going live again.
- A take with no articulated response (silence, noise) skips the transcript and returns to idle with "didn't catch that". It uses no hint.
- There are no unaided retries. A miss, a partial answer or "I don't know" all go to the next hint: hint 1, hint 2, then the answer is shown.
- "I don't know" is a button with the same label on every step. It advances the ladder without processing audio, because a spoken "I don't know" is not a response worth judging and the alternative was skipping.
- There is no skip. "I don't know" covers not knowing and not understanding the question; the typed route covers can't talk right now.
- A clarifying question instead of an answer gets no verdict chip, only the hint, because it was not an answer.
- The verdict chip reports what the student just did, not the ladder step: partial is Almost there, miss is Try again, "I don't know" shows no chip. "Explain more" is reserved and hidden; explanations wait for the summary.
- Say it back is optional after the answer is shown: record, stop, Knowie acknowledges, next question. No transcript, no judging, nothing saved, because seconds after reading the answer it cannot prove retrieval.
- The judging wait gets a second animation beat at 4 seconds, and past 10 seconds becomes an error with retry. Retry re-runs judging without re-recording.

### Input mode

- The typing route runs inside the session with the same questions, ladder and verdicts, because the student must never be routed back to the plan home to get out.
- Voice idle shows "I don't know" with "Type instead" as a text link under it; the typed screen shows "Use my voice instead". The switch always sits in the same place.
- Typing sticks for the rest of the session; the next session starts on voice, because voice is the point and a student in a quiet room shouldn't be asked every term.
- A typed answer records the same outcome as a spoken one. Modality is logged but never shown.
- Start on the section intro tray triggers a mocked iOS mic prompt the first time. Denied leads to a denied screen, then the typed route. "Use my voice instead" while denied shows the denied screen again, because the OS cannot re-prompt.
- Tapping X always asks for confirmation. Returning resumes the same term at the same hint step.

### Outcomes and summaries

- Every term ends in one of three outcomes: correct without help, needed a hint (exactly one hint, then correct), needs practice (two hints, or shown the answer). A hinted pass never merges into an unaided one anywhere in the data or on screen.
- Every number on a summary is a count of those rows, because a score nobody can reconstruct costs overconfidence nothing.
- "Try the ones you missed" and "One more try at the misses" are practice only and change no rows.
- The review summary headline states the count and the gap since the student last saw the terms. A same-day review says the terms are still fresh instead of claiming learning, so the mock data carries a timestamp per term.
- Confidence is one whole-plan rating on five positions, taken before the plan (mocked in data) and again before the review round. The review summary shows both, and compares how confidence changed with how performance changed from the section rounds to the review, as copy versions, not numbers: up, same or down on each axis. Overconfidence is named in the copy and costs nothing more; underconfidence gets the evidence and a celebratory Knowie.

### The mock

- The mock returns scripted verdicts per term on a real delay of a few seconds, because the wait is the hardest state in the feature. A step in the script advances only when a verdict is shown.
- The section round script: term 1 correct first try; term 2 partial, hint 1, correct, with the 4-second beat on its first judgement; term 3 the full ladder to the answer and say it back, with the 10-second error on its second judgement. Unclear takes are scripted, not measured.
- Review day and exam eve are separate entry links with seeded data. The tester's own section outcomes persist in session storage and feed the review selection and comparison.
- The prototype opens on app home.

### Build

- All colour, type, spacing and radius come from `tokens/tokens.json` and `design-system.md`, no bare hex.
- Build inside the 390px scaffold: safe areas, 44x44 minimum, no hover, thumb-zone primary actions, reduced-motion fallback on every animated state, layouts holding 30 to 40% string expansion.

## Not building

Real speech recognition or judging, Knowie speaking, pause and resume, interruption and auto-pause, network and hardware failures (the 10-second error is a scripted state, not failure handling), disputing a verdict, fluency or halting detection, skip, XP, notification plumbing, plan onboarding (the first confidence rating is mocked), German copy, recall on flashcards or uploaded notes or mock-exam misses or AI Chat or Focus Mode, light mode, tablet, desktop, Android, plan pacing changes.
