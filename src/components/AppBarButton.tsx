import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './AppBarButton.module.css';

/** Figma axis `variant`. The set has one option. */
export type AppBarButtonVariant = 'text';
/** Figma axis `state`, minus Loading — see the gap noted in the stories. */
export type AppBarButtonState = 'Default' | 'Pressed' | 'Disabled';

export type AppBarButtonProps = {
  variant?: AppBarButtonVariant;
  /**
   * Pressed is a real interaction as well as a value: `:active` presses the
   * control on its own, and this prop forces the state for a story or a doc.
   * Disabled also sets the native `disabled` attribute.
   */
  state?: AppBarButtonState;
  /** The label. Figma calls this property `Text`. Sentence case. */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'>;

export function AppBarButton({
  variant = 'text',
  state = 'Default',
  children,
  className,
  ...rest
}: AppBarButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-variant={variant}
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
