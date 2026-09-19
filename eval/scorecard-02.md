# Scorecard 02

Screens: voice turn, section summary, review summary, mic denied. Graded 2026-09-19 at 390px, dark mode.

Run notes
- HEAD at write time: `f392a03`. HEAD was `6ebf76d` when the session began, so a commit landed during the run.
- The working tree was not clean. Four files were modified while the run was in progress and I did not touch them: `src/app/layout.tsx`, `src/app/plan/[section]/intro/page.module.css`, `src/app/tour/page.module.css`, `src/components/Scaffold.module.css`. Two of them add a `(hover: none) and (pointer: coarse)` rule that shrinks the status-bar row. The state renders used touch emulation, so they may have picked it up. The critics' Playwright runs are not known to have.
- All four critics ran, each in its own context. Each prompt held only "Grade the prototype", a scope line naming these four screens, and (for craft and system) the command results. No critic saw another critic's output.
- I added the scope line at your request. The grade-prototype skill says to add nothing to the critic prompts, so this departs from it. The scope line carries no opinion or hint about quality.

## Total

**7.3 / 10.** (7×3 + 7×3 + 7×3 + 8×3 + 7×2 + 8×1) ÷ 15 = 109 ÷ 15.

No hard gate failed, so the total stands. Gate 4 has one unverified pair (see Gates).

Critic-ambition: **6**. It is reported separately and is not in the total.

## Per-dimension table

| Dimension | Critic | Score | Weight | Weighted |
|---|---|---|---|---|
| System fidelity | critic-system | 7 | 3 | 21 |
| Coherence | critic-ux | 7 | 3 | 21 |
| Craft | critic-craft | 7 | 3 | 21 |
| UX judgment | critic-ux | 8 | 3 | 24 |
| Accessibility | critic-craft | 7 | 2 | 14 |
| Structure | critic-system | 8 | 1 | 8 |
| **Total** | | | 15 | **109 → 7.3** |

The lowest High-weight dimensions are System fidelity, Coherence and Craft, all at 7.

## Hard gates

| Gate | Critic | Result |
|---|---|---|
| 1 Contrast | critic-craft | Pass. Lowest measured pair is 6.66 (review summary, NEEDS PRACTICE header). Voice turn contrast was measured on idle only. |
| 2 Touch targets | critic-craft | Pass. All measured boxes are at least 48×48. |
| 3 No raw hex | critic-system | Pass. `check-tokens` exited 0, and its own grep found no hex, rgb(), var() fallbacks or loose px in code. |
| 4 States that must differ | critic-craft | Pass for the pairs it checked. **Unverified:** listening vs say-it-back listening was not walked. |

## Command results (run once, before the critics)

- `node scripts/check-tokens.mjs`: exit 0. "No raw hex colours found."
- `npm run lint`: exit 0. No output.
- `npm run build`: exit 0. Compiled, TypeScript clean, 7 static pages generated.
- `npm run tokens`: exit 0. `build/css/tokens.css` had no uncommitted changes before, and `git diff --stat` shows none after.
- `npx vitest run --project=storybook`: exit 0. 29 files and 229 tests passed. There are no a11y todo or violation lines.

## State render comparison (before the critics)

78 screenshots at 390×844, dark mode, from an agent driving Playwright from Node with sessionStorage seeding. No crashes, no Next error overlay. Files are in the session scratchpad under `states/`, with contact sheets under `sheets/`. Nothing was fixed.

**Flags**
- **Mic denied "first" is byte-identical across section, review and eve, and to the prompt-deny route.** The same is true of "again" across all rounds and entry routes. The first and again states do differ from each other. There is no round-specific copy on this screen. This matches the spec, but it is a sameness worth knowing about.
- **The empty-round summaries never render.** `/recall/section/summary` with no rows redirects to `/recall/section/1`. `/recall/review/summary` with no rows redirects to the confidence screen. There is no empty state to compare.
- **Summary states clip at 844px.** The Scaffold body scrolls inside a fixed frame, so the cards sit behind the pinned action buttons. Full content is only visible in the 1700px re-shoots.
- **Invalid round:** `/recall/foo/mic-denied` gives the stock unstyled Next 404 (black, no Scaffold) and a console 404.
- **Same-day review claim:** `?fresh` renders it, but it cannot be reached by tapping.
- **Summary cards cannot be collapsed once opened.** There is no collapsed-after-open state.
- **All nine confidence × performance versions rendered** and every copy variant is distinct.
- **Voice turn hint 1 vs hint 2 differ by about 2%,** in bubble text and helper only. Reduced-motion variants differ from normal by 0.04–3%, mostly a spinner arc or a ring style. The reduced-motion verdict is identical to normal, which is plausible for a static state.
- **Identical pairs that are expected:** `has-misses` vs `typed-input-mode`, and `days-later-default` vs `no-section-rows` and `typed`.

