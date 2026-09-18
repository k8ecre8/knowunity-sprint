import styles from './TextBlock.module.css';

/**
 * `textBlock` — a heading with an optional caption. Not for body copy.
 * See docs/design-system.md → Components built this sprint → `textBlock`.
 *
 * Promoted from the summaries' inline headlines (Sep 2026). There is no
 * Figma component: the frames draw a `verdict` frame of two text nodes,
 * Headline M over Body M Regular, both text/primary, centred, Space/150
 * apart. That geometry is what this renders.
 *
 * SIZE S (added Sep 2026): Headline S over Body M Regular, Space/050 apart,
 * as the review summary's comparison draws it, for the screens that had
 * built that pair inline.
 */
export type TextBlockProps = {
  /** Headline M, or Headline S at size S. Sentence case. */
  headline: string;
  /** M: Headline M, caption Space/150 below. S: Headline S, caption Space/050 below. */
  size?: 'M' | 'S';
  /** Body M Regular under the headline. Rendered only when `showCaption` is on. */
  caption?: string;
  showCaption?: boolean;
  /** The heading level the screen needs; the look does not change. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

export function TextBlock({
  headline,
  size = 'M',
  caption,
  showCaption = false,
  as: Heading = 'h1',
  className,
}: TextBlockProps) {
  return (
    <div
      className={[styles.block, size === 'S' && styles.sizeS, className]
        .filter(Boolean)
        .join(' ')}
    >
      <Heading className={styles.headline}>{headline}</Heading>
      {showCaption && caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
