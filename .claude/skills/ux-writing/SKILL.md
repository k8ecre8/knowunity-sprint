---
name: ux-writing
description: "Use this skill whenever writing or editing text that appears inside a product interface. Triggers include: button and link labels, error and validation messages, empty states, loading and success states, form labels and helper text, tooltips, modals and confirmation dialogs, onboarding and first-run copy, notifications, settings descriptions, navigation labels, and naming features or objects in a UI. Also use when reviewing an existing screen's copy, when a design needs words before it can be evaluated, or when someone asks why a flow feels confusing and the problem is the language. Use this skill even for a single button label — the principles apply at every scale. Do NOT use for marketing pages, portfolio case studies, or long-form prose."
---

# UX Writing

Principles for writing the text inside an interface. Built from content writing guidelines developed for interactive conversation design, generalized to product UI, with established practice from Polaris, NN/g, and Podmajersky's voice chart folded in where it agrees.

**A note on layers:** this file is the principles. A `references/corrected-examples.md` layer holds before/after pairs from real editing sessions and is the calibration — principles tell you the rule, examples show where the line sits. If that file exists, read it before writing.

---

## A warning that governs everything below

Any device becomes a tic the moment it becomes a rule. These are tendencies and tests, not formulas. If every button is verb + object, every error is two clauses, and every empty state has the same three parts, the interface reads as generated — technically compliant and dead.

The goal is copy that sounds like a person wrote it for this specific moment. If a reader can see the move, it's overused. When a rule below produces something worse than the plain alternative, the plain alternative wins.

---

## The governing test

**Read it out loud. Would a person say this to another person?**

Not "does it sound professional." Not "is it on brand." Would a person say it. Most bad UI copy fails this immediately — it reads like a system describing itself, a brochure, or a legal disclaimer wearing a friendly hat.

Two corollaries:

- **Authority comes from precision, not formality.** "Your changes save automatically" is more authoritative than "Changes are automatically persisted to the server."
- **Warmth comes from acknowledging the situation, not from filler.** "Great question!" and "Oops!" are not warmth. Naming what happened and what to do next is.

---

## Before you write

### Find the precedent first

The highest-value first move is not writing. It's finding the closest existing screen in the product that covers the same territory, and modeling structure from it. A delete confirmation should look like the other delete confirmations. An empty state should follow the pattern the other empty states set.

**Match the arc, not the element count.** A parallel flow's shape — orient, show the consequence, offer the action — may land across a different number of screens or fields. Match the shape.

### Calibrate depth to the neighbors

Don't go deeper than the screen's scope warrants. Look at what comes before and after. If a concept gets explained properly two steps later, this screen stays at its own level. The interface doesn't deliver everything at once; later moments build on earlier ones.

### Write every state

Copy isn't done when the happy path reads well. Every surface needs: empty, loading, partial, error, permission-denied, offline, and success. The failure states are where users actually need the words, and they're almost always written last and worst.

---

## Failure modes, in order of frequency

### 1. Lines that sound like statements but say nothing

A phrase sounds informative and carries no information. The referent is fuzzy, or the content is empty, or both.

**The test:** does it have a clear referent AND say something true and checkable? If not, say the plain thing.

- ❌ "Something went wrong." — no referent, nothing checkable
- ❌ "Your data is safe with us." — safe how? from what?
- ❌ "We're making things better." / "Work smarter."
- ✅ "We couldn't reach the server. Your draft is saved locally."
- ✅ "Files are encrypted before they leave your device."

The corollary: **when a line carries the actual point, say it straight.** Shaping — rhythm, a turn, a short landing — belongs in the rare moment that can afford it. In an interface, almost every line is load-bearing, so almost every line is plain.

### 2. Verbs of proximity

A line that names the user's relationship to a feature instead of what the feature produces. These pass the referent test and are literally true — they're just inert.

Watch for: manage, access, explore, view, handle, work with, get started with.

- ❌ "Manage your notifications" → ✅ "Choose what you get emailed about"
- ❌ "Access your reports" → ✅ "See how your team spent last month"
- ❌ "Explore templates" → ✅ "Start from a layout that already works"
- ❌ "Get started with billing" → ✅ "Add a card so invoices go out on time"

**Test:** does the line name a result, or does it name proximity to something that produces results?

This constrains the verb + object guidance below — "Manage settings" is verb + object and still fails. Sometimes proximity is honest, because the screen really is a container with no single outcome. Then the plain label is right and forcing an outcome onto it is worse.

### 3. Assuming how the user feels

The most common and most damaging. "We know this can feel overwhelming." "You're probably wondering..." "Don't worry!" "Oops!" They might feel none of those things, and presuming breaks trust instantly.

**The distinction that matters:** this is about presuming the user's *current internal state*. It is not about describing feelings as a *value*. "Get confidence in your coverage" frames confidence as something offered. "We know you're anxious about coverage" claims to know how they feel right now. The first describes a feature. The second presumes.

