import { useId, type ReactNode } from 'react';
import { TextBlock } from './TextBlock';
import styles from './BottomSheet.module.css';

export type BottomSheetProps = {
  /** Headline M, sentence case. Names the dialog for assistive tech. */
  headline: string;
  /** Body M Regular under the headline. Rendered only when `showCaption` is on. */
  caption?: string;
  showCaption?: boolean;
  /** The sheet's actions: stacked buttons, the safe one first. */
  children: ReactNode;
  className?: string;
};

/**
 * `bottomSheet`: a sheet rising from the bottom edge over a scrim. Put it in
 * the scaffold's `bottomSheetOnly` slot with `showBottomSheetBackground` on,
 * and make the slots behind it `inert`. Promoted Sep 2026 from the typed
 * turn's inline leave confirm when the voice turn needed the same sheet.
 */
export function BottomSheet({ headline, caption, showCaption = false, children, className }: BottomSheetProps) {
  const titleId = useId();
  return (
    <div
      className={[styles.sheet, className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div id={titleId}>
        <TextBlock as="h2" headline={headline} showCaption={showCaption} caption={caption} />
      </div>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