## Findings

### critic-system (System fidelity 7, Structure 8)

1. **Mock timing constants are raw milliseconds in app code.**
   - Where: `src/app/recall/[round]/[term]/page.tsx:43-47` (`TRANSCRIBE_MS`, `JUDGE_MS`, `JUDGE_SLOW_MS`, `SLOW_BEAT_MS`, `ERROR_MS`) and `ReviewSummary.tsx:25` (`DAY_MS`).
   - Evidence: source read. They are mock-timing values set by SPEC, not design durations.
   - Fix: none needed if SPEC is the authority. Otherwise log them in `component-gaps.md`, or report that no token group covers mock timing (`mock.timing.*`) and stop.
2. **No semantic layer for space, radius, stroke or control size.**
   - Where: all of `src/app/**/*.module.css`, for example `review.module.css:9-59`, `mic-denied/page.module.css:8-22`, `summary/page.module.css:8-23`.
   - Evidence: `tokens.css` has no `--semantic-space` or `--semantic-radius` group, so every such value reads `--primitive-*`. This costs the "semantic layer only" 9 anchor.
   - Fix: report the missing aliases (for example `semantic.space.stack`, `semantic.radius.card`) and stop. Do not invent them.
3. **A hand-drawn surface card on the review summary.**
   - Where: `review.module.css:31-35` and `:54-59`, the "How you felt" panel and the reads boxes.
   - Evidence: `confidenceReads` is logged in `component-gaps.md`, but the outer `.confidence` panel is not clearly covered.
   - Fix: add a line to `component-gaps.md` naming the outer panel as part of `confidenceReads`, or confirm a `NoteCard` `tone="neutral"` wrapper covers it.
4. **Inline `style={{ '--fill': … }}`.** `src/app/recall/review/confidence/page.tsx:76`. Outside the scoped screens, and `answerOption` is logged. Fix: note it in the `answerOption` gap line if it is not already there.
5. **The Next dev badge overlaps "Try the ones you missed"** at the bottom-left of the summaries (`/tmp/knowie-critics/critic-system/page-2026-09-19T20-10-01-672Z.png`). Dev tooling only. No fix.

Measured evidence: body background, h1 colour, surface, border and radius traced to tokens in the DOM. `scrollWidth` 390 on all four screens. Twelve summary rows scroll inside `main` (`scrollHeight` 1582 vs `clientHeight` 644) while Continue stays pinned. Greed features at root: `"lnum","pnum","ss02","ss03","ss06","ss07"`. Twelve-row screenshot: `page-2026-09-19T20-10-29-140Z.png`. Mic denied at +40% strings: `page-2026-09-19T20-10-40-457Z.png`.

**Could not check:** a non-zero `env(safe-area-inset-*)`, whether Greed's features pass the `Foundations/Type → Scale` story, the voice turn's 16 states (idle only), and the summaries from a tap-only walk (seeded rows).

**Blind spot:** the pressed and disabled `Button` states, transitions, and every `VoiceInput` state other than idle. Anything that shows only on a notched device or during motion is missed.

### critic-craft (Craft 7, Accessibility 7)

1. **No entrance or exit motion outside `VoiceInput` and `BottomSheet`.**
   - Where: voice turn judging → verdict, and the mic prompt (`src/components/PermissionAlert.module.css`, no transition or animation). Screenshots: `/tmp/knowie-critics/critic-craft/page-2026-09-19T20-10-19-387Z.png` then `...20-10-20-798Z.png`.
   - Evidence: the swap is a hard cut, so there are no exit/enter pairs to hold to "exits about a third faster". Only 10 CSS files in `src/` have any transition.
   - Fix: give `PermissionAlert` and the `ResponseBubble` swap an entrance at `motion.duration.base` and an exit at `motion.duration.exit`, each reading the reduced-mode value.
