import type { ReactNode } from 'react';
import { IconSlot, type IconName } from './IconSlot';
import { PlanNode, type PlanNodeTone } from './PlanNode';
import styles from './NoteCard.module.css';

/**
 * `noteCard` — a standalone container that carries one message, with an
 * optional leading icon or badge and an optional trailing chevron. Not a list
 * row. See docs/design-system.md → Components built this sprint → `noteCard`.
 *
 * Promoted Sep 2026 from the section summary's inline note when the review
 * summary needed the same card in tone `highlight`. The Figma set has four
 * tones and three leading values; code builds all of them. `leading=badge`
 * (a nested `planNode`, state done, size S) was added when the exam plan
 * home needed the plan-complete card.
 */
export type NoteCardTone = 'neutral' | 'highlight' | 'outlined' | 'plain';

export type NoteCardProps = {
  tone?: NoteCardTone;
  /** The leading `iconSlot` 400 glyph. Leave it out for `leading=none`. */
  icon?: IconName;
  /**
   * `leading=badge`: the tone of the nested `planNode` (state done, size S).
   * In Figma you change it by selecting the nested node. Takes precedence
   * over `icon`.
   */
  badge?: PlanNodeTone;
  /** Body M Bold above the body. Rendered only when `showTitle` is on. */
  title?: string;
  showTitle?: boolean;
  /** Body S Regular. Figma's `body` property. */
  children: ReactNode;
  /** The trailing chevron, `iconSlot` 250 in text/tertiary. */
  showChevron?: boolean;
  className?: string;
};

const toneClass: Record<NoteCardTone, string> = {
  neutral: styles.neutral,
  highlight: styles.highlight,
  outlined: styles.outlined,
  plain: styles.plain,
};

export function NoteCard({
  tone = 'neutral',
  icon,
  badge,
  title,
  showTitle = false,
  children,
  showChevron = false,
  className,
}: NoteCardProps) {
  const leading = badge ? 'badge' : icon ? 'icon' : 'none';
  return (
    <div
      className={[styles.card, toneClass[tone], className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-leading={leading}
    >
      {badge ? (
        <span className={styles.badge}>
          <PlanNode state="done" tone={badge} size="S" />
        </span>
      ) : (
        icon && (
          <span className={styles.icon}>
            <IconSlot size="400" name={icon} />
          </span>
        )
      )}
      <div className={styles.text}>
        {showTitle && title && <p className={styles.title}>{title}</p>}
        <p className={styles.body}>{children}</p>
      </div>
      {showChevron && (
        <span className={styles.chevron}>
          <IconSlot size="250" name="chevron-right" />
        </span>
      )}
    </div>
  );
}
