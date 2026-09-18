import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

/** Figma axis `variant`. */
export type ButtonVariant = 'Primary' | 'Secondary' | 'Tertiary' | 'Text';
/** Figma axis `size`. */
export type ButtonSize = 'S' | 'M' | 'L';
/** Figma axis `state`, minus Loading — see the gap noted in the stories. */
export type ButtonState = 'Default' | 'Pressed' | 'Disabled';
/** Figma axis `tone`. Primary only; the other variants ignore it. */
export type ButtonTone = 'Default' | 'Success' | 'Error';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Pressed is a real interaction as well as a value: `:active` presses the
   * button on its own, and this prop forces the state for a story or a doc.
   * Disabled also sets the native `disabled` attribute.
   */
  state?: ButtonState;
  tone?: ButtonTone;
  /**
   * Code-only. Fill the parent's width instead of hugging the label: Figma's
   * fill-container sizing on an instance. Both the tap target and the pill
   * stretch; the height and lip do not change.
   */
  fullWidth?: boolean;
  /** The label. Figma calls this property `CTA`. Sentence case. */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>;

export function Button({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  tone = 'Default',
  fullWidth = false,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[`variant${variant}`],
    styles[`size${size}`],
    // tone is Primary-only in the Figma set, so it is not applied elsewhere.
    variant === 'Primary' ? styles[`tone${tone}`] : undefined,
    fullWidth ? styles.fullWidth : undefined,
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
      {...rest}
    >
      <span className={styles.pill}>
        <span className={styles.label}>{children}</span>
      </span>
    </button>
  );
}
