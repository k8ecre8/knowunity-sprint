# Knowie design system

Rules for building with this system. Every value lives in `tokens/tokens.json` — this file never repeats one.

If you need a number, a colour, a duration or a type step, read `tokens/tokens.json`. If it isn't there, see **Never** below.

---

## Which component to reach for

### Actions

**`button`** for anything that takes an action and carries a label. Four treatments, and the names don't say which is which:

| Variant | Looks like | Use when |
|---|---|---|
| Primary | Light fill, lip | The one thing you want the student to do. Max one per screen. |
| Secondary | Surface fill, lip | A supporting action beside the primary one. |
| Tertiary | No fill, stroke, heavier bottom border | An action that shouldn't compete but still needs to read as a control. |
| Text | Nothing at rest | A quiet escape: "Skip", "Not now", "Reveal answer". |

**`buttonIcon`** for the same four treatments with no label. Same sizes, same press rule.

**`voiceInput`** for answering Knowie out loud: the push-to-talk control, its label and every state of a voice turn, from idle through the transcript to the judging wait. The way to answer.

**`chatInput`** for text entry when a student chooses, or needs, to fall back from voice. Not the way to answer; voice is.

**`buttonGroup`** for two buttons acting as one unit at the bottom of a screen. Note it hardcodes an icon button on the left and a primary on the right, so it does not currently do two text buttons side by side.

### Feedback

**`verdictChip`** when the system is reporting how an answer was judged. Four tones: Correct, Partial, Incorrect, Skipped.

**`chips`** when you are tagging, filtering or counting. It has no tone for verdicts — that is what `verdictChip` is for.

**`snackbar`** for a transient message that needs no decision.

**`permissionAlert`** for the mocked iOS microphone prompt, once per browser (until `/plan?reset`). It is the OS talking, not Knowie, so it is not a `bottomSheet` and not a `responseBubble`.

**`responseBubble`** for anything Knowie says: the prompt on an idle turn, the verdict and feedback after judging. One container for the whole turn loop.

**`summaryCard`** for the per-category breakdown at the end of a session. One card per outcome, up to three terms shown, with an overflow row that doubles as the collapse affordance. The screen decides how many rows show, not the card.

**`expandableSummaryCard`** when a summary starts a card closed and the student can open it. It wraps `summaryCard` and remembers the opening; the screen still picks the starting view.

### Structure

**`appBar`** as the top edge of a screen. Its slot carries whatever the screen needs across the middle.

**`progressIndicator`** for position in a multi-step session.

**`textBlock`** for a heading with an optional caption. Not for body copy.

**`listItem`** for one row in a list. Filled, Filled Compact and Transparent are Knowunity's; Outlined and Outlined Compact were added this sprint for the outlined rows on the app home and the onboarding single-choice lists, and for any dense outlined list. `listItemOutlined` is retired: it is now `listItem` with `variant=Outlined`.

**`noteCard`** for a standalone container that carries one message, with an optional leading icon or badge and an optional trailing chevron. Not a row.

**`planNode`** for one stop on the exam plan path. State says whether it is done, next or still to do; tone says which goal type the plan is.

**`bottomNav`** for the app tab bar. One instance per screen, one `active` value.

**`iconSlot`** wherever an icon sits inside another component. Never place an icon directly.

Its variants are **sizes**, not icons: 8, 12, 16, 20, 24, 32 and 40px, matching the `Icon` ramp in `tokens/tokens.json`. The default glyph is `check`. The icon itself is an instance-swap property, which appears on an instance rather than on the component set. Pick the size from the variant dropdown and the glyph from the swap dropdown.

**`mascotSlot`** wherever Knowie appears.

### Choosing between two that seem close

- **Reporting a result** → `feedback` tokens, `verdictChip`. **Decorating something** → `accent` tokens, `chips`. If a colour is saying whether something was right, it is feedback, even where an accent colour would look identical.
- **A row in a list** → `listItem`. **A message that stands alone in a soft container** → `noteCard`. **A card Knowie is speaking from** → `responseBubble`. The test is whether the thing sits against neighbours: rows do, note cards do not.
- **A stop on the plan path** → `planNode`. **The same node used as a badge inside a card** → `noteCard` with `leading=badge`, which nests a small `planNode`; do not draw a circle.
- **One action** → `button`. **Two acting together** → `buttonGroup`. Never a group of one.

---

## The scaffold

Every screen is a `scaffold` instance at 390 wide. It is a vertical stack of four slots plus a fixed status bar.

```
Panel Header      status bar, fixed, not a slot
topNavigation     appBar goes here
middleContent     the screen, scrolls, grows to fill
bottomContent     the call to action
bottomSheetOnly   home indicator area
```

**What belongs in each slot**

- **`topNavigation`** — one `appBar`. The app bar's own slot is where a `progressIndicator` sits during a session. Toggle the whole slot off with `showTopNavSlot` for a full-bleed screen.
- **`middleContent`** — everything the screen is about. This is the only slot that scrolls and the only one that grows. Mascot, prompt, response, lists, forms.
- **`bottomContent`** — the primary action, usually a `button` or a `buttonGroup`. Anchored, does not scroll.
- **`bottomSheetOnly`** — reserved for the home indicator. Leave it alone unless you are building a sheet, and pair it with `showBottomSheetBackground`.

**Rules**

- Put one thing in a slot. Slots hold a single child; compose inside a frame if you need more.
- Do not put an action in `middleContent` that belongs in `bottomContent`. The anchored position is the affordance.
- Do not resize the scaffold. 390 is the product width.

**Built in code, Sep 2026,** as `src/components/Scaffold.tsx`, at `size=iPhone 13` only. The other seven `size` options (tablets, laptop, other phones) are out of scope, so there is no `size` prop. The four slots are `ReactNode` props with the Figma names, and `showTopNavSlot`, `showBottomNavSlot` and `showBottomSheetBackground` keep theirs. `Size/StatusBar` (48) was added for the Panel Header, which the file draws at a loose 48; `Control/1200` is the same number but means a tap target. The status bar is decoration, not a component: `Status Bar / Mode=Night` exported from the iPhone 13 master as `public/images/status-bar.svg` and painted as a CSS mask in `text/primary`, so it carries no hex and every screen gets it. `bottomSheetOnly`'s loose 34 is `env(safe-area-inset-bottom)`, and `bottomContent` adds the same inset to its bottom padding so the action clears the home indicator. Dropped: the root's untokened 10px gap (no effect under space-between), the hidden Scrim gradient no property toggles, and the Panel Header's hidden fill bound to Bricks' `Core/BG/Secondary Transparent`. The divider is `border/default` on every size; the non-iPhone-13 masters bind Bricks' `Core/Grayscale/Dividers`.

---

## How things behave

**Press is geometry, not colour.** Anything with a lip presses by the lip collapsing to zero and the control sinking by the lip depth. The fill does not change. `Text`, which has no lip, presses by filling with `background/surface` instead. Transition at `motion.duration.instant`.

**The lip is built two ways.** On a filled control it is an inner shadow at `Elevation/Lip/sm` or `/lg`, in `elevation/lip` (added Sep 2026, aliasing `color/alpha/dark-15`, so components never read the primitive colour). On an outlined control there is no fill to darken, so it is a heavier bottom border instead, at `Elevation/Lip/outlined/sm` or `/lg`. Same idea, different mechanism, and the outlined depth is tuned by eye rather than matched to the number — which is why it has its own pair of tokens rather than reusing the stroke scale.

**Exits run faster than entrances.** About a third faster. Someone dismissing a thing has already decided. Anything that entered at `motion.duration.base` leaves at `exit` (170); anything that entered at `slow` leaves at `exit-slow` (300, added Sep 2026). Both take `motion.easing.exit`.

**Reduced motion is a mode, not a second set of tokens.** See the `$extensions` block on each duration in `tokens/tokens.json`.

**A resting state must not be mistakable for a live one.** Where a control has a state that runs in real time, no idle, waiting or finished state may leave the student with two equally available readings and nothing to choose between them — that is how they come to act before the system is ready. Motion in a resting state is still welcome; it just has to read as an invitation rather than a process.

**The strongest way to settle it is words, not restraint.** `voiceInput` idle first drew a breathing ring round a bare microphone and a tester read it as recording; stripping the ring, the glow and the ripple left a flat disc that was unmistakable but inert. What fixed it was putting "Tap to answer" inside the control, where "Tap when done" sits while listening — after which the ring and a reduced glow could come back, because the words carry the state and the drawing no longer has to. Reach for the label first and take cues away second. Added Sep 2026, revised the same month once the words were in.

Each component with states says which of them run in real time, so this is checkable rather than a matter of taste.

**Dark only.** There is one mode. Adding light later means restructuring, not adding a mode.

---

## Naming

**Semantic tokens read category, then concept, then role, then state.** `feedback/error/bold` is the feedback category, the error concept, the bold role. `background/surface` has no concept because it doesn't need one.

**Primitives read category, concept, step.** `color/violet/500`.

**Two numbering systems live in one collection, and this is the easiest mistake to make.** `Space`, `Radius` and `Control` number at 25× the pixel value. `Icon` and `Illustration` number at 12.5×. So `Radius/400` and `Icon/400` are different sizes. Read the group before the number.

**Components are camelCase.** `verdictChip`, `planNode`, `noteCard`, `bottomNav`, `buttonGroup`.

**Text styles read tier, size, weight.** `Body L Regular`, `Headline XS Bold`.

**Variants are named by role, not appearance.** The one exception in the file is `progressIndicator`, whose variant property is named `Coral`. Do not copy that pattern. `listItem`'s inherited axis (Filled, Transparent, Outlined) is Knowunity's naming and is left as it arrived; the two variants added this sprint follow that axis so the set stays consistent, and the description notes it.

---

## Icons

**Untitled UI Icons**, free tier, published from a separate library file. Names are lower-kebab with numeric suffixes where a family has variants: `check`, `x-close`, `refresh-cw-01`, `microphone-01`, `chevron-right`, `skip-forward`, `trash-01`, `send-01`, `zap`.

This is the set the app already uses. The `loading-01` and `x-close` naming in the handed-over file confirmed it.

**Rules**

