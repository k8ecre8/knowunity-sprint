# Scorecard 01

- Date: 2026-09-19 01:33
- Commit: 0334ee1, working tree clean at start and after (build and tokens left no changes)
- Screens: voice turn, review summary, section summary, mic denied. Each critic was told to cover every state of these, including failure paths.
- Critics run: system, craft, ux, ambition. Each ran in its own context and got only the screen scope, the rubric (which each reads itself) and its own dimensions. Command output went to system and craft only. No critic saw another critic's output.
- Prompt deviation: the grade-prototype skill's prompt is a bare "Grade the prototype." I added one scope line naming the four screens, because you asked for that scope. It carried no score, opinion or hint.

## Total

**6.5 / 10** (97 ÷ 15). No hard gate failed, so the overall stands.

**Ambition: 5 / 10.** Reported on its own and not in the total.

## Per-dimension table

| Dimension | Critic | Weight | Score | Weighted |
|---|---|---|---|---|
| System fidelity | system | 3 | 7 | 21 |
| Coherence | ux | 3 | 6 | 18 |
| Craft | craft | 3 | 6 | 18 |
| UX judgment | ux | 3 | 7 | 21 |
| Accessibility | craft | 2 | 6 | 12 |
| Structure | system | 1 | 7 | 7 |
| **Sum ÷ 15** | | | | **97 ÷ 15 = 6.5** |

Lowest High-weight dimensions: Coherence and Craft, both 6.

## Hard gates

| Gate | Checked by | Result |
|---|---|---|
| 1. Body contrast ≥ 4.5 | craft | Pass. Measured on rendered pages. Lowest body value was 6.66 (Incorrect chip). |
| 2. Touch targets ≥ 44 | craft | Pass. Smallest measured wrapper was 48. |
| 3. No raw hex | system | Pass. `check-tokens.mjs` exit 0, and system's own grep found no px, ms, rgba or fallback values in `src/` outside comments and stories. |
| 4. States that should differ | craft | Pass, with gaps. Craft did not check the review summary variants or the confidence check. See soft spots below and my render flags. |

No gate failed. Gate 4 is not fully verified for the review summary. Craft said so itself, and the render pass below covers part of it.

## Commands run before the critics

| Command | Result |
|---|---|
| `node scripts/check-tokens.mjs` | exit 0, "No raw hex colours found." |
| `npm run lint` | exit 0, no output |
| `npm run build` | exit 0, compiled, TypeScript finished, 6 static pages |
| `npm run tokens` | exit 0, `build/css/tokens.css` unchanged |
| `npx vitest run --project=storybook` | exit 0, 28 files, 223 tests passed, no a11y todo or violation lines |

## Render pass (mine, run before the critics, never shown to them)

65 screenshots at 390×844, dark, from a Playwright script. Covered:
- **Voice turn:** idle, start over, recording, transcribing, transcript, thinking, thinking-slow, verdict (fresh and after hint), hint 1 (partial and "I don't know"), hint 2, error, answer shown, say it back (listening and acknowledged), didn't catch that, mic prompt, and the leave sheet (early and late).
- **Mic denied:** first denial, again via the ring, and the review and eve routes.
- **Section summary:** no misses, has misses, all missed, empty.
- **Review summary:** nine confidence-by-performance versions, no misses, same-day, mixed fresh, empty, and Good expanded.

Every state rendered with no page errors. Screenshots are in `/private/tmp/claude-501/-Users-katielauffenburger-Documents-Directories-knowunity-sprint/0781dbfe-2123-4c77-82a7-ecebe5a27d7b/scratchpad/renders/` and the hashes are in `log.json` there.

**Identical or near-identical pairs, flagged and not fixed:**

