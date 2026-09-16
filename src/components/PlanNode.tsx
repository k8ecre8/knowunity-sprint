import { IconSlot, type IconName } from './IconSlot';
import styles from './PlanNode.module.css';

/** Figma axis `state`. */
export type PlanNodeState = 'done' | 'next' | 'todo';
/** Figma axis `tone`. Ignored by `todo`. */
export type PlanNodeTone = 'blue' | 'coral' | 'magenta' | 'green';
/** Figma axis `size`. M is the plan path; S is the badge inside noteCard. */
export type PlanNodeSize = 'M' | 'S';

/**
 * The glyph each Figma master carries. The glyph is swapped per instance to
 * carry the activity type; these are only what a bare node shows, matching
 * the file. Done looks the same regardless of type — the glyph carries it.
 */
const defaultGlyph: Record<PlanNodeState, IconName> = {
  done: 'star-01',
  next: 'microphone-01',
  todo: 'file-question-02',
};

/** The nested iconSlot's size follows the node's: 400 (32px) at M, 250 (20px) at S. */
const slotSize = { M: '400', S: '250' } as const;

export type PlanNodeProps = {
  state?: PlanNodeState;
  tone?: PlanNodeTone;
  size?: PlanNodeSize;
  /** Figma: the glyph swapped on the nested iconSlot. Defaults to the master's per state. */
  name?: IconName;
  className?: string;
};

export function PlanNode({
  state = 'done',
  tone = 'blue',
  size = 'M',
  name,
  className,
}: PlanNodeProps) {
  const stateClass = styles[`state${state.charAt(0).toUpperCase()}${state.slice(1)}`];
  const toneClass = styles[`tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}`];
  const classNames = [
    styles.node,
    stateClass,
    // todo ignores tone in Figma, so the tone class is simply never applied.
    state === 'todo' ? undefined : toneClass,
    styles[`size${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} data-state={state} data-tone={tone} data-size={size}>
      {state === 'done' && (
        <span className={styles.glossClip} aria-hidden="true">
          <span className={styles.gloss} />
        </span>
      )}
      <IconSlot className={styles.icon} size={slotSize[size]} name={name ?? defaultGlyph[state]} />
    </span>
  );
}
