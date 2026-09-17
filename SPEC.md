# Spec: Explain it to Knowie

Knowie asks a question about a section the student just revised, the student explains the answer out loud, and Knowie replies in text with a verdict and a hint ladder.
The same loop runs three times (section round, review round, exam-eve repeat), and only the later passes are allowed to claim the student has learned anything.

**This prototype is the Next.js app in this repo** (Next.js 16, React 19, `src/app/`). Every screen below is a page with its own route under `src/app/`, and the student reaches each one by tapping, starting from `/`. Storybook (`npm run storybook`) stays the component catalogue: screens import components from `src/components/` and do not add stories of their own.

Scope and decisions come from `docs/sprint-context.md`. Values come from `tokens/tokens.json`, and component rules come from `docs/design-system.md`. The Figma source is the "Exam Section 1 - Claude" section on the Core Flow page of *Yummy__Knowie Design System*.

---

## Before any screen

- `src/app/layout.tsx` is still the template. Give it a real title, add `viewport-fit=cover`, and remove Geist, because Greed is loaded by `src/app/fonts/fonts.css` through `src/app/globals.css`.
- `src/app/page.tsx` is the create-next-app page and contains bare hex values. It gets replaced by App home.
- Mock data and session state live in new files: `src/mock/terms.ts` (terms, prompts, hints, answers, scripts, timestamps) and `src/mock/session.ts` (outcome rows, current rung, input mode, persisted to `sessionStorage`). See **How the mocked recall behaves**.
- Every screen is a `Scaffold` at 390 wide. "Components" below lists only what is in Storybook. Anything else is listed as **not in the library**. Those gaps are reported, not built, per `CLAUDE.md`.

---

## Screens, in build order

Easiest first. Screens that depend on the fewest gaps come first.

### 1. Section summary

**Route:** `/recall/section/summary`, in `src/app/recall/[round]/summary/page.tsx` when `round` is `section`

**States**
- No misses.
- Has misses. Continue is primary, "Try the ones you missed" drops to secondary.

**Components**
- `Scaffold`, with `showTopNavSlot` as Figma has it (off).
- `AppBar` with `variant="leftIconButtonOnly"`, `leftIcon="x-close"` and `leftLabel`.
- `SummaryCard` with `tone` `Good`, `Partial` and `NeedsPractice`, using `showRow1`–`3` and `term1`–`3`. There's no overflow row, because the section summary shows everything.
- `Button` in `variant` Primary and Secondary, `size="L"`.

**Not in the library**
- `noteCard` (tone `outlined`, leading icon), used twice.
- The `clipboard-check` glyph is not in `IconSlot`.
- The headline ("Here's how it went", "1 of 3 without help") has no `textBlock` in code.

**Actions**
- Continue → `/plan`, with the Plate Tectonics voice node marked `done` whatever the outcome.
- Try the ones you missed → see Open.
- X → `/plan`.

### 2. Exam-eve repeat summary

**Route:** `/recall/eve/summary`

**States**
- All correct ("You're ready!", one `Good` card).
- With misses ("You're almost ready.", with `NeedsPractice`, `Partial` and `Good` cards).

**Components**
- `Scaffold`.
- `AppBar` with `variant="leftIconButtonOnly"` and `leftIcon="x-close"`.
- `SummaryCard`. `NeedsPractice` is always fully open. `Good` and `Partial` show up to 3 rows and then `showOverflowRow` with `overflowText` ("9 more"). The screen owns `onOverflowPress`, which expands the card.
- `Button`: Primary L, plus Text L in the misses state.

**Not in the library**
- The group labels "Look at these before your test" and "You've got these", with their counts, have no `textBlock`.
- The "How you felt" block has no component.

**Actions**
- Finish → `/plan` in complete mode.
- One more try at the misses → see Open.
- Expanding an overflow row changes nothing but the view.

### 3. Review summary

**Route:** `/recall/review/summary`

**States**
- Days-later claim: the headline gives the count and the gap ("8 of 10 correct without help, 6 days after you last revised").
- Same-day: terms seen less than a day ago say "still fresh, come back tomorrow" instead of claiming learning.
- The confidence comparison has nine copy versions: confidence up, same or down, crossed with performance up, same or down.
  - Overconfidence is named in the copy.
  - Underconfidence gets the evidence and a celebratory `MascotSlot` expression.