- Icons go inside `iconSlot`, never placed directly. That is what makes them swappable and correctly sized.
- Take the glyph from the swap dropdown, which lists the icons in this system. If the one you need is not there, say so — do not paste an SVG or borrow from another set.
- Icons inherit their colour from the token on the surrounding text or the component's `on*` token. Do not give an icon its own colour token. **The exception is a leading icon that is meant to carry tone while its text does not** (widened Sep 2026, from a rule that named only the first of these): the section intro tray's three rows take `accent/brand/bold` while their text stays `text/primary`; `noteCard`'s leading icon takes `accent/brand/bold`, as its master draws it; and `chips` under `iconTone="info"` takes `feedback/info/onSubtle` while the label keeps its own colour, as the app home's quick actions draw it. Each was checked against a Figma master. In every case the colour goes on the slot's wrapper, never on `IconSlot`, which keeps no colour prop — that part is not negotiable, and it is what the rule is really protecting.
- In Figma the colour binding lives on the glyph's vector inside the slot. Swapping the glyph drops that binding and the icon renders dark until it is rebound. After every swap, select the vector and bind its stroke to the token again. `iconSlot` has no colour property on purpose: 325 instances carry 16 different bindings, and a tone axis would multiply the set by that.
- One stroke weight across the system. Untitled UI ships several styles; mixing them is visible. **One weight means one proportion, not one number** (revised Sep 2026): the stroke scales with the glyph, so it is always an eighth of the box rather than 2px at every size. Holding 2px keeps the number the same and the proportion different, and the proportion is what a reader sees. See `iconSlot` → Where the file and the build differ.
- In code, `@untitled-ui/icons-react` (MIT) exposes the same set, so the Figma glyph and the built glyph are the same drawing. All 69 glyphs on `iconSlot`'s swap property resolve to an export in it, and `IconSlot` carries three more (`plus`, `dots-vertical`, `share-02`) that the file cannot yet. `untitledui-js`, named here earlier, carries the same icons but is five times larger and declares peer dependencies on Vue, Solid and Qwik, so it was not used.
- The npm packages are MIT, so the code path does not inherit the free-tier limit below. The Figma file still does.

**Licence.** The free tier covers one user, and that includes anyone accessing a published Figma library built on it. If this file goes to Knowunity or to other people, that is a paid tier.

---

## Never

**Never invent a value that isn't in `tokens/tokens.json`.** If you need a spacing step, a colour or a duration that doesn't exist, say what's missing and what you'd call it. Do not pick something close.

**Never write a CSS fallback.** No `var(--token, #333)`. A token that resolves to nothing is a bug to fix at the source, and a fallback hides it until it ships.

**Never use title case.** Sentence case on every label, button, heading and message. Capitals only for proper nouns: Knowie, Knowunity, Exam Plan Plan Identity Titles, PRO.

**Never put an appearance word in a semantic name.** A word describing how a colour looks belongs in the primitive layer. `feedback/partial`, not `feedback/yellow`.

**Never read a primitive colour directly.** Colour has two layers: components consume the semantic layer, and the semantic layer references the primitives. The primitive colours are scoped to nothing in Figma for exactly this reason. The other scales (space, radius, control, stroke, icon, illustration, elevation depth, opacity, scale, size, font) are one layer by design, so components read them directly, which is how every spec in this file names them (`Space/1000`, `Radius/400`, `Control/1200`). Clarified Sep 2026.

**Never build something new when a component already does the job.** Read the list above first. Most of what looks missing is a variant or a property on something that exists.

**Never invent a component to fill a gap.** This system gets extended deliberately. Say what's missing, say what you'd call it, and stop. Do not ship a one-off.

**Never remove the lip to make something look flatter.** It is the only affordance telling a student the control is pressable, and it is what moves when they press it.

**Never paste an SVG or borrow an icon from another set.** Everything comes from Untitled UI through `iconSlot`. A missing icon is a gap to report, not a thing to source elsewhere.

**Never recolour an instance.** If you need a different tone, the component needs a variant, which is a gap to report rather than an override to apply.

---

## Components built this sprint

Each entry names the component, its axes and properties, when to reach for it, what each state means, and what not to do. The block quote under each is the description as written in Figma; the Figma description is the source of truth and this file repeats it rather than paraphrasing. Every value named below lives in `tokens/tokens.json`.

### `button`

**Axes:** `variant` (Primary, Secondary, Tertiary, Text), `size` (S, M, L), `state` (Default, Pressed, Disabled, Loading), `tone` (Default, Success, Error). 60 variants — `tone` is Primary only and Default/Pressed only, which is why it is 60 and not 144. **Properties:** `showLeftIcon`, `showRightIcon`, `CTA`.

**Reach for it** for anything that takes an action and carries a label. Which treatment is the "Which component to reach for" table at the top of this file.

**Structure.** A fixed-height wrapper holding a hug-width pill. The wrapper is the tap target, not the drawn control: at S and M the pill is 32 and 40 tall, so the wrapper carries `Control/1200` to clear the 44px minimum. At L the pill is already 56, so wrapper and pill match.

**What each state means.** `Default` is resting. `Pressed` is the finger down: the lip collapses and the control sinks by the lip depth, except on Text, which has no lip and fills with `background/surface` instead without moving. `Disabled` drops the label to `text/disabled` and, on Primary only, the fill to `background/surface`; every variant keeps its lip. `Loading` hides the label and shows `loading-01` in the centre slot.

**Don't** put two Primaries on one screen. Don't recolour an instance for a destructive or verdict button — there is no destructive variant in this product, and a verdict uses `tone`. Don't remove the lip to look flatter.

**Built in code this sprint** as `src/components/Button.tsx`, with `Loading`, `showLeftIcon` and `showRightIcon` left out; those three are in **Known gaps**. Two token pairs were added for values the Figma set drew loose: `Control/800|1000|1200|1400` (32/40/48/56 — 56 existed on no scale at all) and `Elevation/Lip/outlined/sm|lg` (2px/3px).

**`fullWidth` (added Sep 2026, code-only).** Figma's fill-container sizing on an instance: the tap target and the pill both fill the parent, height and lip unchanged. Stacked bottom actions use it (the three summaries, mic denied, the confidence check, both turns, the intro tray) in place of each screen stretching the button from its own CSS.

> button: four treatments. Text does not exist yet.
> Primary: interactive/primary fill, no stroke, lip. Secondary: interactive/secondary fill (translucent, so it takes on the colour of a tinted sheet), no stroke, lip. Tertiary: no fill, border/strong stroke, lip; the outlined variant, as shipped on the home screen. Text: no fill, no stroke, no lip. TO BUILD.
> THE LIP. A bottom edge that makes the button read as pressable. Depth follows control height: Elevation/Lip/sm on 48px (sizes S and M), Elevation/Lip/lg on 56px (size L). Built two different ways, because a transparent button has no fill to darken. Filled variants (Primary, Secondary): an INNER_SHADOW at the lip depth, applied to the component wrapper; Figma masks it to the child's shape, so the child must have a fill or nothing renders. Outlined variant (Tertiary): a heavier bottom border, strokeBottomWeight 2px at S and M, 3px at L, against a 1px border on the other three sides. This is roughly half the lip depth, not the full depth: a solid stroke at border/strong reads far heavier than a 15% inner shadow, so matching the numbers would over-weight it. Tuned by eye, not derived.
> PRESS. Anything with a lip: the lip goes to zero and the button sinks by the lip depth, achieved by moving the depth from paddingBottom to paddingTop on the wrapper. No colour change. Text, which has no lip, presses by filling with background/surface, no sink. Transition: motion/duration/instant.
> FOCUS — OUTSTANDING. There is no Focus state on any variant. This is a WCAG 2.2 gap, not a design choice: anyone using a Bluetooth keyboard, Switch Control or Voice Control on iOS needs a visible indicator of where they are. The tokens exist and are ready: border/focus for the colour, Focus/Width (2px, aliases Stroke/Heavy Border) for the ring, Focus/Offset (2px) for the gap. Two things to resolve when building it. The ring must wrap the lip as well as the pill, or it reads as floating off the bottom edge. And on Tertiary, which already carries a border/strong stroke, the ring becomes a second concentric outline — decide whether it replaces that stroke or sits outside it. Deferred deliberately during the design system pass, not overlooked.
> DON'T: use more than one Primary on a screen. It is the single action you want taken, and a second one makes neither read as the answer.
> TONE. Primary only, Default and Pressed states only. Success and Error are the action on the practice round's feedback sheet: "Continue" after a correct answer, "Got it" after an incorrect one. Fill feedback/{tone}/bold, label feedback/{tone}/onBold, lip unchanged. Measured from the shipped app. Whether the recall loop uses tone is not decided.
> DON'T: recolour an instance to make a destructive or a verdict button. For a verdict, use tone. There is no destructive variant in this product.
> DON'T: remove the lip to make a button look flatter. It is the only affordance telling a student the thing is pressable, and it is what moves when they press it.

**Where the file and the description disagree.** The description says Text is "TO BUILD" and presses with no sink; the 12 built Text variants shift by the lip depth as well as filling. The description wins, and the code follows it. The description also says the filled press moves the depth "from paddingBottom to paddingTop", which would sink by exactly the lip depth, but the built Default variants have paddingBottom 0, so they sink by half that. The code follows the description here too.

### `buttonIcon`

**Axes:** `variant` (Primary, Secondary, Tertiary, Text), `size` (S, M, L), `state` (Default, Pressed, Disabled, Loading). 48 variants. The glyph is swapped on the nested `iconSlot`.

**Reach for it** for an action carried by a glyph alone. Every rule on `button` applies: max one Primary a screen, press is geometry, no destructive variant.

**Structure.** The same wrapper and pill as `button`: pill 32 / 40 / 56 (`Control/800`, `/1000`, `/1400`) inside a `Control/1200` wrapper at S and M, glyph `iconSlot` 200 / 250 / 300. The filled masters pad the glyph's container by the lip depth at the bottom so it centres on the visible face.

The Figma description is `button`'s description with the TONE paragraph left out, and a DON'T that points verdicts at `verdictChip` rather than at tone; it is not repeated here.

**Built in code, Sep 2026,** as `src/components/ButtonIcon.tsx` on `IconSlot`. No new tokens. `name` is the glyph swap, defaulting to the masters' `check`; `label` is code-only and required. Loading swaps the glyph to `loading-01`, sets `aria-busy` and blocks presses, but **does not spin.** A rotation duration, `motion.duration.spin`, was added Sep 2026 for `voiceInput`, reversing the earlier decision not to add one; Loading is not yet wired to it. The glyph inherits `interactive/onPrimary` on Primary and `text/primary` elsewhere, `text/disabled` when disabled.

**Where the file and the description disagree.** The Primary masters carry a `border/default` stroke; the description says no stroke and wins. The Text Pressed masters sink by the lip depth; the description says no sink and wins, as on `button`. Most glyph strokes are raw black and unbound — the dropped-binding problem.

### `planNode`

**Axes:** `state` (done, next, todo), `tone` (blue, coral, magenta, green), `size` (M, S). 24 variants. The glyph is swapped on the nested `iconSlot`.

**Reach for it** for every stop on the exam plan path, and nowhere else. It is the visual centre of the plan home and the thing a student reads to know where they are.

**No `planNode` state runs in real time.** `done`, `next` and `todo` are positions in a sequence, not processes. Nothing on the plan is ever "in progress", so motion on a node cannot be mistaken for work happening and is free to do the job motion is best at: pointing at where to go. Stated Sep 2026 so that How things behave → A resting state must not borrow a live state's cue can be checked here rather than argued.

