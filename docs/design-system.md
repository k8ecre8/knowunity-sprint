# Knowie design system

Rules for building with this system. Every value lives in `tokens.json` — this file never repeats one.

If you need a number, a colour, a duration or a type step, read `tokens.json`. If it isn't there, see **Never** below.

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

Its variants are **sizes**, not icons: 8, 12, 16, 20, 24, 32 and 40px, matching the `Icon` ramp in `tokens.json`. The default glyph is `check`. The icon itself is an instance-swap property, which appears on an instance rather than on the component set. Pick the size from the variant dropdown and the glyph from the swap dropdown.

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

**The lip is built two ways.** On a filled control it is an inner shadow. On an outlined control there is no fill to darken, so it is a heavier bottom border instead. Same idea, different mechanism, and the outlined depth is tuned by eye rather than matched to the number.

**Exits run faster than entrances.** About a third faster. Someone dismissing a thing has already decided.

**Reduced motion is a mode, not a second set of tokens.** See the `$extensions` block on each duration in `tokens.json`.

**Dark only.** There is one mode. Adding light later means restructuring, not adding a mode.

---

## Naming

**Semantic tokens read category, then concept, then role, then state.** `feedback/error/bold` is the feedback category, the error concept, the bold role. `background/surface` has no concept because it doesn't need one.

**Primitives read category, concept, step.** `color/violet/500`.

**Two numbering systems live in one collection, and this is the easiest mistake to make.** `Space` and `Radius` number at 25× the pixel value. `Icon` and `Illustration` number at 12.5×. So `Radius/400` and `Icon/400` are different sizes. Read the group before the number.

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
- In code, `untitledui-js` exposes the same set, so the Figma glyph and the built glyph are the same drawing.

**Licence.** The free tier covers one user, and that includes anyone accessing a published Figma library built on it. If this file goes to Knowunity or to other people, that is a paid tier.

---

## Never

**Never invent a value that isn't in `tokens.json`.** If you need a spacing step, a colour or a duration that doesn't exist, say what's missing and what you'd call it. Do not pick something close.

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

Each entry names the component, its axes and properties, when to reach for it, what each state means, and what not to do. The block quote under each is the description as written in Figma; the Figma description is the source of truth and this file repeats it rather than paraphrasing. Every value named below lives in `tokens.json`.

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

### `summaryCard`, overflow row

Three properties were added to the existing set: `showRow1`, `showOverflowRow` and `overflowText`. Nothing else about the card changed.

**What they mean.** `showOverflowRow` turns on a fourth row with a plus in the icon position and a chevron on the right; `overflowText` is what it says ("3 more", or "8 terms" when the card is collapsed to nothing but the header). `showRow1` off collapses the card to header and count. Expanded is the same card with rows on and the overflow row off.

**Don't** let the component decide how many rows to show; the screen does, by category. Don't put the plus without the chevron; the plus sits where the check and cross sit, which are status icons, and on its own it reads as one. Don't use the row for anything other than "there is more here."

> OVERFLOW / COLLAPSE (added Sep 2026): Row overflow (showOverflowRow, overflowText) is the collapse affordance, not just overflow handling. Plus icon in the row-icon position, chevron-down trailing; both take the tone colour. showRow1 lets a card collapse to header + count row ("8 terms").
> The component never decides how many rows to show; the screen does:
> - Section summary (3 to 5 items): everything open, no overflow row.
> - Repeat summary: two groups only, right and wrong. Wrong is always fully open (that is the work). Right shows up to 3 then "N more", or collapses to header + "N terms" when the list is long. No grouping by history or by how the term was tested.
> Expanded is the same card with rows on and the overflow row off; build it as a second frame for the prototype.

### `iconSlot`, size 500

One variant was added, `Size (IGNORE)=500` at 40px, for the leading icon in `listItem` Filled. The 250 (20px) variant was also repaired: it had collapsed to 1px in the master, which is why every 20px icon in the file rendered as a dot. The default glyph on all sizes is now `check`; the previous placeholder, `square`, had no source component and showed "restore component" on every unswapped slot.

---

## Conventions for new components

These are the rules the components above follow. Anything reading this file and making a new component follows them.

**Name the set in camelCase, the axes in lowercase, the values in lowercase.** `planNode`, `state=done`, `tone=blue`. The exceptions are axes that predate this rule: `listItem`'s `variant`, which is Knowunity's, and `summaryCard`'s `tone`, from earlier in the sprint. Each keeps its capitalisation so the set stays consistent with itself; new values added to either follow the axis, not this rule.

**Axes are for things that change the structure or the meaning.** State, tone, size, leading, active. Everything else is a property: booleans named `show` plus the thing (`showTitle`, `showChevron`, `showOverflowRow`), text named for the content it holds (`title`, `body`, `overflowText`), and the glyph swapped on the nested `iconSlot`.

**One axis ignores another when it should.** `planNode` `todo` ignores `tone`. Say so in the description rather than building tone into a state where it would compete for attention.

**Every size is a token.** Width and height on a fixed-size component are bound to an `Icon` or `Illustration` step. If the size you want is not a step, add the step to `tokens.json` and name it on the existing scale (`Illustration/600` = 48, `Illustration/1000` = 80) rather than snapping to the nearest one or leaving the number loose.

**Rows and cards fill; icons and nodes are fixed.** A component that holds copy has no width of its own: its instance is set to fill and the parent's padding token decides the margin. A component that is a shape has its width bound to a token and never fills.

**Colour is bound on the thing that is coloured.** Fills and strokes bind to semantic tokens on the frame. Icon colour binds on the glyph vector inside the slot, and is rebound after every swap. Text binds to a text style and a `text/*` token. Nothing carries a hex.

**No effects without an effect token.** There are none in `tokens.json`, so there are no shadows, glows or inner shadows on components. The `planNode` gloss is a filled vector inside a round clip frame, not an effect, and its colour is a token (`highlight/gloss`).

**An old element becomes a component by cloning it, not redrawing it.** `createComponentFromNode` on a clone of the hand-built frame, then bind what the frame left unbound, then `combineAsVariants`. This keeps the geometry the screens were tuned to.

**Nested components stay components.** A badge is a `planNode`, an icon is an `iconSlot`, a glyph is an Untitled UI instance. Nothing inside a component is a raw drawing except a gloss or a divider, and both are named.

**The description is written before the instances are swapped.** It says what the component is for, what each axis value means, which tokens it uses, what was dropped from the hand-built version and why, and what it replaced. Dated additions are prefixed with what they are and when (`OUTLINED (added Sep 2026)`). Rules that the screen owns rather than the component (how many rows to show, which tab is active) are stated as the screen's job.

**Swap, then delete.** When a component replaces hand-built frames, every instance is placed and its properties set from the old frame before the old frame is removed. Then the old master, if there was one, is deleted, and this file and `tokens.json` are updated in the same pass.

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

---

## Two things that will break the build if missed

**The typeface is a trial licence.** Storybook and the app both need the licensed Greed files. Nothing renders correctly without them.

**Greed needs OpenType features on or every string looks wrong.** Set them once at the root:

```css
:root { font-feature-settings: "ss02", "ss03", "ss06", "ss07", "lnum", "pnum"; }
```

Without these the lowercase `l` loses its tail and the question mark takes an angular form, neither of which matches the product. `frac` is deliberately excluded: in Greed it superscripts every standalone digit, so `48 XP` renders as `⁴⁸ XP`.

The same list is in `tokens.json` under `typeScale.$extensions`.