1. **Review summary, confidence comparison (real flag).** In the first viewport, the three confidence directions (up, same, down) give pixel-identical screenshots for each performance direction. So there are three distinct top-of-screen renders for nine states. The comparison ("How you felt") and its copy sit below the fold on every review summary state. Scroll height is 990 to 1422 against 644 visible. When scrolled they differ correctly, and all nine copy versions rendered. The one claim the concept rests on is off-screen on arrival.
2. **Voice, retry from the error on the last rung vs answer shown.** Identical. Not a defect. Retry re-judges at normal speed and lands on answer shown, so the two are the same state. It does mean retry from error has no "it worked" moment.
3. **Mic denied, first vs eve, and again vs review.** Identical. The screen has no round-specific content, so the round makes no difference. That is expected.
4. **Unreachable-by-tap states.** The empty section summary reads "You'll see all 0 again in the review before your test." The empty review summary reads "You got 0 of 0 correct without help, but you revised these today, so they're still fresh." Neither is reachable by tapping, but both come up on a direct URL.

## Findings

Evidence paths starting `/tmp/knowie-critics/` are the critics' own screenshots. Findings are grouped by critic and left as each critic wrote them. Where two critics found the same thing, both are listed and not merged.

### critic-system (System fidelity 7, Structure 7)

1. **Primitive tokens read directly.**
   - **Where:** `src/app/recall/[round]/summary/review.module.css` and all screen CSS (for example `.content { gap: var(--primitive-space-600) }`). Also `Button.module.css:98` and `ListItem.module.css:157`, which read `--primitive-color-alpha-dark-15`.
   - **What's wrong:** Screens and components read `--primitive-space-*`, `--primitive-radius-*`, `--primitive-control-*` and `--primitive-color-alpha-*`. `design-system.md` → Never says never to read a primitive directly. `tokens.css` has no semantic space, radius, icon or control layer, so the call sites cannot fix this.
   - **Fix:** Add semantic aliases in `tokens/tokens.json` (for example `semantic.space.stack.*`) and move the CSS to them. Or record in `design-system.md` that reading `--primitive-*` for space, radius and control is sanctioned. Pick one.
2. **Unlogged spacing snap.**
   - **Where:** `review.module.css:25-27`, the `.confidence` block.
   - **What's wrong:** The frame's 21px gap is snapped to `Space/600` and reported only in a CSS comment. It is not in `component-gaps.md` or `design-system.md`.
   - **Fix:** Add a line to `docs/component-gaps.md` naming the missing step (for example `Space/525`) and keep `Space/600` until it exists.
3. **Transcript card may clip at +40% strings** (low confidence).
   - **Where:** voice turn, transcript state (`/tmp/knowie-critics/critic-system/page-2026-09-19T05-13-20-409Z.png`).
   - **What's wrong:** The card did not grow when the text was lengthened, and the last line was cut ("hot rock ri"). The critic could not tell whether that is a real defect or an artefact of editing text after the card had sized itself.
   - **Fix:** Add a `VoiceInput` story with a transcript about 40% longer than the mocks, asserting `card.scrollHeight <= card.clientHeight`. If it fails, size the card from its content.
4. **Animation constants live in JS** (`VoiceInput.tsx:78-84`, `:282-329`). Logged in Known gaps, so no deduction.
5. **Stand-in rating on direct navigation.**
   - **Where:** `ReviewSummary.tsx:184`, `session?.preReviewRating ?? 4`.
   - **What's wrong:** With an empty session it shows "You got 0 of 0…" and a comparison built on the stand-in 4.
   - **Fix:** Render an empty state, or redirect to the round, when `rows.length === 0`.

Evidence traced: five rendered values against `:root` tokens (body background `#090c18`, primary fill `#f4f2ff`, h1 colour, card radius 24px = `--primitive-radius-600`, button wrapper 56px). `font-feature-settings` on `:root` = lnum, pnum, ss02, ss03, ss06, ss07. `scrollWidth` = 390 on all four screens at +40% strings. Rendered: `/tmp/knowie-critics/critic-system/page-2026-09-19T05-14-31-877Z.png`.