**Components**
- `Scaffold`.
- `AppBar` with `variant="leftIconButtonOnly"` and `leftIcon="x-close"`.
- `SummaryCard` for the three tones, with overflow on `Good`.
- `MascotSlot`, underconfidence only.
- `IconSlot` at `size="250"`.
- `Button`: Primary L and Secondary L.

**Not in the library**
- `noteCard` (tone `highlight`, leading icon) for the come-back line.
- "How you felt": the before-plan and today ratings side by side, which has no component.

**Actions**
- Continue → `/plan` in complete mode.
- Try the ones you missed → see Open.
- X → `/plan`.

### 4. Mic denied

**Route:** `/recall/[round]/mic-denied`

**States**
- First denial, reached from the mocked iOS prompt.
- Reached again from "Use my voice instead" while permission is still denied.

**Components**
- `Scaffold`.
- `MascotSlot`.
- `Button`: Primary L "Type instead", plus any secondary action (see Open).

**Not in the library:** there's no Figma frame, and the content is undecided (see Open).

**Actions**
- Type instead → `/recall/[round]/[term]/typed` for the current term.

### 5. Confidence check

**Route:** `/recall/review/confidence`

**States**
- Nothing selected, with Start the review disabled.
- One of five positions selected.

**Components**
- `Scaffold`.
- `AppBar` with `variant="leftIconButtonOnly"` and `leftIcon="x-close"`.
- `MascotSlot` at `size="3XL"`.
- `ResponseBubble` with `showVerdict={false}`, carrying "How ready do you feel for your exam right now?"
- `Button`: Primary L, with `state="Disabled"` until a position is chosen.

**Not in the library:** `answerOption`, the five-position slider control.

**Actions**
- Choose a position → stored in the session as the pre-review rating.
- Start the review → `/recall/review/1`.
- X → `/plan`.

### 6. Typed turn

**Route:** `/recall/[round]/[term]/typed`

**States**
- **Idle:** the prompt, or the current hint.
- **Typing.**
- **Thinking:** the judging wait.
- **Thinking, slow:** the second beat at 4s.
- **Error:** past 10s, with retry.
- **Verdict:** correct.
- **Hint 1.**
- **Hint 2.**
- **Answer shown.**
- **Leave confirm.**

Same ladder, script and outcomes as the voice turn, with no recording or transcript states.

**Components**
- `Scaffold`.
- `AppBar` with `variant="leftAndRightIconButton"`, `leftIcon="x-close"`, and `slot` set to `ProgressIndicator` (`thickness="16"`, `current`, `total`).
- `MascotSlot` at `size="2XL"`.
- `ResponseBubble`:
  - `showVerdict` is on after judging. `verdictTone` reports what the student just did: `Correct`, `Partial` or `Incorrect`, and no chip after "I don't know" or a clarifying question.
  - `showAction={false}`, since "Explain more" is reserved.
  - `body` and `body2` carry the text.
- `ChatInput`: `onSend`, `onValueChange`, and `Status="Loading"` while judging.
- `Button` Text for "Use my voice instead", and Primary L for "Next question" after a verdict or answer.

**Not in the library**
- Figma draws this screen with `Text Field` and a separate Send `Button`, not `ChatInput` (see Open).
- The leave-confirm sheet (`bottomSheet`).

**Actions**
- **Send:** thinking, then one of:
  - correct → verdict;
  - partial or miss → the next hint, or the answer after hint 2.
- **I don't know:** the next rung with no judging (see Open on whether the typed screen has it).
- **Use my voice instead:**
  - `/recall/[round]/[term]` if mic permission was granted;
  - `/recall/[round]/mic-denied` if it was denied.
- **Next question:**
  - `/recall/[round]/[term+1]/typed`, since typing sticks for the rest of the session;
  - after the last term, `/recall/[round]/summary`.
- **X:** the confirm sheet.
  - Leave → `/plan`, with the current term and rung saved.
  - Stay → closes the sheet.

### 7. Voice turn

**Route:** `/recall/[round]/[term]`, in `src/app/recall/[round]/[term]/page.tsx`

