import type { ButtonHTMLAttributes } from 'react';
import { IconSlot, type IconName, type IconSlotSize } from './IconSlot';
import styles from './ButtonIcon.module.css';

/** Figma axis `variant`. */
export type ButtonIconVariant = 'Primary' | 'Secondary' | 'Tertiary' | 'Text';
/** Figma axis `size`. */
export type ButtonIconSize = 'S' | 'M' | 'L';
/** Figma axis `state`. */
export type ButtonIconState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

/** The nested `iconSlot` size at each control size, as the masters nest it. */
const slotSize: Record<ButtonIconSize, IconSlotSize> = {
  S: '200',
  M: '250',
  L: '300',
};

export type ButtonIconProps = {
  variant?: ButtonIconVariant;
  size?: ButtonIconSize;
  /**
   * Pressed is a real interaction as well as a value: `:active` presses the
   * control on its own, and this prop forces the state for a story or a doc.
   * Disabled sets the native `disabled` attribute. Loading swaps the glyph for
   * `loading-01` and blocks presses without disabling the control.
   */
  state?: ButtonIconState;
  /** The glyph on the nested `iconSlot`. The masters' placeholder is `check`. */
  name?: IconName;
  /**
   * Code-only, required. The glyph is the only thing carrying the meaning, so
   * the control needs an accessible name describing the action. Sentence case.
   */
  label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>;

export function ButtonIcon({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  name = 'check',
  label,
  className,
  onClick,
  ...rest
}: ButtonIconProps) {
  const loading = state === 'Loading';
  const classNames = [
    styles.button,
    styles[`variant${variant}`],
    styles[`size${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      data-state={state}
      disabled={state === 'Disabled'}
      aria-label={label}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      <span className={styles.pill}>
        <IconSlot size={slotSize[size]} name={loading ? 'loading-01' : name} />
      </span>
    </button>
  );
}