**Blind spot:** I traced computed values by matching resolved colours to `:root` custom properties. I did not walk every element back to its source `var()`, so a value that happens to equal a token but is set another way would pass. I also did not run the app under emulated reduced motion, so I could not check the `$extensions` reduced mode for duration tokens.

Could not check: reduced motion, real safe-area insets (headless returns 0), the eve summary with 12 rows.

### critic-craft (Craft 6, Accessibility 6, gates 1, 2 and 4)

1. **Exits run at the same speed as entrances.**
   - **Where:** `src/components/VoiceInput.module.css:30` and `:108-110`. `motion.duration.exit` (170ms) is used nowhere in `src/`.
   - **What's wrong:** The transcript card grows and collapses at `slow` (450ms). Items fade in and out at `base` (250ms). This breaks "Exits run faster than entrances, about a third". This is the reason Craft is not a 7.
   - **Fix:** Move the collapse-direction transitions to `var(--motion-duration-exit)`. Keep entrances at `base` and `slow`. If the token cannot cover a 450ms entrance, report the gap.
   - **Evidence:** CSS read only, not measured on a render.
2. **Relabelled states.**
   - **Where:** transcribing-slow vs judging-slow (`/tmp/knowie-critics/critic-craft/page-2026-09-19T05-18-45-231Z.png` vs `…05-18-49-488Z.png`), and say-it-back listening (`…05-16-13-192Z.png`) vs listening (`…05-13-32-153Z.png`).
   - **What's wrong:** The controls are identical apart from the label or bubble copy.
   - **Fix:** Give say-it-back its own treatment through documented `VoiceInput` props or tokens only, or log the gap in `component-gaps.md`. Transcribing and judging should differ by their drawing, not by label alone.
3. **The control block jumps with content.**
   - **Where:** the status label's y is 425 (idle, listening), 416 (hint 1, `…05-14-17-400Z.png`), 412 (long transcript, `…05-13-38-354Z.png`), 428 (hint 2). Escapes move from y=656 to y=708.
   - **What's wrong:** The block shifts with bubble height and transcript length.
   - **Fix:** Anchor the control block to a fixed slot so only the bubble grows. Do not add a spacer token.
4. **Knowie has no accessible name** on any screen (`img alt="" aria-hidden`).
   - **Fix:** Pass `MascotSlot` its documented code-only `label` (story `components-mascotslot--labelled`).
5. **12px labels carry meaning.**
   - **Where:** review summary "Before the plan" and "Today" (`…05-19-02-054Z.png`). Contrast is 7.75.
   - **Fix:** Move up to a `Body` step, or mark the labels `aria-hidden` and give the reads an accessible text alternative.
6. **Focus.** Only the 1px browser default ring shows, as a rectangle over a pill (`…05-19-44-003Z.png`). This is a known gap. The unlogged part is that the mic-denied `main` is also a tab stop (`…05-19-36-066Z.png`).
   - **Fix:** `tabIndex={-1}` on the `Scaffold` `main`, or make it scroll only on overflow.
7. **Error keeps a red miss chip.**
   - **Where:** voice turn, error (`…05-15-35-319Z.png`). The "Try again" chip stays above "That took too long. Tap to send again".
   - **What's wrong:** The chip reads as a wrong answer when nothing has been judged.
   - **Fix:** Clear the chip while the control is in `error`, using the existing `ResponseBubble` `showVerdict` prop.

**Soft spots on gate 4:** transcribing vs judging slow beats differ by label only. Say-it-back listening differs from listening by bubble copy only.

**Blind spot:** I did not press through the full typed round or the review round. The review summary's same-day vs after-a-gap and up/same/down variants are where a "relabelled twin" state is most likely to hide, and my empty-session render could not show them. I also judged the `motion.duration.exit` finding from CSS text, not from a measured render.

Could not check: the review round walk, the typed turn, the leave sheet, the eve summary, slow-beat timing at real speed (confirmed in Storybook only, with motion reduced), measured entrance and exit durations, a pressed-state screenshot.