**States**
- **Idle:** "Tap to answer", with the helper "Even a partial answer is a great start".
- **Start over:** after a discard ("No harm done, go again").
- **Didn't catch that:** a scripted unclear take.
- **Recording:** "Listening...".
- **Transcribing:** about 1s.
- **Transcript:** read-only, with Send and Discard.
- **Thinking.**
- **Thinking, slow:** at 4s.
- **Error:** past 10s, with retry.
- **Verdict:** correct.
- **Hint 1:** "Give it another try".
- **Hint 2:** "Last try, two hints".
- **Answer shown.**
- **Say it back:** recording.
- **Say it back:** acknowledged.
- **Leave confirm.**

Every animated state has a reduced-motion form, where the helper label carries the state.

**Components**
- `Scaffold`.
- `AppBar` with `variant="leftAndRightIconButton"`, `leftIcon="x-close"`, and `slot` set to `ProgressIndicator` (`thickness="16"`, `current`, `total`).
- `MascotSlot` at `size="2XL"`, using `standby` and `thinking` while judging (the other expressions are in Open).
- `ResponseBubble`, following the same verdict rules as the typed turn.
- `ButtonIcon` with `variant="Tertiary"`, `size="M"` and `label` for Discard. The glyph is whatever Figma's instance carries.
- `Button`:
  - Tertiary M "I don't know the answer";
  - Primary L "Next question";
  - Text L "Practice in my own words";
  - Text for "Type instead".

**Not in the library**
- **The push-to-talk control:** Figma calls it `recordingControl`, and design-system.md names the gap `voiceInput` (see Open). This blocks the screen.
- **The transcript container:** `noteCard` neutral, which isn't in code and has no Figma frame.
- **The leave-confirm sheet:** `bottomSheet`.
- **`bottomNav`:** Figma shows it on idle, recording and processing only (see Open).

**Actions**
- **Tap the control (idle):** recording. On the first use in the app, the mocked iOS mic prompt comes first.
  - Allow → recording.
  - Don't Allow → `/recall/[round]/mic-denied`.
- **Tap the control (recording):** transcribing, then the transcript. If the script says unclear, it goes to "didn't catch that" instead.
- **Discard** (from recording, the transcript or thinking): Start over. It uses no hint and doesn't advance the script.
- **Send (transcript):** thinking, then one of:
  - correct → verdict;
  - partial, miss or clarifying question → the next hint;
  - still wrong after hint 2 → answer shown.
- **I don't know the answer** (idle and hints): the next rung, with no transcript or judging.
- **Type instead:** `/recall/[round]/[term]/typed`, and input mode is set to typing for the rest of the session.
- **Retry (error):** judges the same take again, with no new recording.
- **Next question** (verdict or answer shown):
  - `/recall/[round]/[term+1]`;
  - after the last term, `/recall/section/summary` or `/recall/review/summary` or `/recall/eve/summary`.
- **Practice in my own words** (answer shown): say it back. Tap the control to finish, then Knowie acknowledges, then Next question. Nothing is recorded, and Discard returns to answer shown.
- **X:** the confirm sheet.
  - Leave → `/plan`, saving the term and rung. Any take in progress is dropped.
  - Stay → closes the sheet.

### 8. Section intro tray

**Route:** `/plan/[section]/intro`, where `section` is `plate-tectonics`

**States**
- The tray over the plan.
- The mocked iOS mic prompt. It only appears if Start is the first mic use, but see Open on whether the prompt fires here or on the first tap of the control.

**Components**
- `Scaffold` with `showBottomSheetBackground`.
- `MascotSlot` at `size="2XL"`.
- `Button`: Primary L "Start" and Text L "I can't talk right now".
- Behind the tray, the plan as on screen 9.

**Not in the library**
- `bottomSheet`.
- Bottom-sheet App Bar.
- The mocked iOS permission alert.

**Actions**
- Start → mic prompt (first time), then `/recall/section/1`.
  - Don't Allow → `/recall/section/mic-denied`.
- I can't talk right now → `/recall/section/1/typed`.
- Dismiss the tray → `/plan`.

### 9. Exam plan home

**Route:** `/plan`

