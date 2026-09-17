import type { ButtonHTMLAttributes } from 'react';
import { IconSlot, type IconName } from './IconSlot';
import styles from './AppBarButtonIcon.module.css';

/** Figma axis `variant`. The set has one option. */
export type AppBarButtonIconVariant = 'default';
/** Figma axis `state`, minus Loading — see the gap noted in the stories. */
export type AppBarButtonIconState = 'Default' | 'Pressed' | 'Disabled';

export type AppBarButtonIconProps = {
  variant?: AppBarButtonIconVariant;
  /**
   * Pressed is a real interaction as well as a value: `:active` presses the
   * control on its own, and this prop forces the state for a story or a doc.
   * Disabled also sets the native `disabled` attribute.
   */
  state?: AppBarButtonIconState;
  /** The glyph on the nested `iconSlot`. The master's placeholder is `check`. */
  name?: IconName;
  /**
   * Code-only, required. The glyph is the only thing carrying the meaning, so
   * the control needs an accessible name describing the action. Sentence case.
   */
  label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>;

export function AppBarButtonIcon({
  variant = 'default',
  state = 'Default',
  name = 'check',
  label,
  className,
  ...rest
}: AppBarButtonIconProps) {
  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-state={state}
      disabled={state === 'Disabled'}
      aria-label={label}
      {...rest}
    >
      <span className={styles.circle}>
        <IconSlot size="300" name={name} />
      </span>
    </button>
  );
}