**What each state means.** `done` is finished: bold tone fill, gloss band, dark icon. `next` is the one to do now: surface fill with a tone ring. `todo` is everything after that: surface fill, grey icon, and it ignores tone so the eye goes to done and next. `tone` is the goal type the student picked in onboarding, and it has to match the exam art above the plan switcher. `size=S` exists for one job, the badge inside `noteCard`.

**Don't** set tone on a `todo` node expecting a change. Don't scale an instance to get a size between M and S; report the gap. Don't add a stroke to fake a rim; the ring is the base colour showing through the inset gloss. Don't change the glyph on a `done` node to mark the activity type as complete; done looks the same regardless of type, the glyph carries the type.

> planNode: one stop on the exam plan path. 80px circle (Illustration/1000), icon in an iconSlot 400 (32px), swap the glyph for the activity.
> state: done (tone/bold fill, gloss, icon tone/onBold) | next (surface fill, 2px tone/onSubtle ring, icon tone/onSubtle) | todo (surface fill, icon text/tertiary; ignores tone so the eye goes to done and next).
> NEXT MOTION (added Sep 2026): the ring draws once round the node at motion.duration.slow, rests, and repeats on the motion.duration.breathing cycle. It is the only planNode state that moves, so movement on the path means "start here" and nothing else. The ring itself carries next with motion reduced, so the meaning never rests on the animation: with reduced motion the ring is simply drawn and still.
> tone: blue | coral | magenta | green. Matches the goal-type icon colour chosen in exam plan onboarding (Quiz blue, Test coral, Final Exam magenta, Just Studying green) and the exam art above the plan switcher.
> Inner shadow from the hand-built version dropped: no effect token exists. The gloss band sits inside a 68px round clip frame inset 6px (glossClip), so the base colour shows as a ring all the way round; this reads as a border without a stroke token. The clip has to be circular: a square inset does nothing because the circle edge is well inside the square corners. Done nodes look the same regardless of activity type; the glyph carries the type.
> size: M (80, Illustration/1000, icon 32) | S (48, Illustration/600, icon 20; used as the badge in noteCard).

**Built in code this sprint** as `src/components/PlanNode.tsx`, composed on `IconSlot` (400 at M, 250 at S) exactly as the masters nest `iconSlot`. No new tokens: every colour, size and the ring all resolve to existing steps, and the gloss inset is `Space/150` at M and `Space/100` at S. The node sets `color` and the slot inherits it. A `name` prop is the glyph swap, defaulting to each master's glyph (`star-01`, `microphone-01`, `file-question-02`).

**Where the file and the description disagree.** The `next` masters at size S draw the ring at 1.5px, unbound; no such stroke step exists. The description says "2px tone/onSubtle ring" with no size qualifier and M is bound to `Stroke/Heavy Border`, so the code uses that token at both sizes. The gloss is the vector's own geometry as a `clip-path` polygon — a 45° band with corners at 64.7%/35.3% of the clip at M and 65%/35% at S, served by one polygon at 65%/35%.

### `noteCard`

**Axes:** `tone` (neutral, highlight, outlined, plain), `leading` (icon, badge, none). 12 variants. **Properties:** `showTitle`, `title`, `body`, `showChevron`. Height hugs the copy; width fills the parent.

**Reach for it** when one message needs a container of its own: a note under the summary cards, a reminder before the test, the plan-complete card. If the thing sits in a list against other rows, it is a `listItem`.

**What each tone means.** `neutral` is a quiet aside on `background/surface` with secondary text. `highlight` is a note the student should act on, on the highlight surface and border pair. `outlined` is a tappable standalone card (the plan-complete card) on the input fill with a strong border. `plain` is the inline note with no container, for one line next to an icon. `leading=badge` nests a `planNode` at size S; change its tone by selecting the nested node.

**Don't** use it as a list row or stack several with no gap as if they were one list. Don't fix its width; it fills, and the parent's padding decides the margin. Don't draw a circle for the badge; it is a `planNode`. Don't use `outlined` to mean "outlined listItem"; the fill is the difference.

> noteCard: a standalone container that carries one message, with an optional leading icon or badge and an optional trailing chevron. Not a list row: rows sit against neighbours in a list (use listItem); a noteCard stands alone.
> tone: neutral (background/surface, body text/secondary) | highlight (highlight/surface + highlight/border) | outlined (background/input + border/strong, used for the plan-complete card) | plain (no container, horizontal padding 0; the inline note).
> leading: icon (iconSlot 400, 32px, default accent/brand/bold; swap glyph and rebind colour) | badge (a nested planNode instance, state=done; change tone by selecting the nested planNode) | none.
> showTitle (Body M Bold), body (Body S Regular), showChevron (iconSlot 250, text/tertiary). Radius/400, padding Space/400, gap Space/300. Height hugs content.
> Replaced the hand-built fluencyNote, comeBackNote, beforeYourTest, lastTime and planCompleteCard frames, Sep 2026.

**Built in code, Sep 2026,** as `src/components/NoteCard.tsx`, promoted from the section summary's inline note when the review summary needed tone `highlight` for its come-back line. All four tones and all three leading values are built: `icon` (pass `icon`), `badge` (pass `badge` with the nested `planNode`'s tone; it renders state done at size S, added Sep 2026 for the exam plan home's plan-complete card, and takes precedence over `icon`) or none. The badge is centred on the row as the masters draw it. The body is `children`; `title`, `showTitle` and `showChevron` follow the Figma properties. No new tokens. One difference from the masters: the code aligns the icon to the first line of the body rather than the row centre, so a three-line note reads from the top.

### `bottomNav`

**Axes:** `active` (chat, plans, trophy, profile). 4 variants. No other properties.

**Reach for it** on any screen that shows the app tab bar. The plan and session screens have `plans` active; the app home has `chat`.

**What the state means.** The active tab is the section the student is in, drawn in primary text; the rest are tertiary.

**Don't** hide a tab or change its glyph per screen; the bar is app chrome and is the same everywhere. Don't recolour an inactive tab to hint at something; there is no such state.

> bottomNav: the app tab bar. Four tabs (chat, plans, trophy, profile) as 44px iconSlots, 1px divider on top (border/default), 16px vertical padding. active: which tab is text/primary; the rest are text/tertiary. Existing app chrome, rebuilt as one component so the eight screens that carry it stay in sync. Built from the hand-built bottomNav frames, Sep 2026.

**Built in code, Sep 2026,** as `src/components/BottomNav.tsx`, promoted from the exam plan home's inline bar when the app home needed the same bar with `chat` active. `active` follows the Figma axis. The tabs are `Control/1200` (48) rather than a loose 44, and the bar pulls itself out of the scaffold's `bottomContent` padding to reach the edges and the home-indicator inset. `hrefs` makes a tab a link (added Sep 2026 so a tester can move between app home and plan home): the active tab and any tab left out stay inert, so trophy and profile, outside this flow, do nothing. One glyph, `myai-chat`, is not in `IconSlot`, so the Chat tab shows `send-01` as a placeholder marked `data-placeholder-glyph`; see Known gaps. `target-04` and `trophy-02` were added Sep 2026.

### `listItem`, Outlined and Outlined Compact

`listItem` is Knowunity's row component, restored as a local set this sprint. Two variants were added to its existing `variant` axis: `Outlined` and `Outlined Compact`. `listItemOutlined` is retired and every instance now points here.

**Axes:** `variant` (Filled, Filled Compact, Transparent, Outlined, Outlined Compact), `trailing` (Icon, Icon & Text, Switch, Checkbox, None), `state` (Default, Pressed, Selected). **Properties:** `title`, `subtitle`, `showSubtitle`, `showIcon`, `showIllustration`, `showImage`, `showEmoji`, `emoji`, `rightIconText`. Outlined has no Switch trailing, mirroring Filled.

**Reach for Outlined** for a row that reads as a control without competing with a filled card: the app home row, the onboarding single-choice lists. **Reach for Outlined Compact** where the same row has to be dense.

**What each state means.** `Default` is resting: no fill, strong border, 3px lip. `Pressed` is the finger down: the lip collapses and the content sinks, the same rule as `button` Tertiary. `Selected` is the moment after release: surface fill, no stroke, no lip. In the app it is a moment, not a resting state; press sinks, release fills, then the screen advances.

**Don't** give Outlined a fill to make it a card; that is `noteCard` tone `outlined`. Don't use it for the plan-home section row, which has no lip and a divided trailing cell; that is a gap, not an override. Don't leave `showSubtitle` on for a Compact row; it is a fixed 60 with clipping on and the second line is cut.

> OUTLINED (added Sep 2026, replaces the retired listItemOutlined): the list-item equivalent of button Tertiary, matching the outlined row on the app home and the single-choice rows in exam plan onboarding. No fill, border/strong 1px, 3px bottom lip, radius 24 (Radius/600).
> - Pressed: lip collapses to 1px and the content sinks 2px (paddingTop +2, paddingBottom -2), same rule as button Tertiary.
> - Selected: background/surface fill, no stroke, no lip. In the app this is a moment, not a resting state: press sinks, release fills, then the screen advances. Same idiom as the chosen grade in the grade picker.
> - No Switch trailing, mirroring Filled.
>
> RESTORE NOTES: this set was restored from Knowunity's remote listItem. Nested Icon Slot orphans were replaced with local iconSlot (24/32/40; 40 is the new Icon/500). Leading placeholder glyph is graduation-hat-02 because -01 is not reachable. Fixed widths and an absolute-positioned frame from the restore were set to fill so rows resize.
>
> OUTLINED COMPACT (added Sep 2026): Outlined at the Filled Compact size (60 tall, 12/16 padding, 32px leading icon). Same Default / Pressed / Selected rules as Outlined. Intended for the plan-home section row and any dense outlined list.

**Built in code this sprint** as `src/components/ListItem.tsx`, on `IconSlot` (300 / 400 / 500 by variant), for 48 of the 63 variants: `trailing` offers Icon, Icon & Text and None. Switch, Checkbox and the illustration leading slot nest components that do not exist in code and are in Known gaps. Row heights are `Control/1400`, `/1500`, `/1800` — the last two added Sep 2026 because 60 and 72 were loose. Rows are fixed height with clipping, as drawn. Filled carries an inner-shadow lip at `Elevation/Lip/lg` (`/sm` for Compact) like a filled button; Outlined carries the outlined lip tokens.

**Knowunity's states, followed literally.** The description covers only Outlined. For the original three, geometry is the only source and it is uneven: Transparent Pressed fills with surface and rounds to `Radius/600`; Transparent Selected is identical to Default; Filled Pressed is identical to Default; Filled Selected flips to `background/inverse` only with trailing None (and Checkbox, not built) — Icon and Icon & Text stay surface. Text on the inverse rows uses `text/inverse`, which the file does not specify. Outlined Selected keeps an inner-shadow effect in the file that would draw a lip on the surface fill; the description says no lip and wins.

