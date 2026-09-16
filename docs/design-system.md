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

**`buttonGroup`** for two buttons acting as one unit at the bottom of a screen. Note it hardcodes an icon button on the left and a primary on the right, so it does not currently do two text buttons side by side.

### Feedback

**`verdictChip`** when the system is reporting how an answer was judged. Four tones: Correct, Partial, Incorrect, Skipped.

**`chips`** when you are tagging, filtering or counting. It has no tone for verdicts — that is what `verdictChip` is for.

**`snackbar`** for a transient message that needs no decision.

**`responseBubble`** for anything Knowie says: the prompt on an idle turn, the verdict and feedback after judging. One container for the whole turn loop.

**`summaryCard`** for the per-category breakdown at the end of a session. One card per outcome, up to three terms shown, with an overflow row that doubles as the collapse affordance. The screen decides how many rows show, not the card.

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

---

## How things behave

**Press is geometry, not colour.** Anything with a lip presses by the lip collapsing to zero and the control sinking by the lip depth. The fill does not change. `Text`, which has no lip, presses by filling with `background/surface` instead. Transition at `motion.duration.instant`.

**The lip is built two ways.** On a filled control it is an inner shadow at `Elevation/Lip/sm` or `/lg`, in `color/alpha/dark-15`. On an outlined control there is no fill to darken, so it is a heavier bottom border instead, at `Elevation/Lip/outlined/sm` or `/lg`. Same idea, different mechanism, and the outlined depth is tuned by eye rather than matched to the number — which is why it has its own pair of tokens rather than reusing the stroke scale.

**Exits run faster than entrances.** About a third faster. Someone dismissing a thing has already decided.

**Reduced motion is a mode, not a second set of tokens.** See the `$extensions` block on each duration in `tokens/tokens.json`.

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
- Icons inherit their colour from the token on the surrounding text or the component's `on*` token. Do not give an icon its own colour token.
- In Figma the colour binding lives on the glyph's vector inside the slot. Swapping the glyph drops that binding and the icon renders dark until it is rebound. After every swap, select the vector and bind its stroke to the token again. `iconSlot` has no colour property on purpose: 325 instances carry 16 different bindings, and a tone axis would multiply the set by that.
- One stroke weight across the system. Untitled UI ships several styles; mixing them is visible.
- In code, `@untitled-ui/icons-react` (MIT) exposes the same set, so the Figma glyph and the built glyph are the same drawing. All 59 glyphs on `iconSlot`'s swap property resolve to an export in it, and `IconSlot` carries one more (`plus`) that the file cannot yet. `untitledui-js`, named here earlier, carries the same icons but is five times larger and declares peer dependencies on Vue, Solid and Qwik, so it was not used.
- The npm packages are MIT, so the code path does not inherit the free-tier limit below. The Figma file still does.

**Licence.** The free tier covers one user, and that includes anyone accessing a published Figma library built on it. If this file goes to Knowunity or to other people, that is a paid tier.

---

## Never

**Never invent a value that isn't in `tokens/tokens.json`.** If you need a spacing step, a colour or a duration that doesn't exist, say what's missing and what you'd call it. Do not pick something close.

**Never write a CSS fallback.** No `var(--token, #333)`. A token that resolves to nothing is a bug to fix at the source, and a fallback hides it until it ships.

**Never use title case.** Sentence case on every label, button, heading and message. Capitals only for proper nouns: Knowie, Knowunity, Exam Plan Plan Identity Titles, PRO.

**Never put an appearance word in a semantic name.** A word describing how a colour looks belongs in the primitive layer. `feedback/partial`, not `feedback/yellow`.

**Never read a primitive directly.** Components consume the semantic layer; the semantic layer references the primitives. The primitives are scoped to nothing in Figma for exactly this reason.

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

### `planNode`

**Axes:** `state` (done, next, todo), `tone` (blue, coral, magenta, green), `size` (M, S). 24 variants. The glyph is swapped on the nested `iconSlot`.

**Reach for it** for every stop on the exam plan path, and nowhere else. It is the visual centre of the plan home and the thing a student reads to know where they are.

**What each state means.** `done` is finished: bold tone fill, gloss band, dark icon. `next` is the one to do now: surface fill with a tone ring. `todo` is everything after that: surface fill, grey icon, and it ignores tone so the eye goes to done and next. `tone` is the goal type the student picked in onboarding, and it has to match the exam art above the plan switcher. `size=S` exists for one job, the badge inside `noteCard`.

