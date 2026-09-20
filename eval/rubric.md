# Rubric: Explain it to Knowie

For grading the prototype in this repo: the Next.js app under `src/app/`, the components in `src/components/`, and their stories. Grade the built thing, not the docs describing it.

Sources the anchors draw on:

- `docs/sprint-context.md`: the concept and the decisions. Only the second pass may claim learning, completion is not mastery, and every number is a count.
- `docs/design-brief.md` → Hard constraints: voice in and text out, push-to-talk with explicit send, never trap the student, judge generously, expect a wait.
- `docs/voice-ux.md`: the six principles and the "States to design" table.
- `docs/design-system.md`: the component index, How things behave, Never, Known gaps.
- `SPEC.md`: the per-screen states and the Verification walkthrough.

---

## How to score

Each dimension is scored 1 to 10. The anchors at 4, 6 and 9 are fixed points; score between them by judgement.

| Dimension | Weight | Multiplier |
|---|---|---|
| System fidelity | High | 3 |
| Coherence | High | 3 |
| Craft | High | 3 |
| UX judgment | High | 3 |
| Accessibility | Medium | 2 |
| Structure | Low | 1 |

Overall = sum of (score × multiplier) ÷ 15, to one decimal place. Report every dimension score next to the overall number. A strong average can hide a weak High dimension, and the weak dimension is the more useful thing to know.

### Scoring rules

1. **"Looks good" is a 6, not a 9.** A 9 survives a senior critique untouched: a design lead could walk every path and find nothing to send back. If you can name a change you would ask for, the score is not a 9.
2. **8 or above needs verification by rendering, measuring or testing, never by reading code.** Reading `VoiceInput.tsx` and seeing a reduced-motion branch proves nothing. Emulating `prefers-reduced-motion` and watching the states proves it. Every score of 8 or above names its evidence: the path walked, the element measured, the tool output. If there is no evidence, the score is 7 at most.
3. **Known gaps are not deductions. Documented decisions are.** A gap listed in `docs/design-system.md` → Known gaps or `docs/component-gaps.md` that is reported and left alone is correct behaviour. Deduct when a gap is hidden, worked around silently, or filled with an invented component or token. A *decision* recorded in SPEC.md or `design-system.md` is not a gap and carries no exemption: if it breaks an anchor it still costs points. Writing a choice down explains it; it does not excuse it, and "spec-decided" is not a reason to withhold a deduction.
4. **Out of scope is not missing.** Nothing under `docs/sprint-context.md` → Not building earns credit or costs points. Building it anyway costs points under UX judgment, because it means the cut list was not respected.
5. **Gates come first.** Check the hard gates at the end of this file before scoring. A failed gate fails the prototype whatever the dimension scores. Still record the scores, marked as failed.
6. **Emulation is not evidence for device behaviour.** Device mode and Playwright simulate a viewport, not an operating system. They do not reproduce iOS Safari's zoom on a focused field under 16px, the software keyboard's insets, or a non-zero `env(safe-area-inset-*)` on a notched device. A pass in emulation is not evidence for any of these: check them on hardware, or list them as unverified. Added after a tester hit a layout fault on a phone that every emulated render showed as correct.
7. **Some things the panel cannot see.** These are human checks, and a critic should list them as unchecked rather than score them. A score of 8 means 8 on what was visible to the grader.
   - Whether a cue reads as "listening", or as any other state, to someone who has not seen the other states.
   - Optical balance: an illustration's bounding box can be centred while the figure reads off-centre.
   - Whether copy sounds like a person wrote it. An agent is the worst judge of this, being the source of the register.

---

## Calibration reference

Katie's hand scores on the build at `f392a03`, 2026-09-19, across the voice turn, the typed turn, the section intro tray, the exam plan home and the three summaries. Overall 6.3.

**These are worked examples of severity, not a list of known issues.** The anchors above say what counts as a fault; this says how hard one weighs. When a critic is torn between two scores, it compares the build in front of it with the row below and asks which is closer. The faults named here may since be fixed — do not go looking for them, and do not read their absence as credit.