**Also noted.** The leading placeholder glyph `graduation-hat-02` is not on the `iconSlot` swap list, so the code defaults both slots to `check`; the glyph itself is in `IconSlot` since Sep 2026 and a screen can pass it. The image slot's placeholder fill binds to `feedback/info`, a variable with no leaf token; with no image the box is empty.

### `summaryCard`, overflow row

Three properties were added to the existing set: `showRow1`, `showOverflowRow` and `overflowText`. Nothing else about the card changed.

**What they mean.** `showOverflowRow` turns on a fourth row with a plus in the icon position and a chevron on the right; `overflowText` is what it says ("3 more", or "8 terms" when the card is collapsed to nothing but the header). `showRow1` off collapses the card to header and count. Expanded is the same card with rows on and the overflow row off.

**Don't** let the component decide how many rows to show; the screen does, by category. Don't put the plus without the chevron; the plus sits where the check and cross sit, which are status icons, and on its own it reads as one. Don't use the row for anything other than "there is more here."

> OVERFLOW / COLLAPSE (added Sep 2026): Row overflow (showOverflowRow, overflowText) is the collapse affordance, not just overflow handling. Plus icon in the row-icon position, chevron-down trailing; both take the tone colour. showRow1 lets a card collapse to header + count row ("8 terms").
> The component never decides how many rows to show; the screen does:
> - Section summary (3 to 5 items): everything open, no overflow row. (Superseded Sep 2026: see `expandableSummaryCard`.)
> - Repeat summary: two groups only, right and wrong. Wrong is always fully open (that is the work). Right shows up to 3 then "N more", or collapses to header + "N terms" when the list is long. No grouping by history or by how the term was tested.
> Expanded is the same card with rows on and the overflow row off; build it as a second frame for the prototype.

**Built in code this sprint** as `src/components/SummaryCard.tsx`, composed on `IconSlot` at 250 for the row, plus and chevron icons. No new tokens. Props are the Figma properties by name — `tone`, `showRow1`–`3`, `term1`–`3`, `showOverflowRow`, `overflowText` — plus a code-only `onOverflowPress`, because the overflow row is an affordance and so is a `<button>`; the other rows are list items, as the DON'T says. The card fills its parent. A second code-only prop, `terms` (added Sep 2026 for the repeat summary), takes the whole list for the expanded and fully-open states, because three named slots cannot hold twelve terms; given `terms`, the card ignores `showRow1`–`3` and `term1`–`3`. The screen still decides when to pass it.

**Exception to the sentence-case rule, decided Sep 2026.** The four headers render in capitals as the masters draw them — `CORRECT WITHOUT HELP` (was `GOOD EXPLANATIONS` in code until the review summary build, Sep 2026; SPEC.md Open 13), `NEEDED A HINT`, `NEEDS PRACTICE`, `SKIPPED`. This is the one place in the system that does, and it was chosen over the Never rule deliberately. The strings are stored in capitals, not transformed, so the DOM matches the screen.

**Where the file and the description disagree.** The description says "header … swap the text", but the set has no `header` property; each tone bakes its string in, and so does the code. The masters place their icons as raw instances rather than through `iconSlot`, against the icon rule — the code goes through `IconSlot`. Skipped's row icon is `text/tertiary`, which the description omits. The overflow `plus` and `chevron` are drawn filled at 0.75 stroke where the row icons are 2px line; `IconSlot` renders all at one weight. The OUTSTANDING note about placeholder squares is stale: the masters now carry the glyphs it asked for.

### `expandableSummaryCard`

**Axis `view`:** `open` (every term), `overflow` (three, then "N more"; a list of three or fewer is shown whole), `collapsed` (header and "N terms"; a single term is shown whole, since the count row would take the same height). Pressing the overflow row opens the card, and it stays open. **Properties:** `tone` (passed through to `summaryCard`), `names` (every term in the outcome, in round order).

**Where the screen sets the view (Sep 2026).** Section summary: Good and Partial `collapsed`, Needs practice `open`, so a first pass reads as a list to come back to, not a score. Review summary: Good and Partial `collapsed`, Needs practice `overflow`, so "How you felt" is on screen on arrival however many terms were missed. Exam-eve repeat summary: Needs practice `open`, Partial and Good `overflow`, as before.

**Don't** close a card again, and don't collapse Needs practice to a count: at least its first three terms are always shown.

**Built in code, Sep 2026,** as `src/components/ExpandableSummaryCard.tsx`, promoted from the `Card` wrapper the review and exam-eve summaries each built inline, when the section summary became the third screen to need it. `view` replaces that wrapper's `open` boolean and adds `collapsed`. No new tokens.

### `verdictChip`

**Axes:** `tone` (Correct, Partial, Incorrect, Skipped). 4 variants. No other properties: the label and glyph are baked into each variant.

**Reach for it** directly above Knowie's response text in the turn loop, reporting how the last answer was judged. Not for filtering or tagging — that is `chips`.

> The per-turn verdict pill. Four tones, one per outcome of an answer.
> USE: directly above Knowie's response text in the turn loop, reporting how the last answer was judged.
> DON'T: use it as a filter or a tag — that is what chips is for. A verdict pill says something was assessed.
> TOKENS: each tone pairs feedback/<tone>/bold as the fill with feedback/<tone>/onBold as the label and icon. Skipped uses background/inverse and text/inverse, because a skip is not a judgement.
> BUILT FROM: a detached chips size=S, so the geometry is Knowunity's — 32 tall, 12px side padding, 4px gap, a 16px leading icon slot.
> OUTSTANDING: the leading icons are placeholders inherited from chips. Correct wants a check, Partial and Incorrect a circular arrow, Skipped a skip glyph. Swap them via the icon slot.

**Built in code this sprint** as `src/components/VerdictChip.tsx` on `IconSlot` at 200. Height is `Control/800` (a loose 32 in the file). Labels: Correct, Almost there, Try again, Skipped.

**Fixed in the Figma master, Sep 2026.** Every master's icon stroke was a raw black paint, unbound — the dropped-binding problem above — while the description said onBold. All eight strokes (leading and hidden trailing, four tones) are now bound to `feedback/<tone>/onBold`, `text/inverse` for Skipped, and the bubble's nested chip followed. The stale OUTSTANDING note was replaced with the glyphs the masters actually carry; Incorrect uses a cross, not the arrow first proposed. A hidden trailing icon slot inherited from chips has no property and is not built.

### `responseBubble`

A single component, not a set. **Properties:** `showVerdict`, `showAction`, `body`, `body2`.

**Reach for it** as the one container for everything Knowie says in the turn loop, from the first prompt to the reveal. Never a student's words.

> Knowie's response card. Carries the prompt on an idle turn, and the verdict plus feedback after an answer is judged.
> USE: the single container for everything Knowie says in the turn loop. It appears in every state from the first prompt through to the reveal.
> DON'T: put a student's own words in it. This is Knowie speaking; a transcript of the answer would need its own treatment.
> PROPERTIES: showVerdict toggles the verdict pill, off for a plain prompt and on after judging. showAction toggles the inline button, used for "Explain more" on an incorrect verdict. body swaps the text.
> TOKENS: background/surface fill, Radius/600 corners, Space/400 padding and gap, Body M Regular in text/primary.
> OUTSTANDING: the body is one text node, so the term cannot be bolded inside the prompt the way the app does it. Doing that needs either rich text or a separate term slot — worth deciding before the prompt states are built.

**Built in code this sprint** as `src/components/ResponseBubble.tsx`, composing `VerdictChip` and `Button` (Secondary, M). Three code-only props: `verdictTone` (in Figma you select the nested chip), `actionLabel` (defaults to "Explain more") and `onActionPress`. The card fills its parent.

**Where the file and the description disagreed, and what changed Sep 2026.** The file has a second text node, `body2`, in Body M Bold, which the description never mentioned and no property toggles; the description now records it, and the code renders it only when given. The action button read "1/2 words"; it now carries "Explain more" per the description. Its instance is stretched to the bubble's width with the pill centred inside; the code centres a hug-width pill in a full-width row instead. The stale OUTSTANDING note on `summaryCard` was replaced in the same pass.

### `chips`

**Axes:** `size` (XXS, XS, S, M), `color` (Primary, pro), `active` (False, True). 16 variants. **Properties:** `showLeftIcon`, `showRightIcon`, `Text`, and a swap on each nested `iconSlot`.

**Reach for it** for topic tags, filters and counts — in `chipsGroup` rows and the top navigation. Never for a verdict; that is `verdictChip`.

> A small pill carrying a short label, with optional icons either side. Sizes XXS through M, in Primary or pro, with an active state. Each icon sits in an iconSlot.
> USE: topic tags, filters and counts. In the example screens it appears in horizontal chipsGroup rows and inside the top navigation.
> DON'T: use it for verdicts. The color property offers only Primary and pro, so there is no success, error, warning, info or partial tone, and recolouring an instance breaks the link to the system.
> NOTE: the property named color mixes a role (Primary) with a product tier (pro). It is closer to a tone property than a colour one.

**Built in code this sprint** as `src/components/Chips.tsx` on `IconSlot` (150 / 150 / 200 / 250 by size). Heights: `Control/500` (20), `Control/600` (24), `Control/800` (32), `Control/1000` (40) — the first two added Sep 2026, since XXS and XS were loose numbers on no scale. `active` keeps the file's string values. A code-only `onClick` makes a chip a pressable filter with `aria-pressed`; without it a chip is a plain span, as tags and counts are.

**Fixed in the Figma master, Sep 2026.** All 32 icon strokes (16 variants × 2 slots) were raw black and unbound — the dropped-binding problem above. Each is now bound to the token its own label carries: `text/primary` when inactive, `interactive/onPrimary` on active Primary, `pro/onBold` on active pro. The code already inherited the label colour, so the file now matches what was built.

**Where the file and the description disagree.** The M-size icon is a 16px glyph scaled to 20, giving a 2.5px stroke — the same fault the 32px `iconSlot` had; `IconSlot` renders one weight. Caption S Bold at XXS and XS is 12px, which the type token itself flags as below the readable minimum; the code follows the file.

**`iconTone` (added Sep 2026, code-only).** `label` (default) gives the icons the label colour. `info` makes them `feedback/info/onSubtle` while the label keeps its colour, as the app home quick actions draw them (checked against "App home / Default"). The colour is set on a wrapper around each nested `iconSlot`, never on `iconSlot`, following the leading-icon exception in Icons.

### `iconSlot`

