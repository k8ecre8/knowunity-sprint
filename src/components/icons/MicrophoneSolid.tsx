import type { SVGProps } from 'react';

/**
 * `microphone-01` with its capsule filled, for `voiceInput`'s idle button.
 *
 * Untitled UI's free tier ships line style only — all 2,349 glyphs in
 * `@untitled-ui/icons-react` are `fill: none` with a 2px stroke — and the outlined microphone
 * read as weak sitting on a solid fill at 56px. The solid set is a paid tier, so this one was
 * drawn in Figma (Mascot & components, Sep 2026) and exported here. It is the only glyph in the
 * system that does not come from the package; see `./README.md` and
 * `docs/design-system.md` → Known gaps.
 *
 * The drawing is the package's outline with one addition: the capsule is filled as well as
 * stroked, so the head of the microphone reads solid while the arc, stand and base stay line.
 * Both the fill and the stroke are `currentColor`. The Figma export hardcoded the navy page
 * colour on the fill and plain black on the stroke — the dropped-binding problem the Icons
 * rules describe — and neither may survive into code.
 *
 * 24×24 viewBox like every package glyph, so it scales beside them.
 */
export default function MicrophoneSolid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
      {/* The capsule, filled. */}
      <path
        fill="currentColor"
        d="M9 5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12V5Z"
      />
      {/* The arc, stand and base, plus the capsule's own edge. */}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z"
      />
    </svg>
  );
}
