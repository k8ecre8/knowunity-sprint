import type { ReactNode } from 'react';
import { IconSlot, type IconName, type IconSlotSize } from './IconSlot';
import styles from './Chips.module.css';

/** Figma axis `size`. */
export type ChipsSize = 'XXS' | 'XS' | 'S' | 'M';
/** Figma axis `color`. It mixes a role with a product tier; the name is kept as it arrived. */
export type ChipsColor = 'Primary' | 'pro';
/** Figma axis `active`. The file's values are the strings False and True, kept as they arrived. */
export type ChipsActive = 'False' | 'True';

/** The nested iconSlot steps down with the chip: 150 at XXS and XS, 200 at S, 250 at M. */
const slotSize: Record<ChipsSize, IconSlotSize> = { XXS: '150', XS: '150', S: '200', M: '250' };

export type ChipsProps = {
  size?: ChipsSize;
  color?: ChipsColor;
  active?: ChipsActive;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  /** The glyphs swapped on the two nested iconSlots. Both default to `check`, as the masters do. */
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** The label. Figma calls this property `Text`. Sentence case. */
  children: ReactNode;
  /**
   * Code-only. A filter chip is pressed; a tag or count is not. With a handler
   * the chip renders as a button carrying `aria-pressed` from `active`;
   * without one it is a plain span.
   */
  onClick?: () => void;
  className?: string;
};

export function Chips({
  size = 'XXS',
  color = 'Primary',
  active = 'False',
  showLeftIcon = true,
  showRightIcon = true,
  leftIcon = 'check',
  rightIcon = 'check',
  children,
  onClick,
  className,
}: ChipsProps) {
  const classNames = [
    styles.chip,
    styles[`size${size}`],
    styles[`color${color}`],
    styles[`active${active}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {showLeftIcon && <IconSlot size={slotSize[size]} name={leftIcon} />}
      {children}
      {showRightIcon && <IconSlot size={slotSize[size]} name={rightIcon} />}
    </>
  );

  const data = { 'data-size': size, 'data-color': color, 'data-active': active };

  return onClick ? (
    <button type="button" className={classNames} onClick={onClick} aria-pressed={active === 'True'} {...data}>
      {content}
    </button>
  ) : (
    <span className={classNames} {...data}>
      {content}
    </span>
  );
}
