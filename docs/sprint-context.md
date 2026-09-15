# Sprint context: Explain it to Knowie

Voice active recall for Knowunity: Knowie asks, the student speaks, Knowie answers in text with a verdict.
Prototype is a web app that looks like iOS, 390px, dark mode only, recall mocked.

**Concept:** one recall loop in two places, framed differently, where only the second pass is allowed to claim the student has learned anything.

**Where it lives:** a section round after each section's quiz, and a review round inside the comprehensive review node, repeatable on exam eve.

## Decisions

- No transcript anywhere in the recording flow, because reading and editing a transcript is similar effort to typing an answer.
- Recording has three actions, start, send, re-record, because explicit stop is the send, so there is no send button and no pause.
- Every term carries one of four states, unaided, hinted, didn't know, still didn't know, because a hinted pass must never merge into an unaided one anywhere in the data or on screen.
- Every number on a summary is a count of those rows, because a score nobody can reconstruct costs overconfidence nothing.
- What a summary may claim depends on the per-term gap since the student last saw it, so the mock data carries a timestamp per term.
- The typing route runs inside the session with the same questions and verdicts, because the student must never be routed back to the plan home to get out.
- The mock returns a good, a partial and a miss answer on a real delay of a few seconds, because the wait is the hardest state in the feature.
- All colour, type, spacing and radius come from `tokens/tokens.json` and `design-system.md`, no bare hex.
- Build inside the 390px scaffold: safe areas, 44x44 minimum, no hover, thumb-zone primary actions, reduced-motion fallback on every animated state, layouts holding 30 to 40% string expansion.

## Not building

Real speech recognition or judging, Knowie speaking, pause and resume, interruption and auto-pause, network and hardware failures, disputing a verdict, XP, notification plumbing, plan onboarding, German copy, recall on flashcards or uploaded notes or mock-exam misses or AI Chat or Focus Mode, light mode, tablet, desktop, Android, plan pacing changes.