| Dimension | Score | What that score looked like |
|---|---|---|
| System fidelity | **5** | Icons don't match the system across the build: wrong colour, wrong stroke treatment, and in places the wrong glyph altogether — while every value behind them traced to a token and `check-tokens` passed. Getting the provenance right does not make it a 7 if the screen is wrong. |
| Coherence | **7** | Knowie's size changes from screen to screen without the screen's job changing, and his placement tilts some layouts off balance. Copy that is accurate but has not had a human pass for clarity. |
| Craft | **7** | Uneven finish rather than broken rules: every behaviour rule holds, and nothing moves to direct attention. The "up next" plan node is the one thing on the path meant to draw the eye, and it is still. |
| UX judgment | **6** | A tester read the idle control as already recording, because it breathed and glowed the way the recording state does, and answered a full question into a control that had never started. The idle label said what to do; he never read it. The screen was at his mouth to talk, so nothing on it could have told him. |
| Accessibility | **7** | No focus state anywhere. It is a logged, deliberate deferral, so it is not hidden — but it is still absent, and a keyboard user still has nothing. |
| Structure | **6** | On a real phone the typed turn's field triggered iOS Safari's zoom, which shifted the pinned layout so the send button sat off-screen and dead. A tester could not submit without assistance. Every emulated render of the same screen was correct. |

---

## 1. System fidelity (High)

**What it scores:** whether every value traces back to `tokens/tokens.json` and every component comes from the library in `src/components/`, used only through props that are documented or shown in a story.

**How to check:** run `node scripts/check-tokens.mjs`. Grep `src/app/` and `src/mock/` for px literals, `var(--…, …)` fallbacks and primitive reads. For each screen, list the components it uses and compare them with SPEC.md's Components for that screen. Pick five values in the rendered page and trace each through `build/css/tokens.css` to its token. Then look at the icons on the rendered page, which no token trace reaches: for each one, check the glyph against what `design-system.md` → Icons and the screen's spec name, check its colour against the inheritance rule (icons take the surrounding text's or the component's `on*` colour, never their own token, with the one leading-icon accent exception), and check its stroke weight against its neighbours. A glyph can be the wrong drawing, the wrong colour and the wrong weight while every value behind it traces perfectly.

- **4:** Raw values in several places: a loose `12px` gap, an `rgba()` scrim, a duration typed as `300ms`. Some screens hand-roll what a component already does, for example a verdict drawn as a styled `span` instead of `VerdictChip`, or a second primary drawn as a custom pill. A prop is used that no story shows. Scale groups are misread, so `Icon/400` is used where `Radius/400` was meant. On the rendered page the icons do not match the system: a glyph the spec does not name, an icon carrying its own colour token instead of inheriting, or stroke weights that differ between icons sitting side by side.
- **6:** The token check passes and the named components are used on every screen. The gaps are the forgivable kind: an inline pattern that now appears twice without being logged in `component-gaps.md` (the way `knowiePrompt` is logged), a primitive read directly in one place, or a size snapped to the nearest step instead of reported as missing.
- **9:** Five of five sampled values trace to the correct token layer for their scale, and the trace was done in the rendered DOM, not in source. Colour has two layers, so a colour traces to a semantic token; space, radius, control, stroke, icon, illustration, elevation depth, opacity, scale, size and font are one layer by design (`design-system.md` → Never), so those correctly read a primitive and a "semantic" reading is not available for them. Every rendered icon carries the glyph its spec names, inherits its colour, and matches its neighbours' stroke weight. Every inline pattern is logged in `component-gaps.md`, and anything used twice has been promoted or flagged. New tokens (`Stroke/Bold`, `motion.duration.spin`) were added through `tokens.json` with `design-system.md` updated in the same pass. Reduced motion is the `$extensions` mode, not a parallel set of values. No component was invented to fill a Known gap.

## 2. Coherence (High)

**What it scores:** whether the ten screens read as one product, one recall loop in three places, or as screens that were built separately.

