import { IconSlot, type IconName } from './IconSlot';
import styles from './VerdictChip.module.css';

/** Figma axis `tone`. Capitalised values are the file's, kept as they arrived. */
export type VerdictChipTone = 'Correct' | 'Partial' | 'Incorrect' | 'Skipped';

/**
 * What each tone master carries. Both the label and the glyph are baked into
 * the variant — the set has no text or swap property of its own — so a chip
 * says exactly what the file says.
 */
const toneSpec: Record<VerdictChipTone, { label: string; glyph: IconName }> = {
  Correct: { label: 'Correct', glyph: 'check' },
  Partial: { label: 'Almost there', glyph: 'refresh-cw-01' },
  Incorrect: { label: 'Try again', glyph: 'x-close' },
  Skipped: { label: 'Skipped', glyph: 'skip-forward' },
};

export type VerdictChipProps = {
  tone?: VerdictChipTone;
  className?: string;
};

export function VerdictChip({ tone = 'Correct', className }: VerdictChipProps) {
  const { label, glyph } = toneSpec[tone];
  return (
    <span
      className={[styles.chip, styles[`tone${tone}`], className].filter(Boolean).join(' ')}
      data-tone={tone}
    >
      <IconSlot size="200" name={glyph} />
      {label}
    </span>
  );
}
