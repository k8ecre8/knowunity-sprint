---
name: grade-prototype
description: Runs a blind grading of the "Explain it to Knowie" prototype against eval/rubric.md with the critic subagents (critic-system, critic-craft, critic-ux, critic-ambition). Use when the user asks to grade, score or evaluate the prototype, or to run the critics. Takes optional critic names, for example "craft ux", to run a subset.
---

# Grade the prototype

You are the orchestrator. You run the commands the critics are not allowed to run, launch the critics, and add up what they return. You do not grade. Your own view of the work never reaches a critic or the report.

## 0. Which critics

If the user named critics (`system`, `craft`, `ux`, `ambition`, with or without the `critic-` prefix), run only those. Otherwise run all four.

## 1. Make sure the app and Storybook are up

Check both:

```
curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:6006/
```

If either does not answer 200, start it in the background (`npm run dev` for 3000, `npm run storybook` for 6006) and poll with curl until it answers, for up to two minutes. If it still does not answer, tell the user which one failed and stop. Critics without a running app are capped at 7 and the run is not worth its cost.

`next dev` may rewrite `AGENTS.md`. Leave it alone.

## 2. Run every command once, before any critic starts

The critics have no terminal. Run these one after another, never in parallel, since the machine is not fast. Skip the ones no selected critic needs.

| Command | Needed by | Keep |
|---|---|---|
| `node scripts/check-tokens.mjs` | system | exit code and full output |
| `node scripts/check-mascot-labels.mjs` | craft | exit code and full output |
| `npm run lint` | system | exit code and full output |
| `npm run build` | system | exit code and last 30 lines |
| `npm run tokens` (see below) | system | "unchanged", the diff stat, or why it was not run |
| `npx vitest run --project=storybook --browser.screenshotFailures=false` | system, craft | exit code, the summary, and every a11y todo or violation line |

For `npm run tokens`: first run `git status --porcelain -- build/css/tokens.css`. If the file already has uncommitted changes, do not run it; record "not run: `build/css/tokens.css` had uncommitted changes". Otherwise run it, then `git diff --stat -- build/css/tokens.css`. If the file changed, leave it as it is and tell the user at the end. Do not revert it.

Report the command results as they are. Do not summarise them into a verdict ("lint is clean, looks good"); that is an opinion and it would reach the critic.

Then clear old screenshots so no critic can cite a previous run: `rm -rf /tmp/knowie-critics`.

## 3. Launch the critics, two at a time

Each critic runs its own browser, so run at most two at once. Launch `critic-craft` and `critic-system` together, wait for both to finish, then launch `critic-ux` and `critic-ambition` together. Drop any that were not selected.

Use exactly these prompts and add nothing to them. The critics grade blind: never add a score, a grade, an opinion of the work, a summary of what was built, a hint of where to look, or anything from a previous run. If the user asked you to pass something along to a critic, tell them it would break blind grading and do not pass it.

**critic-system:**

```
Grade the prototype.

Command results, run before you started:

node scripts/check-tokens.mjs: exit <code>
<output>

npm run lint: exit <code>
<output>

npm run build: exit <code>
<last 30 lines>

npm run tokens: <unchanged | diff stat | not run, and why>

npx vitest run --project=storybook: exit <code>
<summary and a11y lines>
```

**critic-craft:**

```
Grade the prototype.

Command results, run before you started:

node scripts/check-mascot-labels.mjs: exit <code>
<output>

npx vitest run --project=storybook: exit <code>
<summary and a11y lines>
```

**critic-ux**, **critic-ambition:**

```
Grade the prototype.
```

## 4. Add it up

- **Gates.** Take gate 3 from critic-system and gates 1, 2 and 4 from critic-craft. Any fail fails the prototype, whatever the scores. A gate marked unverified is not a pass; say it is unverified. A gate whose critic did not run is "not checked".
- **Overall.** Only when all three adversarial critics ran: `(System fidelity × 3 + Coherence × 3 + Craft × 3 + UX judgment × 3 + Accessibility × 2 + Structure × 1) ÷ 15`, to one decimal place. If the prototype failed a gate, mark the overall as failed and still show the number. On a partial run, give the dimension scores you have and say there is no overall.
- **Ambition** is reported beside the overall, never inside it.
- Do not change, soften, merge or re-rank what a critic said. If two critics contradict each other, show both.

## 5. Save and report

Write the full report to `eval/runs/<YYYY-MM-DD-HHMM>.md`. Critics are told never to read `eval/` apart from the rubric, so past runs cannot leak into future ones. The report contains:

1. The date, the git commit (`git rev-parse --short HEAD`), whether the working tree was clean, and which critics ran.
2. The command results from step 2.
3. Gates, each with the critic that checked it.
4. A table of the dimension scores, their multipliers and the overall, then Ambition on its own line.
5. Each critic's report in full, under its name.

Then tell the user, in the terminal:

- The overall, every dimension score next to it, and Ambition separately.
- Any failed, unverified or unchecked gate.
- The lowest High-weight dimension, since the rubric says it matters more than the average.
- Anything from step 2 they need to act on.
- A link to the saved report.