**Axes:** `Size (IGNORE)` (100, 150, 200, 250, 300, 400, 500 — 8 to 40px on the Icon ramp). 7 variants, default 400. **Properties:** one instance-swap holding the glyph, default `check`, offering 69 icons. `IconSlot` in code offers 72: `plus` was added Sep 2026 for `summaryCard`'s overflow row, and `dots-vertical` and `share-02` for `appBar`, but none of the three is on the swap list — see Known gaps. Ten more — `globe-01`, `target-04`, `book-open-02`, `clipboard-check`, `thumbs-up`, `lock-01`, `trophy-02`, `list`, `graduation-hat-02`, `upload-cloud-02` — were added to the swap list and to `IconSlot` together, Sep 2026, linked to the published Untitled UI library.

**Reach for it** wherever an icon sits inside another component. Never place an icon directly.

**What the axis means.** Size is the box, bound to an `Icon` step. The glyph fills it. The slot carries no colour: it inherits from whatever it sits inside.

**Don't** give the slot a colour, and don't use a glyph outside `IconSlot`'s list — that is a gap to report, and when one is added it goes on the Figma swap list and in `IconSlot`'s map in the same pass, which needs a *published* source component.

> A fixed-size box holding one swappable icon. Six sizes from 8 to 32px, matching the Icon ramp.
> USE: anywhere an icon sits inside another component. This is the most-used component in the file at 165 instances, most of them nested inside chips.
> DON'T: set the size on the slot itself — the parent is meant to drive it.
> GUESS: the DON'T follows from the property being named "Size (IGNORE)". The property works and its options map exactly to the Icon tokens, so I do not know what the IGNORE is protecting against.

**Size 500 and the 250 repair.** One variant was added, `Size (IGNORE)=500` at 40px, for the leading icon in `listItem` Filled. The 250 (20px) variant was also repaired: it had collapsed to 1px in the master, which is why every 20px icon in the file rendered as a dot. The default glyph on all sizes is now `check`; the previous placeholder, `square`, had no source component and showed "restore component" on every unswapped slot.

**Built in code this sprint** as `src/components/IconSlot.tsx`. It needed no new tokens at first — all seven `Icon` steps already existed — but **`Icon/700` (56) was added Sep 2026** for `voiceInput`'s idle button, along with a code-only `size="700"`. There is no 700 on the Figma axis; see Known gaps.

**One glyph is not from the package.** `microphone-01-solid` is drawn locally in `src/components/icons/`, because Untitled UI's free tier ships line style only. Everything else on `IconSlot` is the same drawing as its Figma counterpart, and that is the point of the component; this one is the documented exception, with the rules for adding another in `src/components/icons/README.md`.

**Where the file and the build differ.** The masters draw a 2px stroke at every size on the ramp. The build lets it scale with the glyph instead, so the stroke is always a twelfth of the box: 1px at 12, 1.33 at 16, 1.67 at 20, 2 at 24, 2.67 at 32 and 3.33 at 40.

Decided Sep 2026, by looking rather than by reasoning. A constant 2px holds the number and not the proportion, and the proportion is what reads: at 16px the line is an eighth of the glyph and at 40px a twentieth, so the small icons came across heavy and the large ones thin. Two intermediate rules were tried and rejected on screen — capping at 2 and scaling only below it left the 32px plan nodes and the 40px mic still thin, and a 1.5px floor would have needed a `Stroke` step that does not exist and breaks the scale's doubling. Plain proportional needs no token and no exception: the 20px calendar and target on the exam plan home were the reference, they read correctly at 1.67, and everything else follows from the same ratio.

`vector-effect: non-scaling-stroke` is therefore gone from `IconSlot.module.css`, and no stroke number is written there. The smallest glyph in use is the 16px verdict chip at 1.33.

The masters were left alone: the file is the reference, not the target, and repairing 325 instances was not this sprint's work.

**Two faults fixed in the Figma master, Sep 2026.** The 400 variant's glyph rendered a 2.667px stroke where every other size renders 2, because its nested icon had been *scaled* to 32 rather than resized — scaling multiplies stroke weight, resizing does not. The wrong `Icon/300` binding was a separate fault and repointing it fixed nothing on its own; resetting the vector's `strokeWeight` to 2 is what corrected it. Separately, the component set's width was pinned at 216 with `clipsContent` on, while its horizontal auto-layout needs 272 — so the 500 variant, last in the flow, fell outside and rendered nothing at all: null render bounds, blank export. The set is now set to hug, so adding a variant cannot reintroduce it. Only the master was affected; all 38 instances of the 500 rendered correctly throughout.

**Where the file and the description disagree.** The description says six sizes ending at 32px; there are seven ending at 40, because it predates the 500 above. On instance counts all three numbers differ: the Figma description says 165, this file said 325, and the measured count in Sep 2026 is **350** — 135 at size 300, 95 at 400, 60 at 250, 38 at 500, 22 at 200, none at 150 or 100. Counted with `getInstancesAsync` per variant; the figures above it are historical and were not re-measured.

**Deviations in code.** `Size (IGNORE)` becomes a `size` prop, keeping Figma's option values — the Figma name is not a valid identifier, and a prop is exactly the "parent drives it" the description asks for. The swap property becomes a `name` prop typed to the 72 glyphs, with no `children` escape hatch, so a caller cannot place an icon directly. Colour is `currentColor` rather than a per-vector binding, which removes the Figma problem where swapping a glyph drops its colour. A `label` prop was added for assistive tech, with no Figma counterpart: slots are `aria-hidden` unless labelled.

### `appBar`

**Axes:** `variant` (default, leftIconButtonOnly, leftAndRightIconButton, leftAndRightButton, leftAndTwoRightIconButtons, leftAnd2RightButtons). 6 variants. **Properties:** `Slot`. Nests `App Bar Button Icon` (`variant` default, `state` Default, Pressed, Disabled, Loading) and `App Bar Button` (`variant` text, the same four states, `Text`).

**Reach for it** as the top edge of any full screen, in the scaffold's `topNavigation`. During a session its slot carries a `progressIndicator` at thickness 16.

**What each variant means.** `default` is the slot alone. The rest add a back control on the left and, on the right, nothing, an overflow icon, a text action ("Skip"), share plus overflow, or overflow plus a text action.

**Don't** put more than one thing in the slot. Don't use `App Bar Button` or `App Bar Button Icon` outside the bar; the text control is not `button` variant=Text, which has a different type step, padding and press.

> The top bar of a screen. 375 wide, 56 tall, with a SLOT across the middle that holds whatever the screen needs. Six variants covering a left control plus one or two right controls.
> USE: the top edge of any full screen. In the example screens the slot carries the progress indicator during a recall session.
> DON'T: expect the slot to lay out more than one thing.
> GUESS: the DON'T is inferred from the slot holding a single child; I have not tested it with more. Also note that no instance of this component set appears anywhere in the file, yet frames named appBar sit above five progress indicators — those are likely detached or renamed, so the component may not be what is actually in use.

`App Bar Button Icon` and `App Bar Button` have empty descriptions in Figma.

**Built in code, Sep 2026,** as `src/components/AppBar.tsx`, `AppBarButtonIcon.tsx` and `AppBarButton.tsx`, all composed on `IconSlot` (300 in the icon button). Width fills; height hugs to 56 (`Control/1200` row plus `Space/200` bottom padding), so no height token was added. `Slot` is a `slot` prop. The nested glyphs, labels and handlers are code-only props on the bar (`leftIcon`, `rightIcon`, `secondRightIcon`, `buttonText` and their `…Label` / `on…Press`), defaulting to the masters' `arrow-left`, `dots-vertical`, `share-02` and "Skip". The fade is two stacked `background/page`-to-transparent layers, as drawn. `dots-vertical` and `share-02` were added to `IconSlot` for this, code-only.

**Where the file and the build differ, decided Sep 2026.** The icon button's four masters are drawn identical; in code Pressed and Disabled follow `App Bar Button` — `text/secondary` pressed, `text/disabled` disabled. `App Bar Button` hugs its label to a 30-wide target; in code it takes `Control/1200` as a minimum width with the label kept at the end edge. Loading is not built on either (see Known gaps). The slot's loose 10px padding and gap are dropped: with one centred child they change nothing. The icon masters' glyph strokes are raw black; each bar instance overrides them to `text/primary`, which the code sets once on the control.

### `progressIndicator`

**Axes:** `variant` (Primary, Coral), `thickness` (24, 16), `progress` (0, 25, 50, 75, 100). 20 variants. **Properties:** `showText`.

**Reach for it** for position in a multi-step session, in `appBar`'s slot at thickness 16.

**What each value means.** `progress` steps are design references, not the range. `showText` shows a count ("3/12") centred on the bar, at thickness 24 only; the 16 masters have no text layer. At 0 the fill is a dot as wide as the bar is thick.

**Don't** snap real progress to the five steps; drive the bar. Don't copy the `Coral` naming (see Naming).

> A horizontal progress bar with an optional count label. Twenty variants: Primary or Coral, 16 or 24 thick, in five progress steps.
> USE: position in a multi-step session. Every use in the example screens is Primary at thickness 16, inside an appBar slot.
> DON'T: treat the five progress steps as the full range. 0, 25, 50, 75 and 100 are design references; real progress needs the bar driven directly.
> NOTE: the variant property is named Coral, an appearance word, where every other component in this file names variants by role.

**Built in code, Sep 2026,** as `src/components/ProgressIndicator.tsx`. Code-only `current` and `total` drive the fill and the count label directly and override `progress`; `showText` renders only with a count. Code-only `label` names the `progressbar` role. Thickness 24 is `Control/600` inset by `Space/050`; thickness 16 is **`Control/400`, added Sep 2026** because 16 was on no scale. Primary fills `accent/brand/bold`, Coral `accent/coral/bold`, on a `background/stacking` track with a `border/default` stroke at `Stroke/Border`. Width fills. The fill animates at `motion.duration.base`, which reduced mode collapses. The label is Caption S Bold (9px, below the readable minimum), so it is `aria-hidden` and the count goes to `aria-valuetext`.

### `chatInput`

**Axes:** `Status` (Inactive, Typing, Loading, Ready to send, Long input, Recording). 6 variants. No other properties. Figma name `Chat Input`, in Restored components → Input. Nests `OLD Icon Button` twice and `iconSlot` at 300.

**Reach for it** as the text route in the recall loop, anchored at the bottom of the screen, when a student chooses to type or cannot speak.

**What each state means.** `Inactive` is empty and unfocused, with the microphone trailing. `Typing` is focused and still empty. `Ready to send` has one line and swaps the microphone for send. `Long input` has wrapped: the field grows upward, the corners drop to `Radius/600` and send stays on the bottom edge. `Loading` is sent and waiting, with `loading-01` in the trailing place. `Recording` draws a waveform in the field with a close control on the left.

**Don't** show recording in it; this prototype does not. Don't treat it as the main answer route.

> The input field to be used when a student chooses, or needs, to fall back to text entry over voice input.

Added to the Figma set, Sep 2026.