**States**
- **Day 1:** the Plate Tectonics voice node is `next`.
- **Section done:** that node is `done`.
- **Review day:** "See what stuck" is `next`, seeded by `?day=review`.
- **Plan complete, test tomorrow:** the path collapses into the "Plan complete" card with the warm-up reminder, seeded by `?day=eve`.

**Components**
- `Scaffold`.
- `PlanNode` (`state` done, next or todo; `tone="blue"`; `size="M"`).
- `MascotSlot` at `size="2XL"`.
- `Button` Primary L "Warm up now".
- `IconSlot`.

**Not in the library**
- `Tabs`.
- `bottomNav`.
- `sectionRow`.
- The plan-home `topBar`.
- `noteCard` (outlined with badge, for the plan-complete card).

**Actions**
- Plate Tectonics voice node → `/plan/plate-tectonics/intro`.
- See what stuck node → `/recall/review/confidence`.
- Warm up now → `/recall/eve/1`.

### 10. App home

**Route:** `/`, in `src/app/page.tsx`

**States**
- **Default:** a study reminder, "Your Earth and Space Science exam is in 6 days".
- **Exam-eve reminder:** "Your test is tomorrow", seeded by `?day=eve`.

**Components**
- `Scaffold`.
- `MascotSlot` at `size="2XL"`.
- `Button`: Primary M "Continue studying", or Primary L "Warm up now".
- `ListItem` with `variant="Outlined Compact"` and `trailing="None"` (Dream College).
- `Chips` at `size="M"` with a left icon, as quick actions.
- `IconSlot`.

**Not in the library**
- The app-home `topBar` and its counters.
- `bottomNav`.
- The Ask Knowie bar.
- The `art/*` assets that aren't in `public/images/`.

**Actions**
- Continue studying → `/plan`.
- Warm up now → `/recall/eve/1`. That's a shortcut straight into the repeat, not the plan.
- Everything else on the page is inert.

---

## Out of scope

From `docs/sprint-context.md` → Not building:
- **Recognition and judging:** real speech recognition or judging, and fluency or halting detection.
- **Voice behaviour:** Knowie speaking, pause and resume, interruption and auto-pause.
- **Failures and disputes:** real network and hardware failures (the 10s error is scripted) and disputing a verdict.
- **Flow features:** skip, XP, notification plumbing, and plan onboarding (the before-plan confidence rating is mocked).
- **Other surfaces:** recall on flashcards, uploaded notes, mock-exam misses, AI Chat or Focus Mode.
- **Other platforms:** light mode, tablet, desktop and Android.
- **Other:** German copy and plan pacing changes.

Also:
- An editable transcript.
- A transcript anywhere after judging.
- Any recording UI inside `ChatInput`.
- `SummaryCard` tone `Skipped` and `VerdictChip` tone `Skipped`, which this flow doesn't use.

---

## How the mocked recall behaves

**Nothing listens.** Tapping the control starts a visual recording state and tapping again stops it. No audio is captured and no model is called.

**Mic permission** is a mocked iOS alert, shown on the first mic use in a browser session.
- The choice is stored in `sessionStorage`.
- Denied is permanent for the session, because the OS can't re-prompt.

**Every term has a script** in `src/mock/terms.ts`: an ordered list of steps, one per judged answer.
- Each step is `correct`, `partial`, `miss`, `unclear` or `question`.
- Each step has transcript text and an optional delay override.
- The pointer advances only when a verdict is shown. Discards, cancelled waits, unclear takes and "I don't know" don't move it.

**Plate Tectonics section round script (3 terms)**

| Term | Steps | Also shows |
|---|---|---|
| 1 | correct | — |
| 2 | partial → correct | Slow beat (over 4s) on the first judgement |
| 3 | miss → miss → miss | Error (over 10s) on the second judgement, then answer shown, then say it back |

**Timing**
- Transcribing takes about 1s.
- Judging takes "a few seconds" and stays under 4s unless a step overrides it.
- A slow step resolves between 4s and 10s.
- An error step passes 10s and shows retry. Retry re-runs the same step at normal speed.

**Outcomes:** each term writes one row when it ends.
- `correct-without-help`: correct on the first attempt.
- `needed-a-hint`: exactly one hint, then correct.
- `needs-practice`: two hints then correct, or answer shown.

