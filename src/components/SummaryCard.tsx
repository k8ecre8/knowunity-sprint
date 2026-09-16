import { IconSlot, type IconName } from './IconSlot';
import styles from './SummaryCard.module.css';

/** Figma axis `tone`. Capitalised values are Knowunity's, kept as they arrived. */
export type SummaryCardTone = 'Good' | 'Partial' | 'NeedsPractice' | 'Skipped';

/**
 * What each tone master carries. The header is baked into the variant — the
 * set has no header property, whatever the description says — and the row
 * glyph is what the master shows: a check, a circular arrow, a cross, a skip.
 */
const toneSpec: Record<SummaryCardTone, { header: string; glyph: IconName }> = {
  Good: { header: 'GOOD EXPLANATIONS', glyph: 'check' },
  Partial: { header: 'NEEDED A HINT', glyph: 'refresh-cw-01' },
  NeedsPractice: { header: 'NEEDS PRACTICE', glyph: 'x-close' },
  Skipped: { header: 'SKIPPED', glyph: 'skip-forward' },
};

export type SummaryCardProps = {
  tone?: SummaryCardTone;
  /** Off collapses the card to header plus the overflow count row. */
  showRow1?: boolean;
  showRow2?: boolean;
  showRow3?: boolean;
  term1?: string;
  term2?: string;
  term3?: string;
  /** The collapse affordance: a plus in the icon position, a chevron trailing. */
  showOverflowRow?: boolean;
  /** "3 more", or "8 terms" when collapsed to the header. */
  overflowText?: string;
  /**
   * Code-only. The overflow row is an affordance, so it is a button; this is
   * what pressing it does. The card never decides how many rows to show —
   * the screen does, so the screen owns this too.
   */
  onOverflowPress?: () => void;
  className?: string;
};

export function SummaryCard({
  tone = 'Good',
  showRow1 = true,
  showRow2 = false,
  showRow3 = false,
  term1 = 'One-step equations',
  term2 = 'Another term',
  term3 = 'Another term',
  showOverflowRow = false,
  overflowText = '3 more',
  onOverflowPress,
  className,
}: SummaryCardProps) {
  const { header, glyph } = toneSpec[tone];
  const rows = [
    [showRow1, term1],
    [showRow2, term2],
    [showRow3, term3],
  ].filter(([show]) => show) as [boolean, string][];

  return (
    <section
      className={[styles.card, styles[`tone${tone}`], className].filter(Boolean).join(' ')}
      data-tone={tone}
    >
      <h3 className={styles.header}>{header}</h3>
      <ul className={styles.rows}>
        {rows.map(([, term], i) => (
          <li key={i} className={styles.row}>
            <IconSlot size="250" name={glyph} />
            <span className={styles.term}>{term}</span>
          </li>
        ))}
        {showOverflowRow && (
          <li>
            <button type="button" className={styles.overflow} onClick={onOverflowPress}>
              <IconSlot size="250" name="plus" />
              <span className={styles.term}>{overflowText}</span>
              <IconSlot size="250" name="chevron-down" />
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}
