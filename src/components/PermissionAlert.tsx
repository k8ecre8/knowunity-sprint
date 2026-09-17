import { useId } from 'react';
import styles from './PermissionAlert.module.css';

export type PermissionAlertProps = {
  /** Body M Bold. The OS's own line, so it names the app in quotes. */
  title: string;
  /** Body S Regular under the title: the app's reason for asking. */
  body: string;
  /** Don't Allow, the left action. */
  onDeny: () => void;
  /** Allow, the right action, drawn bold as iOS marks the preferred choice. */
  onAllow: () => void;
  className?: string;
};

/**
 * `permissionAlert`: the mocked iOS microphone prompt (SPEC.md Open 6).
 * Centred over the scaffold's scrim, inside `bottomSheetOnly`. It reproduces
 * the OS alert, so its two buttons keep iOS's own "Don't Allow" / "Allow",
 * the one place the sentence-case rule is not applied. Promoted Sep 2026
 * from the voice turn's inline alert when the section intro tray needed the
 * same prompt on Start.
 */
export function PermissionAlert({ title, body, onDeny, onAllow, className }: PermissionAlertProps) {
  const titleId = useId();
  const bodyId = useId();
  return (
    <div className={[styles.layer, className].filter(Boolean).join(' ')}>
      <div className={styles.alert} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId}>
        <div className={styles.text}>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          <p id={bodyId} className={styles.body}>
            {body}
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onDeny}>
            Don’t Allow
          </button>
          <button type="button" onClick={onAllow} className={styles.preferred}>
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
