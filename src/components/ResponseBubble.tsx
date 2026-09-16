import { Button } from './Button';
import styles from './ResponseBubble.module.css';
import { VerdictChip, type VerdictChipTone } from './VerdictChip';

export type ResponseBubbleProps = {
  /** Off for a plain prompt, on after judging. */
  showVerdict?: boolean;
  /**
   * The nested chip's tone. Figma has no property for this — you set it by
   * selecting the nested verdictChip — so this is that selection, as a prop.
   */
  verdictTone?: VerdictChipTone;
  /** The inline button, used for "Explain more" on an incorrect verdict. */
  showAction?: boolean;
  /** Code-only: the action button's label and what pressing it does. */
  actionLabel?: string;
  onActionPress?: () => void;
  /** Body M Regular. */
  body?: string;
  /** Body M Bold, a second paragraph. Omitted when empty. */
  body2?: string;
  className?: string;
};

const sample =
  "You're definitely using them to isolate a variable, but could you specify what inverse operations actually do to each other?";

export function ResponseBubble({
  showVerdict = true,
  verdictTone = 'Partial',
  showAction = false,
  actionLabel = 'Explain more',
  onActionPress,
  body = sample,
  body2,
  className,
}: ResponseBubbleProps) {
  return (
    <div className={[styles.bubble, className].filter(Boolean).join(' ')} data-verdict={showVerdict ? verdictTone : undefined}>
      {showVerdict && <VerdictChip tone={verdictTone} />}
      <div className={styles.text}>
        <p className={styles.body}>{body}</p>
        {body2 && <p className={styles.body2}>{body2}</p>}
      </div>
      {showAction && (
        <div className={styles.action}>
          <Button variant="Secondary" size="M" onClick={onActionPress}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