2. **The trash button may be a focus trap in idle.**
   - Where: `VoiceInput`, idle. `Send answer` is `aria-hidden` and `inert`. The trash ("Discard and start over") has `tabIndex` 0, `visibility: visible` and `pointer-events: auto`.
   - Evidence: DOM inspection. The critic could not confirm it is hidden in idle and treats it as a possible duplicate control.
   - Fix: set `inert` and `aria-hidden` on the trash while `state` is idle, and only render or enable it in listening, transcribing, judging and transcript.
3. **The label and control shift about 26px between idle and transcript.**
   - Where: label `y=432` in idle and listening, about 406 in transcript (`page-2026-09-19T20-10-05-150Z.png`). Against "spacing holds across all voice-turn states".
   - Fix: anchor the label at a fixed offset above the ring and let the transcript card grow downward only, using `Space/1000`.
4. **Knowie has no accessible name on the voice turn and mic denied.**
   - Where: the `img` has `alt=""` and `aria-hidden` (96px on mic denied).
   - Fix: give `MascotSlot` its documented code-only `label` prop (`components-mascotslot--labelled`).
5. **Voice error path not walkable live.** The 10s error and its re-run were only seen in `components-voiceinput--error-state`. Recorded as a note, no fix needed.
6. **The review summary's action bar cuts through the NEEDS PRACTICE card at rest.**
   - Evidence: `contentinfo` takes 152px of 844 (two 56px buttons) (`page-2026-09-19T20-11-12-386Z.png`).
   - Fix: a fade or divider on `bottomContent`, or compress the "How you felt" block.
7. **Mic denied: about 300px of empty space above the buttons, and the only re-enable instruction is quiet.**
   - Evidence: the hint is 15px at contrast 7.26 (`page-2026-09-19T20-11-29-711Z.png`).
   - Fix: move the hint to body weight, or centre the block vertically in `middleContent`.
8. **Focus falls back to the browser's default ring.** The first Tab lands on the `main` scroll container. Recorded as the known WCAG 2.2 gap and not counted twice (`page-2026-09-19T20-13-19-147Z.png`).
9. **The error state is grey with `refresh-cw-01` and no "try again" in the label,** and no check mark appears in the control on verdict.

Measured evidence: `Button` press gives `matrix(1,0,0,1,0,4)` in 0.08s (0.001s with reduced motion). Gate 2 boxes, for example ring 120×120, send 48×48, trash 48×48, mic-denied buttons 358×56. `role=status` label and progressbar `aria-valuetext="0 of 3"` are present.

**Could not check:** entrance and exit durations, the live 4s and 10s beats, gate 4 pairs outside these screens, listening vs say-it-back listening, and voice-turn contrast beyond idle.

**Blind spot:** the 4-second slow beat and 10-second error in the live app, and the ring-to-card and card-to-ring motion. It cannot time animations frame by frame, so a jump in the transcript ring or an exit that is not a third faster would be invisible.

### critic-ux (UX judgment 8, Coherence 7)

Session data recounted by tapping. Section holds 3 rows (1/1/1) and matches the summary. Review holds 8 correct, 1 hint and 1 needs-practice and matches "8 of 10 correct without help". Eve holds 8, 3 and 1 across 12 rows and matches "4 of 12" and "8 of 12".

1. **Section summary does not say completion is not mastery.**
   - Where: `/recall/section/summary` (`section-summary.png`). The headline "Here's how it went" has no count, and nothing says the node is done whatever the outcome. The only framing is the note "will be in the review before your test".
   - Fix: add one plain line under the headline stating the count and that finishing the round is not the same as knowing it (for example, "this round is done; the review is where it counts"), in the existing headline style. Log it as a `textBlock` gap in `component-gaps.md`.
2. **A live "Streak" button is on every turn although XP is cut.**
   - Where: the app bar's right `zap` icon (`page-2026-09-19T20-15-11-202Z.png`). SPEC Open 12 calls it decoration.
   - Fix: remove the right slot from `AppBar` on the voice and typed turns, or render it inert with no button role and no "Streak" name.
