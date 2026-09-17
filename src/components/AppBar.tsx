import type { ReactNode } from 'react';
import { AppBarButton } from './AppBarButton';
import { AppBarButtonIcon } from './AppBarButtonIcon';
import type { IconName } from './IconSlot';
import styles from './AppBar.module.css';

/** Figma axis `variant`. */
export type AppBarVariant =
  | 'default'
  | 'leftIconButtonOnly'
  | 'leftAndRightIconButton'
  | 'leftAndRightButton'
  | 'leftAndTwoRightIconButtons'
  | 'leftAnd2RightButtons';

export type AppBarProps = {
  variant?: AppBarVariant;
  /**
   * Figma's `Slot`. One thing across the middle, stretched to the slot's
   * width — during a session, a `ProgressIndicator` at thickness 16.
   */
  slot?: ReactNode;

  /** Code-only. Glyph on the left icon button. The masters use `arrow-left`. */
  leftIcon?: IconName;
  /** Code-only. Accessible name for the left icon button. */
  leftLabel?: string;
  onLeftPress?: () => void;

  /** Code-only. Glyph on the rightmost icon button. The masters use `dots-vertical`. */
  rightIcon?: IconName;
  /** Code-only. Accessible name for the rightmost icon button. */
  rightLabel?: string;
  onRightPress?: () => void;

  /** Code-only. Glyph on the first of two right icon buttons. The master uses `share-02`. */
  secondRightIcon?: IconName;
  /** Code-only. Accessible name for the first of two right icon buttons. */
  secondRightLabel?: string;
  onSecondRightPress?: () => void;

  /** Code-only. The App Bar Button's `Text`. The masters say "Skip". */
  buttonText?: string;
  onButtonPress?: () => void;

  className?: string;
};

export function AppBar({
  variant = 'default',
  slot,
  leftIcon = 'arrow-left',
  leftLabel = 'Back',
  onLeftPress,
  rightIcon = 'dots-vertical',
  rightLabel = 'More options',
  onRightPress,
  secondRightIcon = 'share-02',
  secondRightLabel = 'Share',
  onSecondRightPress,
  buttonText = 'Skip',
  onButtonPress,
  className,
}: AppBarProps) {
  const hasLeft = variant !== 'default';

  const left = hasLeft && (
    <AppBarButtonIcon name={leftIcon} label={leftLabel} onClick={onLeftPress} />
  );
  const rightIconButton = (
    <AppBarButtonIcon name={rightIcon} label={rightLabel} onClick={onRightPress} />
  );

  let right: ReactNode = null;
  switch (variant) {
    case 'leftAndRightIconButton':
      right = rightIconButton;
      break;
    case 'leftAndRightButton':
      right = (
        <AppBarButton className={styles.leadingGap} onClick={onButtonPress}>
          {buttonText}
        </AppBarButton>
      );
      break;
    case 'leftAndTwoRightIconButtons':
      right = (
        <div className={styles.rightButtons}>
          <AppBarButtonIcon
            name={secondRightIcon}
            label={secondRightLabel}
            onClick={onSecondRightPress}
          />
          {rightIconButton}
        </div>
      );
      break;
    case 'leftAnd2RightButtons':
      right = (
        <div className={`${styles.rightButtons} ${styles.rightButtonsInset}`}>
          {rightIconButton}
          <AppBarButton onClick={onButtonPress}>{buttonText}</AppBarButton>
        </div>
      );
      break;
  }

  return (
    <div
      className={[styles.appBar, styles[`variant${variant[0].toUpperCase()}${variant.slice(1)}`], className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      {left}
      <div className={styles.slot} data-slot="slot">
        {slot}
      </div>
      {right}
    </div>
  );
}