**Don't** set tone on a `todo` node expecting a change. Don't scale an instance to get a size between M and S; report the gap. Don't add a stroke to fake a rim; the ring is the base colour showing through the inset gloss. Don't change the glyph on a `done` node to mark the activity type as complete; done looks the same regardless of type, the glyph carries the type.

> planNode: one stop on the exam plan path. 80px circle (Illustration/1000), icon in an iconSlot 400 (32px), swap the glyph for the activity.
> state: done (tone/bold fill, gloss, icon tone/onBold) | next (surface fill, 2px tone/onSubtle ring, icon tone/onSubtle) | todo (surface fill, icon text/tertiary; ignores tone so the eye goes to done and next).
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

### `bottomNav`

**Axes:** `active` (chat, plans, trophy, profile). 4 variants. No other properties.

**Reach for it** on any screen that shows the app tab bar. The plan and session screens have `plans` active; the app home has `chat`.

**What the state means.** The active tab is the section the student is in, drawn in primary text; the rest are tertiary.

**Don't** hide a tab or change its glyph per screen; the bar is app chrome and is the same everywhere. Don't recolour an inactive tab to hint at something; there is no such state.

> bottomNav: the app tab bar. Four tabs (chat, plans, trophy, profile) as 44px iconSlots, 1px divider on top (border/default), 16px vertical padding. active: which tab is text/primary; the rest are text/tertiary. Existing app chrome, rebuilt as one component so the eight screens that carry it stay in sync. Built from the hand-built bottomNav frames, Sep 2026.

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

**Also noted.** The leading placeholder glyph `graduation-hat-02` is not on the `iconSlot` swap list, so the code defaults both slots to `check`. The image slot's placeholder fill binds to `feedback/info`, a variable with no leaf token; with no image the box is empty.

### `summaryCard`, overflow row

Three properties were added to the existing set: `showRow1`, `showOverflowRow` and `overflowText`. Nothing else about the card changed.

**What they mean.** `showOverflowRow` turns on a fourth row with a plus in the icon position and a chevron on the right; `overflowText` is what it says ("3 more", or "8 terms" when the card is collapsed to nothing but the header). `showRow1` off collapses the card to header and count. Expanded is the same card with rows on and the overflow row off.

**Don't** let the component decide how many rows to show; the screen does, by category. Don't put the plus without the chevron; the plus sits where the check and cross sit, which are status icons, and on its own it reads as one. Don't use the row for anything other than "there is more here."

> OVERFLOW / COLLAPSE (added Sep 2026): Row overflow (showOverflowRow, overflowText) is the collapse affordance, not just overflow handling. Plus icon in the row-icon position, chevron-down trailing; both take the tone colour. showRow1 lets a card collapse to header + count row ("8 terms").
> The component never decides how many rows to show; the screen does:
> - Section summary (3 to 5 items): everything open, no overflow row.
> - Repeat summary: two groups only, right and wrong. Wrong is always fully open (that is the work). Right shows up to 3 then "N more", or collapses to header + "N terms" when the list is long. No grouping by history or by how the term was tested.
> Expanded is the same card with rows on and the overflow row off; build it as a second frame for the prototype.

**Built in code this sprint** as `src/components/SummaryCard.tsx`, composed on `IconSlot` at 250 for the row, plus and chevron icons. No new tokens. Props are the Figma properties by name — `tone`, `showRow1`–`3`, `term1`–`3`, `showOverflowRow`, `overflowText` — plus a code-only `onOverflowPress`, because the overflow row is an affordance and so is a `<button>`; the other rows are list items, as the DON'T says. The card fills its parent.

**Exception to the sentence-case rule, decided Sep 2026.** The four headers render in capitals as the masters draw them — `GOOD EXPLANATIONS`, `NEEDED A HINT`, `NEEDS PRACTICE`, `SKIPPED`. This is the one place in the system that does, and it was chosen over the Never rule deliberately. The strings are stored in capitals, not transformed, so the DOM matches the screen.

**Where the file and the description disagree.** The description says "header … swap the text", but the set has no `header` property; each tone bakes its string in, and so does the code. The masters place their icons as raw instances rather than through `iconSlot`, against the icon rule — the code goes through `IconSlot`. Skipped's row icon is `text/tertiary`, which the description omits. The overflow `plus` and `chevron` are drawn filled at 0.75 stroke where the row icons are 2px line; `IconSlot` renders all at one weight. The OUTSTANDING note about placeholder squares is stale: the masters now carry the glyphs it asked for.

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