Every row carries `termId`, `round`, `outcome`, `mode` (voice or typed, logged but never shown) and `lastSeenAt`.

**Summaries** count rows and nothing else. Say it back and the practice retries write no rows.

**Resume:** after X and Leave, the session stores the term and rung. Returning to that round's route reopens the same term at the same hint, idle.

**Input mode:** typing sticks within a session. A new round starts on voice.

**Review and exam eve** are separate entry links with seeded data:
- `/plan?day=review` seeds 10 review terms with `lastSeenAt` six days back.
- `/plan?day=eve` and `/?day=eve` seed 12 repeat terms.

The tester's own section-round rows persist in `sessionStorage` and are merged in, so their outcomes feed the review selection and the comparison.

**Selection:** weakest first (needs practice, then needed a hint, then correct without help), applied over the seeded list. The exam-eve repeat uses each term's second wording (`promptB`).

**Confidence:** the before-plan rating is a constant in mock data, and the pre-review rating comes from screen 5. The review summary picks one of nine copy versions from the direction of each change: confidence up, same or down, against performance (section-round rows vs review rows) up, same or down.

---

## Verification

Someone checks this is done and correct in this order. Every step must pass, and any gap in **Open** that blocks a screen is reported rather than worked around.

### 1. Build and code hygiene
1. `npm run lint` passes, and `npm run build` completes with no type errors.
2. `npm run tokens` leaves `build/css/tokens.css` unchanged, which shows nobody edited it by hand.
3. In `src/app/` and `src/mock/`:
   - no bare hex (`#[0-9a-fA-F]{3,8}`);
   - no px literal outside a token;
   - no `var(--…, …)` fallback;
   - no `:hover` rule;
   - no title-case labels.
4. Storybook's test run (Vitest addon, including a11y) passes for every component in `src/components/`. No new component was added to fill a gap.
5. Every component prop used by a page appears in that component's Storybook docs or stories.

### 2. Setup for the walkthrough
- `npm run dev`, then Chrome devtools device mode at iPhone 13 (390×844) with dark scheme.
- Clear `sessionStorage` before each path.

### 3. End-to-end paths
Each path is walked by tapping only, with no URL typing except the seeded entry links.

1. **Happy voice path.**
   - `/` → Continue studying → `/plan` → Plate Tectonics voice node → tray → Start.
   - Allow on the mic prompt.
   - Term 1: record → transcript → Send → Correct verdict → Next question.
   - Term 2: Partial chip → Hint 1 → the slow beat appears after 4s → Correct.
   - Term 3: Try again → Hint 2 → the error appears after 10s → Retry → Answer shown → Practice in my own words → acknowledged → Next question.
   - Section summary shows 1 / 1 / 1, and the headline count equals the `Good` card's rows.
   - Continue → `/plan`, with the node `done`.
2. **Discard and unclear.**
   - Discard from recording, from the transcript and from thinking. Each lands on Start over, and the progress bar and script pointer don't move.
   - A scripted unclear step lands on "didn't catch that".
3. **I don't know.**
   - On idle, it goes to Hint 1 with no transcript, no thinking and no chip.
   - On Hint 2, it goes to Answer shown.
   - The term's row is `needs-practice`.
4. **Typed route.**
   - From the tray, I can't talk right now → typed turn. Complete term 1.
   - Next question stays typed.
   - Use my voice instead → voice turn.
   - The typed row's outcome matches the voice script. `mode` is logged and never rendered.
5. **Denied.**
   - Clear storage, tray → Start → Don't Allow → mic denied → Type instead → typed turn.
   - Use my voice instead → mic denied again.
6. **Leave and resume.**
   - On Hint 2, X → confirm → Leave → `/plan`.
   - Re-enter the voice node → the same term, Hint 2, idle.
   - X → Stay closes the sheet with nothing lost.
7. **Review.**
   - `/plan?day=review` → See what stuck → confidence check (Start disabled until a position is chosen) → 10 terms → review summary.
   - The headline states the count and the gap. Same-day terms show "still fresh".
   - The comparison copy matches the direction of the seeded before-plan rating vs the chosen rating, and of section vs review performance.