**Built in code, Sep 2026,** as `src/components/ChatInput.tsx`, composing `ButtonIcon` (send: Primary M; microphone: Text L) and `IconSlot` (Loading). `Status` keeps the Figma name and options, minus **Recording, which is not built** — recording is not shown inside the chat input in this prototype. Left unset, `Status` is derived from focus and text; Loading is only ever passed. **The leading plus control is removed,** decided Sep 2026: it reads as adding a file, and this flow has no attachments. Code-only: `value`, `defaultValue`, `onValueChange`, `placeholder`, `label`, `onSend`, `onMicPress`. The field is a real `<textarea>` that grows with its text. **Inter was added** for its text: `primitive.font.family.inter`, `primitive.font.size.inter-sm` (14), `primitive.font.lineheight.inter-sm` (17) and `typeScale.input.s-bold`, declared in `src/app/fonts/fonts.css`, with Greed's OpenType features switched off on the field. **The field moved to `Input/M` (16) in Sep 2026** — see Three things that will break the build if missed. The masters draw 14, and the build does not, because iOS Safari zooms the page on any field under 16 and that breaks the typed turn's pinned layout.

**Where the file and the build differ.** The masters nest `OLD Icon Button`, not `buttonIcon`: its radius binds `Scale 06` (32, not a token; `buttonIcon` uses `Radius/Full`), and send is `background/inverse` with a 16px glyph where `buttonIcon` M is `interactive/primary` (the same colour) with 20px. The microphone is a bare `iconSlot` in the masters with no tap target; in code it is a Text L `buttonIcon` whose 56 target overhangs the field's padding. The placeholder is "Type your answer", not the masters' "Ask anything...", which is AI Chat copy. The masters still carry the plus control. Loading does not spin. The Recording waveform's 33 bars are collapsed to 1×1 in the file.

### `mascotSlot`

**Axes:** `size` (XL, 2XL, 3XL, 4XL). 4 variants, default XL. Each nests `.mascotSlotBase`, whose instance-swap `Homie` holds the expression, default `standby`.

**Reach for it** wherever Knowie appears. Knowie's words go in `responseBubble`, never in the slot.

**What the axis means.** Size is the box, bound to `Illustration/800`, `/1500`, `/2500`, `/4000` (64 / 120 / 200 / 320), with `Space/300` padding inside.

**Don't** make Knowie speak, scale an instance between steps, recolour Knowie, or make the slot a button.

> mascotSlot: a fixed square box that holds Knowie. Wherever Knowie appears, it sits in a mascotSlot; never place the artwork directly.
> size: XL (64, Illustration/800) | 2XL (120, Illustration/1500) | 3XL (200, Illustration/2500) | 4XL (320, Illustration/4000). Space/300 padding on every side, so the artwork never touches the box edge. The size is the box, not Knowie.
> Expression: swapped on the nested .mascotSlotBase (Homie). Default standby. Pick the face for what Knowie is reacting to; the slot does not choose.
> USE: the mascot on a screen, above or beside what Knowie says. Knowie's words go in responseBubble, never in the slot.
> DON'T: make Knowie speak. Knowie replies in text and has no voice, speech-bubble tail or audio.
> DON'T: scale an instance to a size between steps. Add an Illustration step and a variant.
> DON'T: recolour Knowie. mascot/* tokens are Knowie's own and never used by the interface; interface tokens never go on Knowie.
> DON'T: make the slot a button. It is decoration; the action belongs to a control beside it.
> Description drafted Sep 2026; the set had none.

**Built in code, Sep 2026,** as `src/components/MascotSlot.tsx`. No new tokens. `name` is the `Homie` swap, the same pattern as `IconSlot`, and offers the twelve expressions in `public/images/`; `determined`, `sad` and `thinking` exist only as PNG. Code-only `label` gives the image an accessible name; without it Knowie is decorative. The artwork is 200×217 and the masters stretch it to the square; the code uses `object-fit: contain`.

**Where the file and the build differ.** The set sits on no page (its parent is null) though screens still instance it, and `figma_search_components` cannot find it. `Homie`'s 16 preferred values resolve to a library this file cannot reach, not to the 10 local expression masters. `dazed` is a local master with no asset, so code does not offer it; `angry`, `overIt` and `determined` are assets with no local master.

---

### `bottomSheet`

**Properties:** `headline`, `caption`, `showCaption` (off by default), `middleSection`, `showAppBar`, `onClose`; the actions are children. No axes.

**Reach for it** for a decision or a tray that rises over the current screen: the confirm on tapping X during a round, and the section intro tray. It goes in the scaffold's `bottomSheetOnly` slot with `showBottomSheetBackground` on, and the slots behind it `inert`. It is a `dialog` named by its text.

**Built in code, Sep 2026,** as `src/components/BottomSheet.tsx`, promoted from the typed turn's inline leave confirm when the voice turn needed the same sheet. The Figma `bottomSheet` is not editable (its source lives elsewhere), so the geometry is the one the typed turn tuned, with the intro tray frame's corners: `background/surface`, `Radius/900` top corners, `Space/600` top padding, `Space/400` sides and bottom plus the home-indicator inset, `Space/400` between a `textBlock` and the actions, actions `Space/200` apart and stretched. It enters from below at `motion.duration.slow`, which reduced mode collapses. Put the safe action first as Primary and the escape under it as Text. No new tokens.

**`middleSection` and `showAppBar` (added Sep 2026)** moved the section intro tray onto the component. `middleSection` is Figma's freeform slot between the app bar and the actions; it takes the headline block's place, scrolls if it outgrows the sheet, and `headline` then only names the dialog. `showAppBar` adds the Bottom-sheet App Bar: Control/1800, padded Space/300, the handle Space/800 by Space/100 in `background/floating` at Radius/100; with `onClose` it is a close target. The corners moved from `Radius/600` to `Radius/900` in the same pass, because the tray is the one frame drawn from Figma's `bottomSheet`; the leave confirm had no frame. The sheet is never taller than its container.

### `permissionAlert`

**Properties:** `title`, `body`, `onDeny`, `onAllow`. No axes.

**Reach for it** for the mocked iOS microphone prompt, once per browser session on the first mic use: on Start in the section intro tray, or on the first tap of the voice control when a round is entered without the tray. It reproduces the OS alert, so its two buttons keep iOS's own "Don't Allow" / "Allow", the one place the sentence-case rule is not applied. It goes in the scaffold's `bottomSheetOnly` slot with `showBottomSheetBackground` on and the slots behind it `inert`, and it is an `alertdialog` named by its title.

**Built in code, Sep 2026,** as `src/components/PermissionAlert.tsx`, promoted from the voice turn's inline alert when the section intro tray needed the same prompt. There is no Figma component or frame (SPEC.md Open 6): `background/surface` on a `border/default` edge at `Radius/400`, Body M Bold title over Body S Regular body in `text/secondary`, `Space/400` padding, two `Control/1200` actions split by a `border/default` divider in `text/link`, Allow in bold as iOS marks the preferred choice, the whole thing centred inside `Space/1200`. The OS blur has no effect token, so it is not drawn. No new tokens.

### `textBlock`

**Axis:** `size` (M, S), added Sep 2026. **Properties:** `headline`, `caption`, `showCaption` (off by default). Code-only: `as` sets the heading level.

**size.** M is Headline M with the caption Space/150 below (the summary headlines). S is Headline S with the caption Space/050 below, as the review summary's comparison draws the pair; the app home study reminder and the test-day panel's headline use it too.