**Where the file and the description disagree.** Every master's icon stroke is raw black, unbound; the code inherits the label colour, the only reading that works on both active fills. The M-size icon is a 16px glyph scaled to 20, giving a 2.5px stroke — the same fault the 32px `iconSlot` had; `IconSlot` renders one weight. Caption S Bold at XXS and XS is 12px, which the type token itself flags as below the readable minimum; the code follows the file.

### `iconSlot`

**Axes:** `Size (IGNORE)` (100, 150, 200, 250, 300, 400, 500 — 8 to 40px on the Icon ramp). 7 variants, default 400. **Properties:** one instance-swap holding the glyph, default `check`, offering 59 icons. `IconSlot` in code offers 60: `plus` was added Sep 2026 for `summaryCard`'s overflow row, but the `plus` the masters use is an unpublished orphan and cannot go on the swap list — see Known gaps.

**Reach for it** wherever an icon sits inside another component. Never place an icon directly.

**What the axis means.** Size is the box, bound to an `Icon` step. The glyph fills it. The slot carries no colour: it inherits from whatever it sits inside.

**Don't** give the slot a colour, and don't use a glyph outside `IconSlot`'s list — that is a gap to report, and when one is added it goes on the Figma swap list and in `IconSlot`'s map in the same pass, which needs a *published* source component.

> A fixed-size box holding one swappable icon. Six sizes from 8 to 32px, matching the Icon ramp.
> USE: anywhere an icon sits inside another component. This is the most-used component in the file at 165 instances, most of them nested inside chips.
> DON'T: set the size on the slot itself — the parent is meant to drive it.
> GUESS: the DON'T follows from the property being named "Size (IGNORE)". The property works and its options map exactly to the Icon tokens, so I do not know what the IGNORE is protecting against.

**Size 500 and the 250 repair.** One variant was added, `Size (IGNORE)=500` at 40px, for the leading icon in `listItem` Filled. The 250 (20px) variant was also repaired: it had collapsed to 1px in the master, which is why every 20px icon in the file rendered as a dot. The default glyph on all sizes is now `check`; the previous placeholder, `square`, had no source component and showed "restore component" on every unswapped slot.

**Built in code this sprint** as `src/components/IconSlot.tsx`, needing no new tokens — all seven `Icon` steps already existed.

**Two faults fixed in the Figma master, Sep 2026.** The 400 variant's glyph rendered a 2.667px stroke where every other size renders 2, because its nested icon had been *scaled* to 32 rather than resized — scaling multiplies stroke weight, resizing does not. The wrong `Icon/300` binding was a separate fault and repointing it fixed nothing on its own; resetting the vector's `strokeWeight` to 2 is what corrected it. Separately, the component set's width was pinned at 216 with `clipsContent` on, while its horizontal auto-layout needs 272 — so the 500 variant, last in the flow, fell outside and rendered nothing at all: null render bounds, blank export. The set is now set to hug, so adding a variant cannot reintroduce it. Only the master was affected; all 38 instances of the 500 rendered correctly throughout.

**Where the file and the description disagree.** The description says six sizes ending at 32px; there are seven ending at 40, because it predates the 500 above. On instance counts all three numbers differ: the Figma description says 165, this file said 325, and the measured count in Sep 2026 is **350** — 135 at size 300, 95 at 400, 60 at 250, 38 at 500, 22 at 200, none at 150 or 100. Counted with `getInstancesAsync` per variant; the figures above it are historical and were not re-measured.

**Deviations in code.** `Size (IGNORE)` becomes a `size` prop, keeping Figma's option values — the Figma name is not a valid identifier, and a prop is exactly the "parent drives it" the description asks for. The swap property becomes a `name` prop typed to the 59 glyphs, with no `children` escape hatch, so a caller cannot place an icon directly. Colour is `currentColor` rather than a per-vector binding, which removes the Figma problem where swapping a glyph drops its colour. A `label` prop was added for assistive tech, with no Figma counterpart: slots are `aria-hidden` unless labelled.

---

## Conventions for new components

These are the rules the components above follow. Anything reading this file and making a new component follows them.