**How to check:** walk SPEC.md → Verification paths 1, 7 and 8 back to back. Compare the section round, the review round and the exam-eve repeat, then the three summaries side by side. Then read every action label cold, before tapping it, and say what you expect to happen next. Compare that with what happens. A label that is clear but promises the wrong thing is the harder fault: "Start" on the section intro tray reads as "start recording", and a tester lifted the phone to his mouth because of it.

- **4:** The voice turn and the typed turn look like two apps. The switch to typing ("Type instead" or "Use my voice instead") sits in a different place on each. The summaries each invent their own layout for counts. Knowie's size changes between screens without the screen's job changing — Knowie is meant to be sized for what he has to communicate, so the fault is unmotivated variation, not variation. An action label promises something other than what happens next. One screen uses capitals or a tone that no other screen uses.
- **6:** Same components and spacing throughout, and it clearly is one product. But the framing does not change between rounds: the section summary and the review summary sound equally confident, so the concept ("only the second pass is allowed to claim the student has learned anything") is in the docs but not on screen. Or the mode switch holds its position but differs in treatment.
- **9:** The loop is recognisably the same in all three rounds, and each round is framed for what it can honestly claim. The section summary says completion, not mastery. On the review summary the count sits with the rows it counts, and the gap, or "still fresh" on the same day, is where the student lands rather than somewhere on the screen. The exam-eve summary leads with the work left. Every action label names what happens next. The three outcome categories are named the same way on every screen. The typed and voice turns share the ladder, the verdicts and the position of the mode switch. The leave confirm, the mic prompt and the tray use one sheet language. A tester walking all three rounds never has to relearn anything.

## 3. Craft (High)

**What it scores:** spacing, rhythm, states, and the small deliberate decisions, judged against this system's own behaviour rules rather than general taste.

**How to check:** in device mode at 390×844, press every control and watch it. Step through every `VoiceInput` state. Measure the gaps between Knowie, the bubble, the ring and the escapes. Compare entrance and exit timings. Then report three distributions rather than three verdicts, because unevenness is measurable where finish is not. **Motion:** first compare what each component's spec says should move against what actually declares a transition or animation, because a state specified to move and left still is a fault whichever way the distribution runs — `planNode`'s `next` is the only state on the path meant to move, so its stillness is invisible to any comparison with its siblings. Then look at the spread: a component with no motion at all, beside siblings that have some, is the other kind of outlier. **State difference:** how much each state differs from its neighbour as a share of the rendered pixels, since a state that differs from its sibling only in text is the 6 anchor's "finished last". **Space:** per screen, the gaps between blocks and the empty space above and below the content, measured against the content they separate, because a void that is large relative to what it separates is a composition fault whatever produced it. Outliers in these are the evidence. Whether an outlier is deliberate is not a call a grader can make from the numbers: report it and say so.

- **4:** Controls change colour when pressed instead of sinking by the lip. A lip has been removed somewhere to look flatter. The judging wait is a bare spinner. The error state is red, which reads as a wrong answer. The error copy says "try again", which is the miss verdict's label. Rhythm is uneven: the spacing between Knowie, the bubble and the ring changes from state to state for no reason.
- **6:** Press is geometry and the lip is intact. The states exist and are distinguishable. But the transitions between them are abrupt: the transcript appears instead of growing out of the ring, or exits run at the same speed as entrances. Or the finish is uneven — one part of the build has had less attention than its neighbours, and conforms to every rule while doing it. A state that is its sibling with the label changed (say-it-back drawn as idle), a state its spec says should move that was left still, or a screen where nothing directs the eye at all.
- **9:** Every rule in `design-system.md` → How things behave holds on inspection. Press sinks by the lip depth at `motion.duration.instant`. Exits run about a third faster than entrances. One `accent/brand/bold` line carries idle through judging and grows into the transcript card. The slow beat at 4 seconds is a visible change (dashes at `spin-slow`), not a relabel. The error is grey with `refresh-cw-01`, and "Tap to send again" re-runs judging on the same take. No check mark appears anywhere in the control. The glow is a shape, not an effect. Spacing between Knowie, the bubble and the control holds across all sixteen voice-turn states. The level of finish is even: no screen, state or component looks like it was done last, and the three distributions above have no unexplained outlier. Every one of these was watched in the browser, not read in CSS.