**Reach for it** for a screen or section heading with an optional line under it. Not for body copy, and not for a label with a trailing count (the summaries' group labels are still hand-built; see `docs/component-gaps.md`).

**Built in code this sprint** as `src/components/TextBlock.tsx`, promoted Sep 2026 from the inline headline in the section summary when the exam-eve repeat summary needed the same block with its caption shown. There is no Figma component: the summary frames draw a `verdict` frame of two text nodes, Headline M over Body M Regular, both `text/primary`, centred, `Space/150` apart, and that is the geometry in code. The block fills its parent, per the rows-and-cards-fill convention.

### `topBar`

**Axis:** `variant` (home, plan). **Properties (home only):** `xp`, `streak`.

**Reach for it** for the app bar on the app home (`home`: menu, the Pro / XP / streak counters and the focus timer) and the exam plan home (`plan`: a kebab on the right). Neither fits an `appBar` variant.

**Built in code, Sep 2026,** as `src/components/TopBar.tsx`, promoted from the two inline bars. Counters are Body S Bold pills at Radius/full (pro/subtle, feedback/info/subtle, accent/coral/subtle) with an `art/*` asset at Icon/250 (the Pro wordmark at Icon/500). The home icons are Control/1000 as drawn; the plan kebab sits in Control/1200. Everything on it is app chrome outside this flow, so it is decoration and nothing is a target. No Figma component exists.

### `testDayPanel`

**Axis:** `size` (M, S), the headline. **Properties:** `headline`, `body`, `cta`, `onAction`. Code-only: `as` sets the heading level.

**Reach for it** for the reminder the day before the test: exam plan home in complete mode (`size="S"`) and the app home's exam-eve hero (`size="M"`).

**Built in code, Sep 2026,** as `src/components/TestDayPanel.tsx`, promoted from the plan home's inline panel when the app home's eve hero turned out to be a copy. It composes `mascotSlot` 2XL (thinking, labelled), a `textBlock` headline, a Body M Regular line in `text/secondary` and `button` Primary L. All four are Space/300 apart and the action keeps Space/300 above and below, as both frames draw it (checked against the frames Sep 2026). No Figma component exists. The screen owns the padding around it.

### `voiceInput`

**`listening`, `transcribing`, `transcribingSlow`, `judging` and `judgingSlow` run in real time. `idle`, `transcript` and `error` do not.** Stated Sep 2026 so How things behave → A resting state must not borrow a live state's cue can be checked here: the bars, the turning arc and the circling dashes belong to the five live states and may not appear on the other three. The line itself is shared from listening onward, which is why `transcript` and `error` still carry it — a line eased into a card, or closed and gone `border/strong`, is not the live cue.

**States:** `idle`, `listening`, `transcribing`, `transcribingSlow`, `transcript`, `judging`, `judgingSlow`, `error`. **Properties:** `state`; `helper` overrides the second line under the label; `idleActions` is a slot for idle's escapes; `transcript` is the read-only words. Code-only: `getLevel` (the voice level, sampled per frame while listening), `onStart`, `onStop`, `onSend`, `onDiscard`, `onRetry`.

**Reach for it** for any turn a student answers out loud, including say it back. Put it in `middleContent`; it carries its own send, discard and retry, so none of those go in `bottomContent`. The screen owns the timing: it moves the control to the slow states at 4 seconds and to `error` at 10. Pass the escapes (`button` Tertiary M "I don't know the answer", `button` Text M "Type instead") through `idleActions`, because what they do belongs to the screen.

> One `accent/brand/bold` line at `Stroke/Bold` carries every state of a voice turn, idle included, and the middle says what to do next. **The label above the ring names Knowie wherever Knowie is the one acting** — he listens, he writes down what the student said, he reads their answer — because the concept only holds if he is present while they are talking to him. The three states where the student has to act instead (idle, the transcript step, the error) address the student and leave him out: "Tap to answer", "Check it, then send", "Tap to send again". Revised Sep 2026, when the set named him in one state out of eight and then dropped him again in that state's own slow variant. The label sits above the control (Body S Bold, `text/secondary`), with a quieter second line under it (Body S Regular) where a state has one; it is a live region and carries the state on its own with motion reduced.
> IDLE: the `accent/brand/bold` ring filled with `interactive/primary`, carrying `microphone-01-solid` at `Icon/700` (56) in `interactive/onPrimary`. The whole button breathes at `motion.duration.breathing`, by `Space/100` of radius: the ring and the fill share that radius and the glyph scales by the same ratio, so it swells as one shape rather than the outline pulling away from what it encloses. A glow at a fifth of listening's. No ripple, and no lip — on a 120 circle the inner shadow reads as a band across the bottom rather than an edge. The label above reads "Tap to answer", and the screen drops it (`label=""`) after the first term of a round's main pass.
>
> IDLE, HOW IT GOT HERE: idle first drew a breathing outline round an unfilled `microphone-01` at `Icon/500`, and a tester read it as already recording, lifted the phone to his mouth and answered into a control that had never started. Three things were tried: taking the ring, glow and ripple away (unmistakable, and inert); putting "Tap to answer" inside the control in place of the glyph (clear, and it lost the mascot from the one screen that is about talking to him); and the fill. **The fill is what settled it** — idle is a solid button that invites a press, listening is an open ring with sixty bars moving in it, and no student confuses those. With that carrying the state, the ring and a reduced glow could come back. The glyph went solid and up to 56 in the same pass, because at 40 in a 120 button an outlined drawing read as weak and small. See How things behave → A resting state must not borrow a live state's cue.

Revised twice in Sep 2026. Idle first drew a breathing ring round a bare `microphone-01`, and a tester read it as already recording, lifted the phone to his mouth and answered into a control that had never started; the ring, the glow and the ripple all came off, leaving a flat filled disc. Putting the words inside the control is what actually fixed it, so the ring and a reduced glow came back: **what keeps idle from reading as live is that it says "Tap to answer", not that it is missing a ring.** The ring is the control's one continuous line and reads as its edge; what confirms recording has started is the fill dropping away, the sixty bars standing out of the ring and the words changing — three changes at once. See How things behave → A resting state must not borrow a live state's cue, which this is the worked example of. Idle carries no second line under the label; the encouragement that used to sit there ("Even a partial answer is a great start") moves into the question `responseBubble`, where it is read with the question instead of beside a control nobody is looking at. The escapes sit `Space/1000` below the disc, the label `Space/1000` above.
> LISTENING: tapping squeezes the middle like a press (`motion.duration.fast`) and swaps the microphone for "Tap when done". The `accent/brand/bold` ring draws on here at `motion.duration.base`, and from this state onward it is the one line that carries the turn. Its arrival is itself the confirmation that recording has started. Sixty bars stand out of the ring and follow the voice, up to `Space/600` long. `trash-01` (`buttonIcon` Tertiary M) appears to the left.
> TRANSCRIBING, JUDGING: the ring opens into an arc turning at `motion.duration.spin`, with three dots stepping on the same cycle. The trash stays through both waits; discarding returns to idle. THE 4-SECOND BEAT (`…Slow`): the arc becomes twelve dashes circling at `motion.duration.spin-slow`, and the label changes.
> TRANSCRIPT: the ring's own line eases (`motion.duration.slow`, `motion.easing.standard`) out into the card that holds the words, read-only, under "Here's what Knowie heard", with send (`buttonIcon` Primary M `send-01`) inside it. The trash rides with the growing edge into the card's bottom-left corner. The card grows with its words. Sending eases it back into the ring at `motion.duration.exit-slow`, which opens straight into the judging arc.
> ERROR: past 10 seconds the line closes and goes `border/strong`, the middle offers `refresh-cw-01` and the label reads "Tap to send again". Tapping re-runs judging on the same take. Grey, not red: red reads as a wrong answer.
> DON'T: show a check anywhere in this control. A check means correct, and sending is not judging.
> DON'T: say "try again" for the error. That is the miss verdict's chip.
> DON'T: put the transcript in `responseBubble` or `noteCard`. It lives in this control's card, and there is never one after judging, or an editable one.

**Built in code, Sep 2026,** as `src/components/VoiceInput.tsx`, promoted from the voice turn's inline control once the design settled (the "option D" canvas). Three tokens were added for it: `Stroke/Bold` (4), `motion.duration.spin` (1400) and `motion.duration.spin-slow` (4000), both zero in reduced mode. `motion.duration.exit-slow` (300) followed for the card's collapse. **Every number is read off the element at mount**, so sizes and durations come from `build/css/tokens.css` and reduced motion reaches the drawing: `spin` reads 0, the frame loop stops and each state draws one still frame. The line, the bars, the ripple and the dashes are SVG paths redrawn per frame outside React. **The glow is a shape, not an effect** (see Never). The label copy lives in `LABEL` and the second lines in `HELPER` at the top of the component; the voice turn overrides the second line for hints, start over and didn't catch that. The voice level is mocked by `createSpeechLevel()` in `src/mock/speech.ts`; no audio is read.

**Where the file and the build differ.** Figma's `recordingControl` is a filled white disc in idle, a gradient blob with `send-01` while recording and a still dashed ring while thinking; the build replaces all three with the one line, decided Sep 2026 because the blob's gradient and glow were off-brand for Knowunity's flat, one-accent style. The frames draw the label and the escapes `Space/600` from the ring; the build uses `Space/1000` so the glow and the bars clear the text. The frames have no transcript, slow-beat or error state. Send is `buttonIcon` Primary M (white), not the canvas's violet circle.

## Conventions for new components

These are the rules the components above follow. Anything reading this file and making a new component follows them.

**Name the set in camelCase, the axes in lowercase, the values in lowercase.** `planNode`, `state=done`, `tone=blue`. The exceptions are axes that predate this rule: `listItem`'s `variant`, which is Knowunity's, and `summaryCard`'s `tone`, from earlier in the sprint. Each keeps its capitalisation so the set stays consistent with itself; new values added to either follow the axis, not this rule.

**Axes are for things that change the structure or the meaning.** State, tone, size, leading, active. Everything else is a property: booleans named `show` plus the thing (`showTitle`, `showChevron`, `showOverflowRow`), text named for the content it holds (`title`, `body`, `overflowText`), and the glyph swapped on the nested `iconSlot`.

**One axis ignores another when it should.** `planNode` `todo` ignores `tone`. Say so in the description rather than building tone into a state where it would compete for attention.

**Every size is a token.** Width and height on a fixed-size component are bound to a `Control`, `Icon` or `Illustration` step — `Control` for the height of something a finger presses, the other two for artwork. If the size you want is not a step, add the step to `tokens/tokens.json` and name it on the existing scale (`Illustration/600` = 48, `Illustration/1000` = 80, `Control/1400` = 56) rather than snapping to the nearest one or leaving the number loose.

**Rows and cards fill; icons and nodes are fixed.** A component that holds copy has no width of its own: its instance is set to fill and the parent's padding token decides the margin. A component that is a shape has its width bound to a token and never fills.

**Colour is bound on the thing that is coloured.** Fills and strokes bind to semantic tokens on the frame. Icon colour binds on the glyph vector inside the slot, and is rebound after every swap. Text binds to a text style and a `text/*` token. Nothing carries a hex.

**No effects without an effect token.** There are none in `tokens/tokens.json`, so there are no shadows, glows or inner shadows on components. The `planNode` gloss is a filled vector inside a round clip frame, not an effect, and its colour is a token (`highlight/gloss`). The same move covers `voiceInput`'s soft glow, decided Sep 2026: it is a radial gradient fill of `accent/brand/bold` fading to transparent, drawn as a shape behind the ring, not a shadow or blur, so no effect token was added for it.

**Opacity and scale are tokens too (added Sep 2026).** `primitive.opacity` has `0`, `50`, `55` and `100`, and `primitive.scale` has `60`, named by percent like the other scales. Use them for fades, pulses and grow-in transforms instead of a bare number (`opacity: var(--primitive-opacity-50)`, `transform: scale(var(--primitive-scale-60))`). A colour mix that needs a percentage takes the opacity step as `calc(var(--primitive-opacity-55) * 100%)`, as `voiceInput`'s glow does. A value that is not a step gets a new step, named on the same scale.

**An old element becomes a component by cloning it, not redrawing it.** `createComponentFromNode` on a clone of the hand-built frame, then bind what the frame left unbound, then `combineAsVariants`. This keeps the geometry the screens were tuned to.

**Nested components stay components.** A badge is a `planNode`, an icon is an `iconSlot`, a glyph is an Untitled UI instance. Nothing inside a component is a raw drawing except a gloss or a divider, and both are named.

**The description is written before the instances are swapped.** It says what the component is for, what each axis value means, which tokens it uses, what was dropped from the hand-built version and why, and what it replaced. Dated additions are prefixed with what they are and when (`OUTLINED (added Sep 2026)`). Rules that the screen owns rather than the component (how many rows to show, which tab is active) are stated as the screen's job.

**Swap, then delete.** When a component replaces hand-built frames, every instance is placed and its properties set from the old frame before the old frame is removed. Then the old master, if there was one, is deleted, and this file and `tokens/tokens.json` are updated in the same pass.

---

## Known gaps

Say these are missing rather than working around them.

- **`voiceInput` has no Figma component.** It is built in code (see Components built this sprint); Figma's `recordingControl` still draws the earlier white disc and gradient blob, and there are no frames for the transcript, slow-beat or error states.
- **The transcript step has no Figma frame.** In code the student's words sit in `voiceInput`'s own card, read-only, before judging (Sep 2026); `responseBubble` still must not carry them.
- **No component for the review summary's "How you felt" reads.** The before-plan and today ratings side by side are hand-built in the screen as `confidenceReads`; see `docs/component-gaps.md`.
- **`bottomSheet` is not editable in the file.** Its source lives elsewhere. In code it exists since Sep 2026, with `middleSection` and the Bottom-sheet App Bar, and the section intro tray uses it (see Components built this sprint).
- **`thumbs-up` and `lock-01` are not on `iconSlot`'s swap list,** though the intro tray frame uses both (swapped by hand inside slots still named `check-circle` and `pause-circle`). Both are in `IconSlot` in code since Sep 2026 and the tray uses them.
- **No `answerOption`.** The five-position confidence check before the review round uses it to match the onboarding slider. It is not in the file's component list, in code, or in `tokens/tokens.json`.
- **No denied-mic screen** in Figma. The flow needs one between a denied mic prompt and the typed route.
- **No `buttonGroup` in code.** Its first use, the transcript's send with discard beside it, moved inside `voiceInput` in Sep 2026, so no screen currently needs it.
- **`summaryCard` Skipped and `verdictChip` Skipped are unused** by the recall loop, which has no skip. Keep or retire them deliberately.
- **No focus state on any component.** The tokens exist. This is a WCAG 2.2 gap.
- **`chips` has no tone.** It offers Primary and pro only, so it cannot carry a verdict.
- **No two-text-button group.** `buttonGroup` hardcodes an icon button on the left.
- **No `Revealed` category on `summaryCard`**, and the summary grades on final outcome rather than first attempt.
- **Five components are not editable** in this file — `bottomSheet`, `Text Field`, `Tabs`, `switch`, `Screen`. Their sources live elsewhere. Detach a copy to change one. `listItem` was restored as a local set this sprint and is editable.
- **`dots-vertical` and `share-02` are not on `iconSlot`'s swap list.** The kebab in `appBar`'s master and the plan-home `topBar` point at an orphaned `dots-vertical`; `appBar`'s share glyph is a local copy. Both are in `IconSlot` in code since Sep 2026. The Figma fix is the same as `plus`: import published copies and add their keys to the swap list.
- **No `sectionRow` component.** The plan-home section row (no lip, a divided trailing cell that is its own tap target) is not a `listItem` and is still hand-built, in Figma and in the exam plan home (`docs/component-gaps.md`). The same screen builds `Tabs`, the plan-home `topBar`, the winding path rows and the phase divider inline, because none exists in code.
- **No confidence slider.**
- **No `statusBar` component.** The scaffold's Panel Header nests `Status Bar / Mode=Night` from Knowunity's remote Bricks library. In code it is a static drawing inside `Scaffold` (09:41, full signal and battery), decided Sep 2026 as decoration; it never changes, and nothing else should use it.
- **`appBar` has no variant for either home bar.** They are `topBar` in code since Sep 2026 (see Components built this sprint); Figma still has no component for either.
- **Two glyphs are still missing from `IconSlot`:** `myai-chat` (`bottomNav`'s Chat tab shows `send-01`) and `ai-quiz` (the app home Quiz chip shows `file-question-02`), both marked `data-placeholder-glyph`. The rest once listed here were added Sep 2026.
- **The `art/*` counter assets are exported on a page-colour canvas.** `pro-badge-yellow`, `bolt-blue-sm` and `flame-orange-sm` in `public/images/` carried a 140-square `#090C18` rect behind an 18-by-22 glyph; the rect was removed from those three, Sep 2026, so they can sit on a coloured pill. Six more (`bolt-blue`, `books-green`, `cards-blue`, `school-orange`, `notes-purple`, `target-green`) still carry it.
- **Untitled UI's free tier is line-only, so there is no solid microphone.** All 2,349 glyphs in `@untitled-ui/icons-react` are `fill: none` with a 2px stroke, and the outlined `microphone-01` read weak sitting on `voiceInput`'s filled idle button at 56px. `microphone-01-solid` is therefore drawn locally in `src/components/icons/`, the only glyph in the system that is not the same drawing as its Figma counterpart — and it has no Figma counterpart at all. The real fix is the paid tier's solid set, which would also settle the licence question above. Added Sep 2026.
- **`iconSlot` has no 700 (56px) variant in Figma.** The Icon ramp stopped at `500` (40), a third of `voiceInput`'s 120 idle button, so `Icon/700` was added to `tokens.json` and `size="700"` to `IconSlot` in code, Sep 2026. The Figma axis still ends at 500; adding it there is a variant on the set, not a new component.
- **Several of Knowie's expressions read ambiguously.** The mascot set came over from Knowunity and its faces do not map cleanly onto the states this flow needs: the difference between encouraging, thinking and pleased is not reliably legible at the sizes the screens use, so a screen cannot lean on the expression to carry a beat. Inherited, not built here, and not repaired this sprint — the screens carry the state in the label and the copy instead. Noted Sep 2026.
- **`App Bar Button Icon` and `App Bar Button` have no Figma description,** and neither has Loading built in code: it needs wiring to `motion.duration.spin`, which exists since Sep 2026, the same as `button`.
- **`progressIndicator` instances come in 28px tall on a 16px bar.** The wrapper does not hug. Set the instance to a fixed 16 until the master is fixed.
- **`button`'s Loading state is not built in code,** and neither are its `showLeftIcon` and `showRightIcon` properties. The blocker is gone — `IconSlot` now exists and `@untitled-ui/icons-react` is installed — so what remains is wiring `Button` to it. Two things to settle when someone does: `Button` sets its label colour on the label, and it has to move up to the pill so the label and both icons inherit from one place; and Loading needs wiring to a rotation: `motion.duration.spin` was added Sep 2026 for `voiceInput` and is the spinner cycle to use.
- **`iconSlot`'s 400 variant is missing its height binding.** Its nested instance binds width to `Icon/400`, but the height is a loose 32. Setting one dimension through the plugin API clears the other, so this one has to be bound by hand in Figma. Siblings 300, 200, 150 and 100 bind both dimensions, so the file supports it.
- **`iconSlot` sizes 150 and 100 have no instances.** 12px and 8px are unused across all 350 iconSlot instances in the file. Either they are for something not built yet, or they can go.
- **`plus` is an orphan in the file.** `summaryCard`'s overflow row uses a `plus` whose component key is not published anywhere importable — the same problem as `dots-vertical`. It cannot be added to `iconSlot`'s swap list (an attempt was made and reverted, Sep 2026), so it is on `IconSlot` in code but not on the Figma slot. Fix: import `plus` from the published Untitled UI library, re-point the four summaryCard masters at it, and add that key to the swap list.
- **`listItem` is missing three nested components in code:** `switch` (trailing Switch, 3 variants), `Checkbox` (trailing Checkbox, 12 variants) and `illustrationSlot` (the `showIllustration` leading slot, every variant). None exist as React components; `switch` is not editable in the file either. Until they are built, `ListItem` offers trailing Icon / Icon & Text / None and no illustration slot.
- **`chatInput`'s masters nest the retired `OLD Icon Button`,** whose radius binds `Scale 06` — a variable outside `tokens/tokens.json` — and still carry the leading plus control that code removed. Re-point send at `buttonIcon` and remove the plus. Its Recording variant's waveform bars are collapsed to 1×1.
- **Only `voiceInput` spins.** `buttonIcon` and `chatInput` Loading still show a still `loading-01`. The Sep 2026 decision against a rotation duration was reversed once `voiceInput`'s design settled; `motion.duration.spin` exists, and the Loading states are not yet wired to it.
- **Two kinds of number in `voiceInput` are still not tokens.** Its glow's gradient fades out at a 68% stop, and no token group covers gradient stops (`primitive.gradient.stop.68` would be the name). Its per-state drawing values in `VoiceInput.tsx` (line length, glow strength, waveform amplitude, the eased press) are animation parameters computed each frame, not design values, and have no token scale to come from.
- **`feedback/info` is bound but not a token.** `listItem`'s image-slot placeholder fill points at a colour variable with that bare name; `tokens.json` has only `feedback/info/bold|onBold|subtle|onSubtle`. Either add a leaf or rebind the slot to one of the four.
- **`graduation-hat-02` is not on the `iconSlot` swap list** but is `listItem`'s leading placeholder glyph (the restore notes say `-01` was unreachable). It is in `IconSlot` in code since Sep 2026; add it to the Figma swap list, or swap the masters to a listed glyph.
- **`planNode`'s size-S `next` ring is 1.5px in Figma, unbound.** `Stroke/Border` is 1 and `Stroke/Heavy Border` is 2; nothing is 1.5. The code follows the description (2px) at both sizes. If 1.5 is the intent, add a stroke step for it and bind the four S masters to it.
---

## Three things that will break the build if missed

**The typeface is a trial licence.** Storybook and the app both need the licensed Greed files. Nothing renders correctly without them. The licence has still not been checked for web use, so raise it before any hosted build, deployed app or published Storybook.

**Greed needs OpenType features on or every string looks wrong.** Set them once at the root:

```css
:root { font-feature-settings: "ss02", "ss03", "ss06", "ss07", "lnum", "pnum"; }
```

Without these the lowercase `l` loses its tail and the question mark takes an angular form, neither of which matches the product. `frac` is deliberately excluded: in Greed it superscripts every standalone digit, so `48 XP` renders as `⁴⁸ XP`.

The same list is in `tokens/tokens.json` under `typeScale.$extensions`.

**A text field under 16px makes iOS Safari zoom the page on focus.** Any `<input>` or `<textarea>` the student can focus must use `Input/M` (16), never `Input/S Bold` (14). Safari zooms a sub-16px field to make it legible, which shrinks the visual viewport while `position: fixed` keeps resolving against the layout viewport — so a pinned layout keeps its full width with only part of it on screen, and whatever sits at the right edge goes off it. The typed turn pins itself this way to survive the keyboard, so a tester tapped the field, watched the screen go off-centre and found the send button gone. Added Sep 2026; `Input/M`, `primitive.font.size.inter-md` (16) and `primitive.font.lineheight.inter-md` (19) were added with it.

**This one is the medium, not the product.** Knowunity ships native, where no such zoom exists and 14px would be fine. It is here because the prototype is a web app and the bug sends testers chasing a layout fault that the real product cannot have. `Input/S Bold` stays in the set for a field that is drawn but never focused.

### Where both are wired

`src/app/fonts/fonts.css`, imported by `src/app/globals.css` and `.storybook/preview.css`, so a story and a screen render the same strings. The same file declares **Inter** (`InterVariable.ttf`, one face over 100–900), the second typeface, added Sep 2026 for `chatInput`'s field only; its family string must stay exactly `Inter Variable`, and anything set in it resets `font-feature-settings` to `normal`, since Greed's features change Inter's glyphs. Four faces are declared — 400 Regular, 600 SemiBold, 700 Bold, 900 Heavy — matching the weights the type scale uses and the `fontWeights` map in `style-dictionary.config.mjs`. Light, Medium and the italics are on disk but no token names them.

It is plain `@font-face` rather than `next/font/local` on purpose: `next/font` generates its own hashed family name, which a token cannot name, and Storybook never goes through `next/font` at all. The family string in that file has to stay exactly `Greed Standard-TRIAL`, because that is the literal every `typeScale` step carries; change one without the other and every label falls back silently.

`Foundations/Type` → `Scale` guards both, asserting that Greed is really loaded at 400 and 700 and that all six features are on with `frac` off. Without that guard both failures are invisible in CI: the type scale still resolves and the layout still looks plausible while every string renders in the wrong face.