- ❌ "Oops! Something went wrong."
- ❌ "Sorry for the inconvenience!"
- ✅ "We couldn't save your changes. Check your connection and try again."

### 4. Hedging that doesn't match reality

This is an accuracy problem, not a confidence problem. Most guidance says "be confident." The real rule is: pick the rung that matches what's actually true.

The gradient:

| Rung | Use when |
|---|---|
| "you can..." | genuine optionality, no stakes |
| "you might want to..." | subjective fit, a pattern not a guarantee |
| "you'll want to..." | recommended, with a real downside if skipped |
| "you need to..." | hard deadline or non-negotiable |

Facts get stated firmly regardless. "Drafts are deleted after 30 days" — no hedge. And never hedge a fact with "hopefully" or "should probably."

- ❌ "You should probably verify your email." (hedges a required step)
- ✅ "You need to verify your email before you can invite teammates."
- ❌ "This template will work best for your team." (unknowable)
- ✅ "This template works well for teams that review weekly."

### 5. Naming before explaining

When introducing a term the user may not know, the explanation comes first and the term lands at the end as a payoff — not as a hurdle to clear.

- ❌ "Your retention policy determines how long deleted items are kept."
- ✅ "Deleted items stay recoverable for a set number of days. That window is your retention policy."

**Parenthetical variant** for formal names: "a shared workspace (called an organization)" — descriptive noun leads, formal name lands as payoff. Not "an organization, which is a shared workspace."

Once a term is introduced, it can be used plainly. Never introduce one without defining it on first appearance in a flow.

### 6. Claims the product can't back

If a line makes a factual assertion — about performance, adoption, outcomes, or comparisons — it needs something real behind it. "The fastest way to..." and "Most teams start here" are claims. If you can't source it, reframe to something definitionally true.

- ❌ "The most popular way to organize your work"
- ✅ "Built for teams that work in weekly cycles" (structural, not comparative)

Comparative framing is especially risky: a comparison implies a comparative claim. Prefer describing what the thing *is*.

### 7. Marketing structures leaking into the UI

If the line could appear on a landing page, rewrite it. Specific patterns to catch:

- **Branded pillars.** Bolded headline blocks — "**Built for speed**" / "**Enterprise-ready**" — read as slide layout, not interface. Value expresses as prose or as the feature itself.
- **Adjective stacking.** "Powerful, intuitive collaboration."
- **Exclamation points.** Essentially never.
- **Superlatives.** "Seamlessly," "effortlessly," "instantly."

### 8. Beats that don't earn their place

A screen, a step, or a line of helper text that only announces what's coming is waste. "Let's get you set up!" is a whole screen spent on nothing. Transitions belong inside a beat, not as their own beat.

Same rule at the sentence level: cut any line where removing it costs the user nothing.

**Related: one line, one claim.** When a single line carries two ideas joined by "and" or "so," neither gets room and both get vague. Split them or cut one.

- ❌ "Upload a CSV and we'll match your columns automatically so your data imports cleanly"
- ✅ "Upload a CSV. We'll match your columns automatically."

Common in helper text that explains the field *and* warns about the format, and in empty states that describe the feature *and* pitch the value.

### 9. Insider shorthand

Write the full name. Internal abbreviations make the product sound like a team document, and the user may not know what they stand for. An abbreviation can be introduced parenthetically once if a later screen actually uses it — but in an intro, prefer the full name.

Also: no parenthetical authorial notes, no internal object names leaking into labels (if engineering calls it a "node" and users see a "card," the label is "card" everywhere).

### 10. Dramatized magnitude

Stay on the calmer side of accurate. Hedge magnitude in the user's favor.

- ❌ "You'll lose all your work."
- ✅ "Unsaved changes will be lost."
- ❌ "This will permanently destroy your account and everything in it."
- ✅ "This deletes your account and all its projects. This can't be undone."

Accuracy is the point. Alarm is not a substitute for it.

---

## Two-channel writing

Most UI text appears alongside other text that hits at the same moment: label and helper text, heading and body, icon and label, toast and inline error, chart and caption, audio and captions. Two rules govern all of them.

### Both channels reinforce the same beat at the same moment

Cognitive load spikes when two channels deliver different content simultaneously — the user doesn't know where to look. The primary channel carries the explanation; the secondary channel anchors the take-home. They track together.

When a line uses explain-before-you-name, the layout can teach it:

> **Retention policy**
> Deleted items stay recoverable for 30 days.

The explanation is visible; the term lands as the visual payoff. Both channels, same beat.

### The secondary channel has to stand alone

Never a pronoun whose antecedent lives in the other channel or a previous screen.

- ❌ Helper text: "These are applied automatically." (applied to what?)
- ✅ Helper text: "Tax rates are applied automatically at checkout."

This is the same rule as link text that makes sense out of context, error messages that make sense without the field label, and toasts that make sense without the screen behind them. Anything that can be encountered alone must read alone.

### Mirror, don't summarize