## 4. UX judgment (High)

**What it scores:** whether the states are handled, the hierarchy is clear and the failure paths are designed. The anchors come from the six principles in `voice-ux.md` and the hard constraints in the brief.

**How to check:** tick off every Must row in `voice-ux.md` → States to design, and every state listed under Voice turn in SPEC.md, in the running app. Walk paths 2 to 6 (discard and unclear, I don't know, typed, denied, leave and resume). Then two more passes.

**What does a wrong read cost?** For each state, ask what a student does if they read its cue as "something is happening", and whether that action fails. On the mic control the wrong read costs a whole spoken answer into a control that never started; on a plan node it costs nothing, because the misreading and the correct reading both end in a tap. `design-system.md` says per component which states run in real time, so this is checked against the spec, not guessed.

**With the keyboard up.** On every screen with a text field, cut the viewport height roughly in half to stand in for the software keyboard. The primary action must stay on screen and enabled, and whatever the student is responding to must stay visible or reachable without leaving the field. Do the same wherever content can grow: twelve summary rows must scroll `middleContent`, not push the primary action off the screen.

- **4:** One or more Must states is missing or dead-ends. Permission denied leaves the student stuck. The wait has no status. Discard sends the take anyway. The student is trapped somewhere: no route to typing, or X leaves without a confirm. A resting state wears a live state's cue, so the student acts before the system is ready — an idle control that glows, breathes or ripples the way the recording state does. The student cannot finish the turn in the layout they actually get: with the keyboard up the primary action is off the screen or disabled, or the question being answered has scrolled away. A hinted pass is counted as unaided on a summary, or a summary shows a score that cannot be recounted from the rows.
- **6:** Every Must state exists and every path completes. But the hierarchy wobbles: two actions compete for primary on a screen, "I don't know" is louder than the voice control, or the denied screen routes to typing without saying how to turn the mic back on. The failure beats are there but read like system messages rather than Knowie.
- **9:** All six `voice-ux.md` principles are visible on screen.
  1. Status is unmistakable at each of idle → listening → transcribing → transcript → judging → result, and stays so with motion reduced. Each state has one available reading: nothing at rest borrows the signal that means the system is working, and a wrong read of any cue costs the student nothing.
  2. The student owns start and stop, and discard from recording, the transcript or the wait always returns to idle without spending a hint.
  3. The mic prompt fires from Start in context, never cold. Denied has its own screen, which explains what is lost and how to re-enable, and offers typing.
  4. The transcript separates "misheard" from "didn't know". It is read-only, and an unclear take costs no hint.
  5. Typing is one tap from every idle state and runs the same ladder in-session.
  6. The wait is covered at 0, 4 and 10 seconds.

  Outcomes stay honest: hinted never merges into unaided, every summary number recounts from `sessionStorage` rows, and practice retries change no rows. Overconfidence is named where the student lands, not below the fold, and underconfidence gets its evidence under the claim rather than in place of it. Every primary action stays reachable with the keyboard up and at twelve rows. Walked by tapping, per SPEC.md → Verification §3 and §5.

## 5. Accessibility (Medium)

**What it scores:** contrast, touch targets, and whether meaning ever rests on colour alone. Also reduced motion and assistive-tech naming, since the system commits to both.

**How to check:** measure contrast on rendered text, including the `text/secondary` and `text/tertiary` pairs and the verdict chip labels on their `feedback/*/bold` fills. Inspect the box of every tap target. Emulate reduced motion. Run the Storybook a11y addon and read the violations. It is set to `test: 'todo'`, so a passing run does not mean zero violations.

- **4:** Body copy fails 4.5:1 somewhere. Targets under 44 exist, for example a hug-width text button or the app bar's text action. Verdicts are told apart only by chip colour. With reduced motion, recording and judging look the same. Knowie's image, the ring or the progress bar has no accessible name.
- **6:** Contrast and targets pass. Every verdict chip carries a glyph and a label as well as its tone. Reduced motion collapses the durations. But there are soft spots: the 9px Caption S progress label and 12px XXS chips (flagged in the tokens) are used where they carry meaning, live-region announcements are missing for state changes, or a11y violations are sitting unread in the todo list.
- **9:** Measured contrast for every text/background pair on every screen. Targets inspected at 44 or more everywhere, including `ButtonIcon` S and M wrappers and the confidence slider's row. Every state difference is carried by shape, icon, label or motion as well as colour, and the error being grey rather than red is deliberate. `VoiceInput`'s label is a live region that names the state on its own with motion reduced. Sub-minimum type is `aria-hidden` with the meaning moved to `aria-valuetext`. The a11y addon's violations list was read and is empty or triaged. The missing focus state is reported as the known WCAG 2.2 gap, not hidden.

## 6. Structure (Low)

**What it scores:** whether the layout holds together and the thing renders. Whether the student can reach the primary action in the layout they actually get belongs to UX judgment, not here: it is a question about finishing the turn, not about the build.

**How to check:** `npm run lint`, `npm run build`, `npx vitest run --project=storybook`. Load every route in device mode. Test with strings 40% longer.

- **4:** The build fails or a route crashes. Content sits under the status bar or the home indicator. `bottomContent` scrolls away. The page scrolls sideways at 390.
- **6:** Everything builds and renders, and the safe areas hold. But a 40% string expansion clips a button label or overlaps the bubble and the ring.
- **9:** Lint, build and the Storybook run are clean. Every route renders from a tap-only walk. Greed loads with its OpenType features on (the `Foundations/Type` → `Scale` story passes). At +40% strings nothing clips and `middleContent` scrolls. `npm run tokens` leaves `build/css/tokens.css` unchanged.

---

## Hard gates

Pass or fail, checked before scoring. One failure fails the prototype.

### 1. Body text contrast at 4.5:1 or more

Every body-size text/background pair, measured on the rendered page, not computed from token names. Include `text/secondary` and `text/tertiary` on `background/page` and `background/surface`, verdict chip labels on their fills, and helper lines under the voice control. Large text (24px, or 18.66px bold) may use 3:1.

### 2. Touch targets at 44pt or more

Every element that responds to a tap has a hit box of at least 44×44 CSS px, inspected in the browser. The hit box is the wrapper, not the drawn pill: `Button` S and M draw 32 and 40 inside a `Control/1200` wrapper. Decoration that responds to nothing, such as the `topBar` counters and the inert bottom nav tabs, is exempt.

### 3. No raw hex in component source

`node scripts/check-tokens.mjs` exits 0. It scans `src/` for `.ts`, `.tsx` and `.css`, and skips `foundations/` only. Report any finding; do not fix it during grading.

### 4. No two states that should differ render identically

Screenshot each pair below (with motion reduced where noted) and compare them. Identical renders fail the gate. A difference only in timing or motion does not count as a difference when motion is reduced.

- `VoiceInput`: idle / start over / didn't catch that (the helper line must differ).
- `VoiceInput`: transcribing / judging, and each with its slow beat, with motion reduced (the label must carry the state).
- `VoiceInput`: listening / say-it-back listening.
- `VoiceInput`: error / idle.
- Voice turn: hint 1 / hint 2 / answer shown.
- `VerdictChip`: Partial / Incorrect.
- `Button` and `ButtonIcon`: Default / Pressed / Disabled, per variant.
- `ListItem`: Default / Pressed / Selected, per variant used on a screen. Knowunity's masters draw Transparent Selected and Filled Pressed identical to Default, so check that the build did not copy them.
- `SummaryCard`: correct without help / needed a hint / needs practice.
- Review summary: same-day ("still fresh") / after a gap, and the confidence comparison's up / same / down versions.
- `PlanNode`: done / next / todo.
- Confidence check: Start disabled / enabled.
- Any focusable control: focused / unfocused, using a keyboard. `design-system.md` records no focus state on any component and nothing in `src/` styles `:focus-visible`. Unless the browser's default ring survives, this pair fails. Record it as the known WCAG 2.2 gap.