**Name the set in camelCase, the axes in lowercase, the values in lowercase.** `planNode`, `state=done`, `tone=blue`. The exceptions are axes that predate this rule: `listItem`'s `variant`, which is Knowunity's, and `summaryCard`'s `tone`, from earlier in the sprint. Each keeps its capitalisation so the set stays consistent with itself; new values added to either follow the axis, not this rule.

**Axes are for things that change the structure or the meaning.** State, tone, size, leading, active. Everything else is a property: booleans named `show` plus the thing (`showTitle`, `showChevron`, `showOverflowRow`), text named for the content it holds (`title`, `body`, `overflowText`), and the glyph swapped on the nested `iconSlot`.

**One axis ignores another when it should.** `planNode` `todo` ignores `tone`. Say so in the description rather than building tone into a state where it would compete for attention.

**Every size is a token.** Width and height on a fixed-size component are bound to a `Control`, `Icon` or `Illustration` step — `Control` for the height of something a finger presses, the other two for artwork. If the size you want is not a step, add the step to `tokens/tokens.json` and name it on the existing scale (`Illustration/600` = 48, `Illustration/1000` = 80, `Control/1400` = 56) rather than snapping to the nearest one or leaving the number loose.

**Rows and cards fill; icons and nodes are fixed.** A component that holds copy has no width of its own: its instance is set to fill and the parent's padding token decides the margin. A component that is a shape has its width bound to a token and never fills.

**Colour is bound on the thing that is coloured.** Fills and strokes bind to semantic tokens on the frame. Icon colour binds on the glyph vector inside the slot, and is rebound after every swap. Text binds to a text style and a `text/*` token. Nothing carries a hex.

**No effects without an effect token.** There are none in `tokens/tokens.json`, so there are no shadows, glows or inner shadows on components. The `planNode` gloss is a filled vector inside a round clip frame, not an effect, and its colour is a token (`highlight/gloss`).

**An old element becomes a component by cloning it, not redrawing it.** `createComponentFromNode` on a clone of the hand-built frame, then bind what the frame left unbound, then `combineAsVariants`. This keeps the geometry the screens were tuned to.

**Nested components stay components.** A badge is a `planNode`, an icon is an `iconSlot`, a glyph is an Untitled UI instance. Nothing inside a component is a raw drawing except a gloss or a divider, and both are named.

**The description is written before the instances are swapped.** It says what the component is for, what each axis value means, which tokens it uses, what was dropped from the hand-built version and why, and what it replaced. Dated additions are prefixed with what they are and when (`OUTLINED (added Sep 2026)`). Rules that the screen owns rather than the component (how many rows to show, which tab is active) are stated as the screen's job.

**Swap, then delete.** When a component replaces hand-built frames, every instance is placed and its properties set from the old frame before the old frame is removed. Then the old master, if there was one, is deleted, and this file and `tokens/tokens.json` are updated in the same pass.

---

## Known gaps

Say these are missing rather than working around them.