### critic-ux (UX judgment 7, Coherence 6)

Must states from `voice-ux.md`: all built. Idle, recording, processing, results (correct, almost there, try again), cancel and re-record, text fallback, mic primer and OS prompt, permission denied → text, leave confirm. "I don't know" is present but was not tapped, so it is unverified. Data check: section `sessionStorage` rows were exactly 3 and matched the summary. The review had 13 rows (3 + 10), and 8 / 1 / 1 recounts to "8 of 10". "Try the ones you missed" left `rows` unchanged.

1. **Same-day review still claims learning.**
   - **Where:** `ReviewSummary.tsx`, "How you felt", same-day (`?fresh`) and days-later.
   - **What's wrong:** The fresh state says "still fresh, come back tomorrow" but keeps "You felt more confident. Your answers back that up." A tester who rated "Ready" with 2 of 10 not solid was still shown "back that up". Overconfidence is not named and the unresolved terms are not counted.
   - **Fix:** In the fresh branch, drop "your answers back that up" and say the comparison waits until tomorrow. Add a copy version for "confidence up, performance up but under 10 of 10" that names the open terms.
2. **Section summary does not show completion is not mastery.**
   - **Where:** `SectionSummary.tsx` (`/tmp/knowie-critics/critic-ux/…05-24-31-724Z.png`).
   - **What's wrong:** "Here's how it went" is nearly the review's "How it went". Nothing says the node is done whatever the outcome.
   - **Fix:** Add one count-free line in the existing note area: finishing is not mastery, and the misses come back in the review.
3. **Eve turn and summary framing.**
   - **Where:** `/recall/eve/1` (`…05-28-57-747Z.png`) and the eve summary.
   - **What's wrong:** The eve turn reuses "Let's see what stuck." The summary headline "You're almost ready." leads with a readiness claim before the work left.
   - **Fix:** Give eve its own opener in `src/mock/terms.ts`. Lead the headline with the count of terms to look at.
4. **Verdict chip persists while judging.**
   - **Where:** voice turn, slow and error states (`…05-23-45-070Z.png`, `…05-23-58-185Z.png`).
   - **What's wrong:** The previous "Try again" chip stays while the next answer is judged, then hint 2 carries the same chip.
   - **Fix:** `showVerdict={false}` on `ResponseBubble` while thinking, slow and error.
5. **Knowie appears at three sizes.**
   - **Where:** XL on typed, 2XL on voice, 3XL on the confidence check. The bubble covers the lower part of the mascot on the turns.
   - **Fix:** Needs a `MascotSlot` step or `Illustration/*` token that is not in the library. Report and stop.
6. **Streak button is actionable.**
   - **Where:** the turn app bar exposes `button "Streak"` for a `zap` glyph that is decoration by spec (XP is out of scope, Open 12).
   - **Fix:** Render it non-interactive and `aria-hidden` at the AppBar call site, or remove it.
7. **Two ways back to voice on the typed turn.**
   - **Where:** the `ChatInput` "Answer by voice" mic button beside "Use my voice instead".
   - **What's wrong:** The mic button was not tapped. If it bypasses the mic-denied check, the two behave differently under denial.
   - **Fix:** Confirm both go through the same denied check, or hide the mic affordance if it is not documented in `ChatInput` stories.

Also noted: retry from the error led to hint 2, not to a re-run of the same verdict.

**Blind spot:** the mic prompt was walked only on the tray Start path. I did not test what happens after "Don't Allow" is chosen and the tester later reloads. My reset-driven walk cannot see permission persistence. My method would also miss any state reachable only by resuming mid-round.

Could not check: the typed ladder to the end, "I don't know" (idle and hint 2), say-it-back, X → Stay/Leave → resume, the all-correct eve summary, eight of the nine confidence versions, a clean 0/4/10s wait pass.

### Where critics touch the same thing (shown separately, not merged)