The default is that the secondary channel restates the primary one closely. It isn't redundant — reinforcement across two channels is the point. Divergence is the exception, and there are only a few legitimate patterns:

- **Variable substitution.** Same sentence, concrete value in one channel: "Your trial ends on March 15" vs. "Your trial ends in 12 days."
- **Layered data.** One channel frames, the other shows the data. Label: "Your share depends on the plan tier." Below it: the tier table.
- **Formal-name compression.** Body says "also called an organization"; the label shows "(Organization)."

Writing something new in the second channel because repeating feels redundant is the most common way this breaks.

---

## Sentence-level craft

- **Short, direct declaratives.** A standalone short sentence usually builds rhythm better than chaining clauses.
- **Em dashes sparingly.** For clarity and pacing when they help. Not as a default connector.
- **Active voice.** "Stripe processes your payment," not "Your payment is processed."
- **Start with the verb.** "Add apps," not "You can add apps."
- **Front-load the goal before the action.** "To see item details, tap its name" — not "Tap the item to see its details." People decide whether to continue within seconds.
- **Verb + object for buttons.** "Send invoice," "Download report," "Delete project." Not "Submit," "OK," "Continue" when something more specific is true.
- **No second-person plural.** "You all" never.
- **Sentence case** for labels, headings, and buttons unless the product's convention says otherwise.
- **Contractions** are fine and usually better.
- **Aim around a grade 7 reading level.** Not because users are unsophisticated — because they're scanning, and because copy gets translated and read by people for whom this isn't a first language.
- **Label icons.** A word alongside an icon measurably improves whether people predict what it does. Don't assume an icon is standard.

---

## Consistency

- **One concept, one word, everywhere.** If it's a "project" in the nav, it's a "project" in the empty state, the error, and the settings page. Synonyms feel like different things.
- **The promise matches the button.** If the heading says "Create your first report," the button says "Create report" — not "Submit," not "Get started."
- **Parallel grammar across a set.** All the items in a menu, a settings list, or a set of section headings should share a grammatical shape. Break it only when content demands, and then break it for all of them.
- **Preserve intentional word choices.** When editing someone else's copy, assume their word choices were deliberate. If you're uncertain whether something was intentional, ask — don't silently substitute.

---

## Headings

Modal titles, empty-state headings, section headings, onboarding headings. Two failure modes, and the target sits between them.

**Too obvious — filing-cabinet labels.** "Settings." "Error." "No items." "Get started." They name the drawer, not the point.

**Too clever — straining for a slogan.** "Nothing to see here!" "Your canvas awaits." "Uh oh, we hit a snag." Wordplay that performs instead of informs.

**The target: plain, plus one word that carries the stakes.**

- ❌ "No projects" → ✅ "Your first project starts here"
- ❌ "Error" → ✅ "We couldn't connect to Stripe"
- ❌ "Delete?" → ✅ "Delete 4 projects permanently"

**Test:** could this heading sit on top of any screen? Then it's too generic. Would the user have to decode it? Then it's too clever.

---

## Specific elements

**Buttons.** Verb + object. Say what happens, not what the widget is. The destructive one names the consequence: "Delete 4 projects," not "Confirm."

**Errors.** Name what happened, then the path to fix it. Never blame the user, never surface a code, never say "invalid." "That email is already registered. Sign in instead?" beats "Invalid email."

**Empty states.** Say what goes here and how to put the first one in. An empty state is the best onboarding surface in the product and usually the most neglected.

**Confirmations.** Name the object and the consequence. If it's reversible, say so — that's often the whole message. If it isn't, say that plainly once, without dramatizing.

**Helper text.** Only when it removes real doubt. Helper text that restates the label is noise. Put it at the point of need, not in a preamble.

**Success states.** Say what happened and what's now possible. "Invoice sent" is fine. "Invoice sent to maria@acme.com" is better.

---

## Humor

Humor is for connection, not entertainment. A knowing aside or a small surprise can make a product feel human and ease a tense moment. Welcome it when it emerges naturally.

Never at the expense of the user's situation, and never sarcasm — that breaks trust instantly. If a line earns its place by warming the moment, keep it. If it's there for its own sake, cut it.

Error states and payment flows are almost never the place.

---

## Checklist

1. Read every line out loud. Would a person say it?
2. Does any line name proximity to a feature instead of a result?
3. Does any line assume how the user feels?
4. Does every hedge match the actual stakes? Any fact wearing a hedge?
5. Is any term used before it's explained?
6. Does any claim need a source it doesn't have?
7. Could any line appear on a landing page?
8. Does every screen, step, and helper line earn its place?
9. Any insider shorthand or internal object names?
10. Is any magnitude dramatized past what's accurate?
11. Do paired channels hit the same beat, and does the secondary one stand alone?
12. Is one concept named one way everywhere?
13. Does the button match what the heading promised?
14. Are the empty, loading, error, and permission states written?
15. Have the original author's intentional word choices been preserved?
