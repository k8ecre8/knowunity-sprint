import type { ReactNode } from 'react';
import styles from './Scaffold.module.css';

export type ScaffoldProps = {
  /** Slot. One `appBar`; a `progressIndicator` sits inside the app bar during a session. */
  topNavigation?: ReactNode;
  /** Slot. Everything the screen is about. The only slot that scrolls and the only one that grows. */
  middleContent?: ReactNode;
  /** Slot. The call to action, usually a `button` or a `buttonGroup`. Anchored, does not scroll. */
  bottomContent?: ReactNode;
  /** Slot. Reserved for the home indicator. Leave it empty unless you are building a sheet. */
  bottomSheetOnly?: ReactNode;
  /** Toggles the whole `topNavigation` slot, for a full-bleed screen. */
  showTopNavSlot?: boolean;
  /** Toggles `bottomContent` and `bottomSheetOnly` together, as the Figma property does. */
  showBottomNavSlot?: boolean;
  /** The scrim behind a sheet. Pair it with `bottomSheetOnly`. */
  showBottomSheetBackground?: boolean;
  className?: string;
};

export function Scaffold({
  topNavigation,
  middleContent,
  bottomContent,
  bottomSheetOnly,
  showTopNavSlot = true,
  showBottomNavSlot = true,
  showBottomSheetBackground = false,
  className,
}: ScaffoldProps) {
  return (
    <div className={[styles.scaffold, className].filter(Boolean).join(' ')}>
      {/* Panel Header: fixed, not a slot. The status bar is decoration drawn in
          CSS from public/images/status-bar.svg, so every screen carries it. */}
      <div className={styles.panelHeader} aria-hidden="true" data-slot="panelHeader" />

      {showTopNavSlot && (
        <header className={styles.topNavigation} data-slot="topNavigation">
          {topNavigation}
        </header>
      )}

      {/* Focusable so a keyboard can scroll it when nothing inside is. */}
      <main className={styles.middleContent} data-slot="middleContent" tabIndex={0}>
        {middleContent}
      </main>

      {showBottomNavSlot && (
        <footer className={styles.bottomContent} data-slot="bottomContent">
          {bottomContent}
        </footer>
      )}

      {/* Order matters: the scrim paints over the slots above it and under
          bottomSheetOnly, with no z-index. */}
      {showBottomSheetBackground && (
        <div className={styles.bottomSheetBackground} aria-hidden="true" data-slot="bottomSheetBackground" />
      )}

      {showBottomNavSlot && (
        <div className={styles.bottomSheetOnly} data-slot="bottomSheetOnly">
          {bottomSheetOnly}
        </div>
      )}
    </div>
  );
}
