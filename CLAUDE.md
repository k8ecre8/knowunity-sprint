@AGENTS.md

# Knowunity sprint — "Explain it to Knowie"

A voice active-recall prototype: mocked recall, dark mode only, 390px iOS-style web app on Next.js 16 / React 19 / Tailwind 4.

**Concept:** one recall loop in two places, framed differently, where only the second pass is allowed to claim the student has learned anything.

## Hard rules

- **`docs/sprint-context.md` is the current scope.** Read it first.
- **Precedence when docs conflict:** `docs/sprint-context.md` → Hard constraints in `docs/design-brief.md` → `docs/design-system.md` → `docs/voice-ux.md`. They do conflict in places; ask when you find a conflict.
- **Every value comes from `tokens/tokens.json`** — colour, space, radius, duration, icon size, type step. Read the group before the number: the scales differ, so `Radius/400` and `Icon/400` are different sizes. If the value isn't there, see Never.
- **Every component decision comes from `docs/design-system.md`.** Reach for what exists before building; the "Which component to reach for" section is the index.
- The recall is mocked. No speech-to-text, no audio, no model calls
- Knowie, the mascot, replies in text and never speaks
- Sentence case everywhere — see `docs/design-system.md` → Never.
- Reduced motion is a mode on each duration — `$extensions["com.knowunity.mode"].reduced` — not a second set of tokens.
- Set the Greed OpenType features at `:root` or every string renders wrong. See `docs/design-system.md` → Two things that will break the build if missed.
- Build inside the 390px scaffold: safe areas, 44×44 minimum targets, no hover, thumb-zone primary actions, reduced-motion fallback on every animated state, layouts that hold 30–40% string expansion.
- **When something is missing** from `tokens/tokens.json` or the component set: say what's missing and what you'd call it, then stop.

## Never

- Never edit `AGENTS.md`. `next dev` regenerates it.
- Never edit `build/css/tokens.css`. It's generated: edit `tokens/tokens.json` and run `npm run tokens`.
- Never write a bare hex, a loose px value, or a CSS fallback (`var(--token, #333)`).
- Never add light mode, a transcript anywhere in the recording flow, or anything listed under `docs/sprint-context.md` → Not building.
- Never invent a component or a token to fill a gap. The known gaps are enumerated in `docs/design-system.md` → Known gaps; report, don't work around.
- Never design from the reference screenshots alone — they are the existing app, not the target.
- The full never list is `docs/design-system.md` → Never. It governs code as much as Figma.

## Component library

When working on UI, use the storybook tools to read the component library before answering or writing anything. Never assume a component prop exists. Query the documentation, and use only props that are documented or shown in a story. If a prop isn't there, stop and ask me.

## File map

**Scope and intent**
- `docs/sprint-context.md` — before any design or build decision. The concept, the decisions, the cut list.
- `docs/design-brief.md` — for the hard constraints, the user problem, success metrics, and what Knowunity asked for at kickoff. The kickoff section is context, not a spec to match.
- `docs/voice-ux.md` — when designing any recording, processing, permission or error state. The "States to design" table is the checklist.

**Design system**
- `tokens/tokens.json` — every time you need a number, colour, duration or type step. Never edit without updating `docs/design-system.md` in the same pass.
- `docs/design-system.md` — before creating or modifying any component; for naming, scaffold slots, press behaviour, icons, and known gaps.
- `docs/component-gaps.md` — running list of things built inline during a screen build. Read it before building a new screen.
- `docs/reference/` — 33 screenshots of the existing app and beta, for visual context only. 

**Code**
- `src/app/layout.tsx` — still template metadata; needs a real title and `viewport-fit=cover` for safe areas.
- `public/images/` — 22 Knowie mascot and icon assets. Check here before sourcing any illustration.

**Setup**
- `package.json`, `tsconfig.json` (`@/*` → `./src/*`), `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore` — stock create-next-app. Read only when changing build setup.
- `.claude/skills/` — `ui-designer`, `ux-designer`, `ux-motion`, `interactive-prototype`. Auto-activate; don't invoke by hand.