- **Verdict chip during judging or error:** craft finding 7 and ux finding 4. Same defect, same fix. Craft treats it as a craft problem and ux as a status problem.
- **0 of 0 on an empty review summary:** system finding 5 and craft's unchecked note. ux and ambition saw different oddities (ambition: "0 of 7" with ten terms needs practice, from its "I don't know" walk).
- **Section summary framing:** ux finding 2 (says nothing on completion vs mastery) and ambition finding 2 (same slabs as a score screen). Same underlying gap, different fixes.
- **Knowie sizes:** ux finding 5 says report and stop. Ambition proposes `MascotSlot` `3XL` expressions. These conflict on what to do.

## Blind spots, one per critic

- **system:** matched computed values to tokens by resolved colour. A value that equals a token but is set another way would pass. Reduced-motion durations not checked.
- **craft:** never walked the review round, so the review summary variants and any relabelled twins there are unchecked. The exit-duration finding is from CSS, not a measured render.
- **ux:** permission persistence across a reload after "Don't Allow", and any state reachable only by resuming mid-round.
- **ambition:** did not walk the typed route after mic denied, the leave sheet, "didn't catch that" or the same-day review summary. Saw one of the nine comparison versions.

## critic-ambition (kept separate, not in the total)

**Score: 5.** It starts every screen at 5 and moves only for risks taken. The overconfidence comparison ("That's overconfidence, and it's common") is a real risk, but it is undone because the tile above it is the same slab as the section round, and it arrives after an identical ten-turn loop. The Knowie expression changes (thinking, approving) are small and never separate one round from another. One point higher is available: make the second pass look and behave differently from the first.

**What it is settling for:**
1. **The review round is the section round with a different sentence.** Review turn 1 (`/tmp/knowie-critics/critic-ambition/page-2026-09-19T05-27-55-735Z.png`) vs section turn 1 (`…05-22-24-014Z.png`): same bar, purple progress, Knowie and ring. The concept lives only in copy.
2. **The section summary is three saturated slabs like a score screen** (`sectionsummary.png`). A first pass looks like a result, and the screen never shows the difference between done and learned.
3. **Say it back looks identical to a real answer** (`sayback.png` vs `…05-22-00-396Z.png`). Only the bubble text says "just practice". The acknowledgement (`ack.png`) is a bare bubble.
4. **Verdict and answer-shown screens are half empty** (`t2correct.png`, `t3answer.png`). A miss and a hit share a layout.
5. **Mic denied is a generic empty state** (`…05-21-11-316Z.png`, and `…05-21-34-791Z.png` for the repeat). The second denial is the same layout with different title copy.

**Stronger patterns (Storybook components only):**
1. **Second pass wears a different bar.** Section keeps the purple bar. Review and eve use the coral `ProgressIndicator` (`variant="Coral"`, `thickness="16"`, `current`, `total`; stories `components-progressindicator--coral-16-progress-50` and `--driven-directly`; rendered at `…05-28-46-989Z.png`). Caveat from the critic: `design-system.md` line 130 says "do not copy the Coral naming", so the docs should confirm this is allowed as a role signal.
2. **Section summary counts only, review opens the ledger.** Collapse each `SummaryCard` to header plus "N terms" (`showRow1=false`, `showOverflowRow`, `overflowText`; story `components-summarycard--collapsed`, rendered at `…05-29-05-105Z.png`). The review summary opens Good fully with `MascotSlot` `name="approving"` or `"excited"` (`3XL`, story `components-mascotslot--expressions`). Caveat: SPEC says the section summary "shows everything" (Open 14), so keep the misses card open.

**Out of reach:** a distinct say-it-back state needs an undocumented `VoiceInput` variant, which the critic would call `state="practice"`.

**Blind spot:** did not walk the typed route after mic denied, the leave sheet, "didn't catch that" or the same-day review summary. The review summary it saw came from "I don't know" taps and showed "0 of 7" beside ten needs-practice terms, a mismatch worth a check. It saw only the overconfidence comparison, not the other eight.
