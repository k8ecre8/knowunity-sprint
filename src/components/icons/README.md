# Local glyphs

Everything on `IconSlot` comes from `@untitled-ui/icons-react`, so the Figma glyph and the built
glyph are the same drawing. This folder is the one exception: a glyph the set does not have and
that had to be drawn.

**A glyph belongs here only when Untitled UI has no equivalent.** A glyph that exists in the set
but not on the Figma swap list is not this — that is a Known gap to report, and the fix is
importing the published component into Figma. See `docs/design-system.md` → Icons.

## Adding one

1. Draw it on a **24×24 viewBox**, the size every Untitled UI glyph uses. `IconSlot` scales the
   box with CSS, so anything else will not sit right beside a package glyph.
2. Take colour from `currentColor` — `fill="currentColor"` for a solid drawing, or
   `stroke="currentColor"` for a line one. Never a token, never a hex: the slot has no colour of
   its own and inherits from whatever it sits inside.
3. A line glyph uses `strokeWidth={2}`, matching the package. `IconSlot` lets the stroke scale
   with the box, so 2 at 24 becomes 4.67 at 56.
4. Export a default React component taking `SVGProps<SVGSVGElement>` and spreading them, the same
   shape the package's exports have.
5. Register it in `icons` in `../IconSlot.tsx`, in lower-kebab, with a comment saying why it is
   local.
6. Log it in `docs/component-gaps.md` and in `docs/design-system.md` → Known gaps, so the Figma
   file's missing counterpart is recorded rather than silently absent.

## What is here

- `MicrophoneSolid.tsx` — `microphone-01` with its capsule filled, for `voiceInput`'s idle
  button. Untitled UI's free tier ships line style only, and the outlined microphone read as weak
  on a solid fill at 56px; the solid set is a paid tier. Drawn in Figma (Mascot & components) and
  exported, Sep 2026. The export hardcoded the navy page colour and plain black; both are
  `currentColor` here, which is the point of step 2 above.