- **No push-to-talk control.** The most-tapped thing in the recall loop has no component. `buttonIcon` tops out well below the size needed.
- **No focus state on any component.** The tokens exist. This is a WCAG 2.2 gap.
- **`chips` has no tone.** It offers Primary and pro only, so it cannot carry a verdict.
- **No two-text-button group.** `buttonGroup` hardcodes an icon button on the left.
- **No `Revealed` category on `summaryCard`**, and the summary grades on final outcome rather than first attempt.
- **Five components are not editable** in this file — `bottomSheet`, `Text Field`, `Tabs`, `switch`, `Screen`. Their sources live elsewhere. Detach a copy to change one. `listItem` was restored as a local set this sprint and is editable.
- **`dots-vertical` is missing from the icon set.** The kebab in `appBar`'s master and the plan-home `topBar` point at an orphaned copy. The glyph needs adding to the Untitled UI library; nothing in this file can import it.
- **No `sectionRow` component.** The plan-home section row (no lip, no fill, a divided trailing cell that is its own tap target) is not a `listItem` and is still hand-built.
- **No confidence slider.**
- **`appBar` has no variant for either `topBar`.** The app home bar (menu, three counters, timer) and the plan home bar (chip left, kebab right) do not fit any of its six variants.
- **`progressIndicator` instances come in 28px tall on a 16px bar.** The wrapper does not hug. Set the instance to a fixed 16 until the master is fixed.
- **`button`'s Loading state is not built in code,** and neither are its `showLeftIcon` and `showRightIcon` properties. The blocker is gone — `IconSlot` now exists and `@untitled-ui/icons-react` is installed — so what remains is wiring `Button` to it. Two things to settle when someone does: `Button` sets its label colour on the label, and it has to move up to the pill so the label and both icons inherit from one place; and Loading still needs a rotation duration, since `motion.duration` has instant, fast, base, slow, exit and breathing, none of which is a spinner cycle. `motion.duration.spin` is the name to add.
- **`iconSlot`'s 400 variant is missing its height binding.** Its nested instance binds width to `Icon/400`, but the height is a loose 32. Setting one dimension through the plugin API clears the other, so this one has to be bound by hand in Figma. Siblings 300, 200, 150 and 100 bind both dimensions, so the file supports it.
- **`iconSlot` sizes 150 and 100 have no instances.** 12px and 8px are unused across all 350 iconSlot instances in the file. Either they are for something not built yet, or they can go.
- **`plus` is an orphan in the file.** `summaryCard`'s overflow row uses a `plus` whose component key is not published anywhere importable — the same problem as `dots-vertical`. It cannot be added to `iconSlot`'s swap list (an attempt was made and reverted, Sep 2026), so the Figma slot offers 59 glyphs while `IconSlot` in code offers 60. Fix: import `plus` from the published Untitled UI library, re-point the four summaryCard masters at it, and add that key to the swap list.
- **`listItem` is missing three nested components in code:** `switch` (trailing Switch, 3 variants), `Checkbox` (trailing Checkbox, 12 variants) and `illustrationSlot` (the `showIllustration` leading slot, every variant). None exist as React components; `switch` is not editable in the file either. Until they are built, `ListItem` offers trailing Icon / Icon & Text / None and no illustration slot.
- **`feedback/info` is bound but not a token.** `listItem`'s image-slot placeholder fill points at a colour variable with that bare name; `tokens.json` has only `feedback/info/bold|onBold|subtle|onSubtle`. Either add a leaf or rebind the slot to one of the four.
- **`graduation-hat-02` is not on the `iconSlot` swap list** but is `listItem`'s leading placeholder glyph (the restore notes say `-01` was unreachable). Add it to the swap list and to `IconSlot`, or swap the masters to a listed glyph.
- **`planNode`'s size-S `next` ring is 1.5px in Figma, unbound.** `Stroke/Border` is 1 and `Stroke/Heavy Border` is 2; nothing is 1.5. The code follows the description (2px) at both sizes. If 1.5 is the intent, add a stroke step for it and bind the four S masters to it.
---

## Two things that will break the build if missed

**The typeface is a trial licence.** Storybook and the app both need the licensed Greed files. Nothing renders correctly without them. The licence has still not been checked for web use, so raise it before any hosted build, deployed app or published Storybook.

**Greed needs OpenType features on or every string looks wrong.** Set them once at the root:

```css
:root { font-feature-settings: "ss02", "ss03", "ss06", "ss07", "lnum", "pnum"; }
```

Without these the lowercase `l` loses its tail and the question mark takes an angular form, neither of which matches the product. `frac` is deliberately excluded: in Greed it superscripts every standalone digit, so `48 XP` renders as `⁴⁸ XP`.

The same list is in `tokens/tokens.json` under `typeScale.$extensions`.

### Where both are wired

`src/app/fonts/fonts.css`, imported by `src/app/globals.css` and `.storybook/preview.css`, so a story and a screen render the same strings. Four faces are declared — 400 Regular, 600 SemiBold, 700 Bold, 900 Heavy — matching the weights the type scale uses and the `fontWeights` map in `style-dictionary.config.mjs`. Light, Medium and the italics are on disk but no token names them.

It is plain `@font-face` rather than `next/font/local` on purpose: `next/font` generates its own hashed family name, which a token cannot name, and Storybook never goes through `next/font` at all. The family string in that file has to stay exactly `Greed Standard-TRIAL`, because that is the literal every `typeScale` step carries; change one without the other and every label falls back silently.

`Foundations/Type` → `Scale` guards both, asserting that Greed is really loaded at 400 and 700 and that all six features are on with `frac` off. Without that guard both failures are invisible in CI: the type scale still resolves and the layout still looks plausible while every string renders in the wrong face.