8. **Exam eve.**
   - `/?day=eve` → Warm up now → 12 terms using `promptB` → repeat summary.
   - `NeedsPractice` is fully open, and `Good` shows 3 rows then "N more", which expands.
   - Finish → `/plan` in complete mode.

### 4. Platform constraints, on every screen
- **Targets:** every tap target is at least 44×44 (inspect the box).
- **Thumb zone:** primary actions are in `bottomContent`.
- **Safe areas:** nothing sits under the status bar or home indicator.
- **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, recording, transcribing, thinking and the slow beat are still distinguishable by label, with no motion.
- **String expansion:** with every mock string temporarily 40% longer, nothing clips or overlaps and `middleContent` scrolls.
- **Fonts:** Greed renders with its OpenType features on (the `Foundations/Type` → `Scale` story passes).

### 5. Data correctness
After path 1, the rows in `sessionStorage` are exactly three, one per term, each with one of the three outcomes. Every number on every summary can be recounted from those rows by hand.

---

## Open

Undecided, or a gap that blocks a screen. None of these is decided in this spec.

**Components missing from the library** (reported, not built):
1. **Push-to-talk control.** Figma's component is `recordingControl`; `docs/design-system.md` names the gap `voiceInput`. Which name it gets, and its states. This blocks screens 7 and 8's recording path.
2. **Idle "Tap to answer" control.** It's a bare `IconSlot` at 500 in Figma with no tap target, so it's part of 1 or separate.
3. **Transcript container.** It's `noteCard` neutral, which isn't in code. There's no Figma frame for the transcript step, and the Send and Discard layout is undecided (`buttonGroup` isn't in code either).
4. **`bottomSheet`** for the intro tray and the leave confirm. Also Bottom-sheet App Bar.
5. **`answerOption`** for the confidence check. Only three of the five labels are known: "So cooked", "Mostly solid", "Most of it".
6. **The mocked iOS mic alert:** its component name and its copy.
7. **Summaries:** `noteCard`, and `textBlock` for headlines and group labels. There's no component for "How you felt".
8. **App home and plan home chrome:** `Tabs`, `bottomNav`, `sectionRow`, both `topBar`s, and the Ask Knowie bar. These need building, or the two screens need a different treatment in the prototype.
9. **Glyphs missing from `IconSlot`:** `zap` (turn app bar, right) and `clipboard-check` (summary note).

**Conflicts between Figma, docs and code**
10. **Typed turn input:** Figma uses `Text Field` with a Send `Button`, while `docs/design-system.md` says `ChatInput`. Does the typed screen also have "I don't know the answer"? Figma doesn't show one.
11. **`bottomNav` on turn screens:** it appears on idle, recording and processing, but not on verdict, hints or answer shown. Keep it throughout or remove it?
12. **The `zap` icon** on the turn app bar's right: what it does, given that XP is out of scope.
13. **`SummaryCard` `Good` header:** the code says "GOOD EXPLANATIONS", while Figma's section and review summaries say "CORRECT WITHOUT HELP".
14. **Row limit:** `SummaryCard` shows at most three rows plus overflow. A 5-term section round with everything open doesn't fit.
15. **Mic prompt timing:** on tray Start (Figma note) or on the first tap of the control?

**Flow**
16. **Practice retries:** where "Try the ones you missed" and "One more try at the misses" go, which ladder they run, and where they end.
17. **Mic denied screen:** its content, secondary action, and whether it explains how to re-enable in Settings.
18. **Leave confirm:** its copy and button labels.
19. **Failure beats:** copy and Figma frames for the 4s beat, the 10s error and retry, "didn't catch that", and the say-it-back acknowledgement.
20. **`MascotSlot` expressions** for each turn state beyond `standby` and `thinking`.
21. **Review node:** does "See what stuck" open a tray like the section node, or go straight to the confidence check?

**Mock**
22. Exact judging and transcribing delays.
23. The thresholds for "same" on confidence and performance, and the nine comparison copy versions.
24. The seeded review and exam-eve term lists, both wordings, the timestamps, and the before-plan rating value.
25. The format of the entry links (`?day=review`, `?day=eve`).

**Before hosting**
26. The Greed trial licence hasn't been checked for web use. Nothing is hosted or deployed until it is.
27. No component has a focus state (a WCAG 2.2 gap).
