import { useId, type ReactNode } from 'react';
import { TextBlock } from './TextBlock';
import styles from './BottomSheet.module.css';

export type BottomSheetProps = {
  /**
   * Headline M, sentence case. Names the dialog for assistive tech. Shown
   * with its caption unless `middleSection` is given, in which case the
   * middle section carries its own heading and this only names the dialog.
   */
  headline: string;
  /** Body M Regular under the headline. Rendered only when `showCaption` is on. */
  caption?: string;
  showCaption?: boolean;
  /**
   * Figma's `middleSection` slot: freeform content between the app bar and
   * the actions, in place of the headline block (the intro tray's mascot,
   * heading and rows). Scrolls if it outgrows the sheet.
   */
  middleSection?: ReactNode;
  /** The Bottom-sheet App Bar: a Control/1800 bar holding the handle. */
  showAppBar?: boolean;
  /** With `showAppBar`, the bar is a close target that calls this. */
  onClose?: () => void;
  /** The sheet's actions: stacked buttons, the safe one first. */
  children: ReactNode;
  className?: string;
};

/**
 * `bottomSheet`: a sheet rising from the bottom edge over a scrim. Put it in
 * the scaffold's `bottomSheetOnly` slot with `showBottomSheetBackground` on,
 * and make the slots behind it `inert`. Promoted Sep 2026 from the typed
 * turn's inline leave confirm when the voice turn needed the same sheet;
 * `middleSection` and `showAppBar` were added when the section intro tray
 * moved onto it.
 */
export function BottomSheet({
  headline,
  caption,
  showCaption = false,
  middleSection,
  showAppBar = false,
  onClose,
  children,
  className,
}: BottomSheetProps) {
  const titleId = useId();
  const labelled = middleSection ? { 'aria-label': headline } : { 'aria-labelledby': titleId };
  return (
    <div
      className={[styles.sheet, showAppBar && styles.withAppBar, className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      {...labelled}
    >
      {showAppBar &&
        (onClose ? (
          <button type="button" className={styles.appBar} aria-label="Close" onClick={onClose}>
            <span className={styles.handle} />
          </button>
        ) : (
          <div className={styles.appBar} aria-hidden="true">
            <span className={styles.handle} />
          </div>
        ))}
      {middleSection ? (
        <div className={styles.middle}>{middleSection}</div>
      ) : (
        <div id={titleId}>
          <TextBlock as="h2" headline={headline} showCaption={showCaption} caption={caption} />
        </div>
      )}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