3. **Voice and typed turns differ in Knowie size and in where the mode switch sits.** Typed uses Knowie XL and the switch under the input. Voice uses 2XL with the switch at the bottom. Both are spec-decided, so this is a coherence cost and not a violation (`...20-14-50-957Z.png` vs `...20-15-11-202Z.png`).
   - Fix: report it in `component-gaps.md`. Optionally move "Use my voice instead" into the row that matches where "Type instead" sits on voice.
4. **Review summary: the action buttons cover the NEEDS PRACTICE card on arrival** (`page-2026-09-19T20-21-20-499Z.png`).
   - Fix: keep the order. Surface the come-back note or the group name above the fold, or lower the `middleContent` bottom padding so the third card clears the buttons.
5. **Three count layouts.** Section groups are open with names, review Good is collapsed ("8 terms"), and eve uses a group-label row with "4 of 12". Each is spec-decided.
   - Fix: use the same "N of M" count on the review and section group headers as the eve one, in the existing `ExpandableSummaryCard` header.
6. **Mic denied says "this round is typed" but not what is lost** (`page-2026-09-19T20-14-40-989Z.png`). Otherwise it names the loss, gives the re-enable route (Settings, Knowunity, Microphone) and offers "Type instead" over "Back to plan".
   - Fix: add one clause to the Settings note saying voice recall is off until the mic is turned back on.

Must states built and walked: idle, recording, processing (0s, 4s, 10s error with retry on the same take), correct, partial, fail, answer shown, cancel and re-record, typed idle, mic primer and prompt, denied route (not a dead end), and "I don't know" as a button (not tapped).

**Could not check:** the leave-confirm sheet, the scripted unclear take, "I don't know" taps, discard from recording and transcript, `?fresh`, eight of nine confidence versions (the render pass below did see them), the typed-turn ladder, and say it back.

**Blind spot:** the over- and under-confidence copy versions and the same-day "still fresh" state, plus any state that only appears after a hand-timed interaction (X mid-recording, a discard racing the 10s error). Its script used the mock's scripted takes.

### Contradictions and overlaps between critics

- None directly contradict. Craft finding 6 and UX finding 4 both report the review summary's action bar hiding the NEEDS PRACTICE card. Craft finding 7 and UX finding 6 both concern the mic denied screen: craft on empty space and a quiet hint, UX on copy that does not say what is lost.
- The UX critic saw one of nine confidence versions. The render pass reached all nine and they are distinct. No critic graded the other eight.

## Critic-ambition (kept separate, not in the total)

**Score: 6.** It starts at 5 and moves only for risks taken. The concept is in the copy, not the visuals.

Moved it up
- The review summary's "How you felt" puts confidence before and after side by side, with a sentence on the change (`/tmp/knowie-critics/critic-ambition/page-2026-09-19T20-15-00-551Z.png`). It lands only partly because the verdict is a paragraph.
- The voice turn's read-only transcript step ("Here's what Knowie heard", with bin and send) is more deliberate than record-to-verdict (`...20-14-45-171Z.png`).

Settling for
1. **The two passes look the same.** The section summary (`...20-15-06-675Z.png`) and review summary are the same green, yellow and red card stack. Cover the words and the concept vanishes.
2. **The review summary does not show how each term moved.** Cards regroup by the new outcome only, so a term that changed group between passes leaves no trace.
3. **The voice turn is identical in every round** (`...20-14-30-160Z.png`). Only the progress bar changes.
4. **Mic denied is a template empty state** (`...20-15-09-567Z.png`), with a large blank area, and it never shows typing counting the same.
5. **The section summary is the review layout with fewer parts.** It shows no completion-versus-mastery tension.

Stronger patterns (built from documented components)
1. **Two-pass term rows on the review summary.** Keep the cards grouped by today's result, and give each row a small "before" cue. The section summary stays flat. Built from `SummaryCard` (`terms`, tone) inside `ExpandableSummaryCard`. The per-row cue is not documented, so it needs the gap reported first.
2. **Round-specific voice turn framing.** Switch `ProgressIndicator` to `variant="Coral"` in review and eve, and use a different `MascotSlot` `name` in the review round. The Coral variant was not rendered, so this use is unverified.

Out of reach: a per-term "before" cue on `SummaryCard` rows (it would call it `previousOutcome` or a row badge), and a typed-answer preview on mic denied.

**Blind spot:** it checked structure and copy only. It did not walk the 4s and 10s beats or the animations, the exam-eve summary, or the Coral `ProgressIndicator` and `MascotSlot` faces.
