---
name: build-screen
description: Applies when building or editing any screen in the "Explain it to Knowie" prototype — any page under src/app/ listed in SPEC.md (app home, plan home, section intro tray, voice turn, typed turn, confidence check, mic denied, and the section, review and exam-eve summaries), including adding or changing a state, a route, or where an action goes.
---

# Build a screen

A screen is a page in the Next.js app, at its own route under `src/app/`, that the student reaches by tapping from the screen before it, starting at `/`. Storybook is the catalogue for components only. A screen that exists only as a Storybook story isn't built, and screens don't get stories of their own.

This is Next.js 16. Read the routing guide in `node_modules/next/dist/docs/` before writing a page, especially for dynamic segments like `[round]` and `[term]`.

## Method

### 1. Read SPEC.md for this screen

Find the screen under **Screens, in build order** and take its route, **States**, **Components**, **Not in the library** and **Actions**. Also read:
- **Before any screen**, if `src/app/layout.tsx` or `src/app/page.tsx` is still the template.
- **How the mocked recall behaves**, for any screen that reads or writes session state (`src/mock/terms.ts`, `src/mock/session.ts`).
- Every **Open** item that mentions the screen.

`docs/sprint-context.md` still decides scope. Nothing on its Not building list gets built, whatever a frame shows.

### 2. Check whether the screen has a Figma frame

The Figma sources are the **Exam Section 1 - Claude** and **Existing onboarding rebuild** sections on the **Core Flow** page of *Yummy__Knowie Design System*. Use the `figma-console` MCP: run `figma_get_status` first, then look for this screen's frames in that section by name, and screenshot each one you'll match.

Check state by state, not just screen by screen. Some screens have frames for some states and none for others. Write down which states have a frame. That list decides which report you give at the end.

If the Figma bridge isn't connected, say so and stop. Don't assume the screen has no frame.

### 3. Query Storybook for every component you'll use

Use the `storybook` MCP (`docs-list` once, then `docs-show` for each component, and `docs-show-story` for a variant). Use only props that are documented or shown in a story. Never assume a prop exists, including ones SPEC.md names: if a prop SPEC.md uses isn't in the docs, stop and ask.

### 4. Compose from Storybook

Storybook is the only place to look for something to reuse. Most of the Figma library was never built in code, so a component existing in Figma means nothing here. Don't reuse from `docs/reference/` screenshots either; they're the old app.

Follow `docs/design-system.md` → **The scaffold** for slots: every screen is a `Scaffold`, primary actions go in `bottomContent`, only `middleContent` scrolls, and `bottomSheetOnly` is for sheets.

### 5. When something isn't in Storybook, build it inside the screen

Don't stop to ask. Build it in the screen's own files (the page and a `page.module.css` beside it) from tokens, then add one line to `component-gaps.md` at the repo root (create the file if it isn't there):

```
- `noteCard` (tone outlined, leading icon): the "You'll see these again" note. Built inline in Section summary, src/app/recall/[round]/summary/page.tsx.
```

Use the name `docs/design-system.md` → **Known gaps** or SPEC.md already gives it (`voiceInput`, `bottomSheet`, `noteCard`, `answerOption`, `textBlock`, `bottomNav`, `topBar`, `sectionRow`). Only invent a name when neither has one, and name it in camelCase as **Conventions for new components** says.

**If the same thing is already on the list from another screen**, build it properly instead:
- Call `get-storybook-story-instructions`, then make it a component in `src/components/` with a `.module.css` and a story, following **Conventions for new components**.
- Replace the earlier screen's inline copy with the component.
- Add it to `docs/design-system.md` → **Components built this sprint** and remove it from **Known gaps**.
- Update its `component-gaps.md` line to say it's now a component and which screens use it.
- Run `stories-preview` and `test-run`, fix any failures, and include the preview URLs in your report.

This overrides "report, don't build" in `CLAUDE.md` and SPEC.md for things a screen needs. It doesn't cover tokens (step 6) or glyphs: a glyph that isn't in `IconSlot` goes on the list and the screen uses a placeholder in its place.

### 6. Every value from the generated tokens

In CSS modules, use `var(--…)` from `build/css/tokens.css`, the way `src/components/*.module.css` does. That means:
- no hex;
- no raw px;
- no `var(--x, fallback)`;
- no `:hover`.

Read the group before the number, since `Radius/400` and `Icon/400` are different sizes. Type comes from the `--typeScale-*` properties as a set. Durations use the reduced mode for `prefers-reduced-motion`. If a value isn't a token, say what's missing and what you'd call it, and stop. Don't snap to the nearest step. Never edit `build/css/tokens.css`.

### 7. Mobile only: 390px, dark mode

There's no light mode, tablet or desktop. Inside the scaffold:
- respect the safe areas;
- make every target at least 44×44;
- keep primary actions in the thumb zone;
- don't rely on hover;
- use sentence case for every string;
- make sure layouts hold 30–40% longer strings.

### 8. Build every state SPEC.md lists, including the failure ones

That covers thinking slow (4s), error past 10s with retry, didn't catch that, start over, mic denied and leave confirm. Every state has to be reachable in the running app by tapping through the mocked script, not just by editing code. Every animated state needs a reduced-motion form where the helper label carries the state. Recall stays mocked: no speech-to-text, audio or model calls. Knowie replies in text. There's never a transcript after judging, and never an editable one.

### 9. Every action goes where SPEC.md says it goes

Wire every button, node, X and sheet action to the route or state in the screen's **Actions**, carrying the session state SPEC.md describes (outcome rows, rung, input mode, mic permission in `sessionStorage`). A button that leads nowhere means the screen isn't finished. Only elements SPEC.md calls inert may do nothing. Where an action says "see Open", pick a destination that fits `docs/sprint-context.md`, wire it, and report it as a decision.

## Before you report

- `npm run lint` passes.
- Search the screen's files for `#[0-9a-fA-F]{3,8}`, px literals, `var(--…, …)` and `:hover`, and fix anything you find.
- In `npm run dev` at 390×844, walk from `/` to the screen by tapping, reach every state, and follow every action out.

## Report

**If the screen, or some of its states, has a Figma frame:** match the frame. When you're done, list every difference between what you built and the frame, one line per difference, naming the state. Include:
- differences SPEC.md forced (such as `ChatInput` in place of `Text Field`, or no `bottomNav` on turn screens);
- differences forced by a component's documented props;
- tokens that don't match the frame's values;
- anything you couldn't match.

If it doesn't: read design-brief.md and voice-ux.md for how the
state should behave, and when you're done tell me what you had to
decide that wasn't written down anywhere.

Keep it specific to this project.

Both reports also list:
- the lines you added to `component-gaps.md`;
- any component you promoted, with its preview URLs.
