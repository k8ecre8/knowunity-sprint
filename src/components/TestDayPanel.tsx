import { MascotSlot } from './MascotSlot';
import { TextBlock } from './TextBlock';
import { Button } from './Button';
import styles from './TestDayPanel.module.css';

/**
 * `testDayPanel` — the reminder the day before the test: Knowie, a
 * headline, a quieter line and the one action. See docs/design-system.md →
 * Components built this sprint → `testDayPanel`.
 *
 * Promoted Sep 2026 from the exam plan home's complete mode, where it was
 * built inline, when the app home's exam-eve hero turned out to be a copy of
 * it. `size` follows the two frames: the app home draws Headline M, the plan
 * home Headline S. The screen owns the padding around it.
 */
export type TestDayPanelProps = {
  /** Headline M (app home) or Headline S (plan home). */
  size?: 'M' | 'S';
  /** Sentence case. */
  headline: string;
  /** The quieter line under the headline, text/secondary. Sentence case. */
  body: string;
  /** The action's label. Figma calls a button's label `CTA`. Sentence case. */
  cta: string;
  onAction?: () => void;
  /** The heading level the screen needs; the look does not change. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

export function TestDayPanel({ size = 'S', headline, body, cta, onAction, as = 'h2', className }: TestDayPanelProps) {
  return (
    <div className={[styles.panel, className].filter(Boolean).join(' ')}>
      <MascotSlot size="2XL" name="thinking" label="Knowie, thinking" />
      <TextBlock size={size} as={as} headline={headline} />
      <p className={styles.body}>{body}</p>
      <div className={styles.cta}>
        <Button variant="Primary" size="L" onClick={onAction}>
          {cta}
        </Button>
      </div>
    </div>
  );
}
