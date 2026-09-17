import type { CSSProperties } from 'react';
import styles from './ProgressIndicator.module.css';

/** Figma axis `variant`. `Coral` is an appearance word; kept as the file names it. */
export type ProgressIndicatorVariant = 'Primary' | 'Coral';
/** Figma axis `thickness`, in px as the file names it. */
export type ProgressIndicatorThickness = '24' | '16';
/** Figma axis `progress`. Five design references, not the full range. */
export type ProgressIndicatorProgress = '0' | '25' | '50' | '75' | '100';

export type ProgressIndicatorProps = {
  variant?: ProgressIndicatorVariant;
  thickness?: ProgressIndicatorThickness;
  /** The Figma reference step. Ignored when `current` and `total` are given. */
  progress?: ProgressIndicatorProgress;
  /**
   * The count label, "3/12". Thickness 24 only: the 16 masters have no text
   * layer, so it is ignored there. Renders only when `current` and `total`
   * are given, since the label is a count, not a percentage.
   */
  showText?: boolean;
  /** Code-only. Steps done. With `total`, drives the bar directly. */
  current?: number;
  /** Code-only. Steps in the session. */
  total?: number;
  /** Code-only. The progress bar's accessible name. Sentence case. */
  label?: string;
  className?: string;
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = '0',
  showText = false,
  current,
  total,
  label = 'Session progress',
  className,
}: ProgressIndicatorProps) {
  const counted = current !== undefined && total !== undefined && total > 0;
  const percent = counted ? clampPercent((current / total) * 100) : Number(progress);
  const text = counted ? `${current}/${total}` : undefined;

  const classNames = [
    styles.indicator,
    styles[`variant${variant}`],
    styles[`thickness${thickness}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // The fill width is data, not a design value, so it is the one inline style.
  const fillStyle: CSSProperties = { width: `${percent}%` };

  return (
    <div
      className={classNames}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={counted ? `${current} of ${total}` : undefined}
      data-variant={variant}
      data-thickness={thickness}
      data-progress={counted ? undefined : progress}
    >
      <div className={styles.container}>
        <div className={styles.fill} style={fillStyle} data-part="fill" />
      </div>
      {showText && thickness === '24' && text && (
        <span className={styles.text} aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
}
