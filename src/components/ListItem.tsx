import { IconSlot, type IconName, type IconSlotSize } from './IconSlot';
import styles from './ListItem.module.css';

/** Figma axis `variant`. Knowunity's naming, kept as it arrived. */
export type ListItemVariant = 'Filled' | 'Filled Compact' | 'Transparent' | 'Outlined' | 'Outlined Compact';
/**
 * Figma axis `trailing`, minus Switch and Checkbox: those nest components
 * that do not exist in code yet, and are recorded in Known gaps.
 */
export type ListItemTrailing = 'Icon' | 'Icon & Text' | 'None';
/** Figma axis `state`. */
export type ListItemState = 'Default' | 'Pressed' | 'Selected';

const variantClass: Record<ListItemVariant, string> = {
  Filled: 'variantFilled',
  'Filled Compact': 'variantFilledCompact',
  Transparent: 'variantTransparent',
  Outlined: 'variantOutlined',
  'Outlined Compact': 'variantOutlinedCompact',
};

const trailingClass: Record<ListItemTrailing, string> = {
  Icon: 'trailingIcon',
  'Icon & Text': 'trailingIconText',
  None: 'trailingNone',
};

/** The leading iconSlot steps with the variant: 300 (24) Transparent, 400 (32) Compact, 500 (40) full. */
const leadingSize: Record<ListItemVariant, IconSlotSize> = {
  Transparent: '300',
  'Filled Compact': '400',
  'Outlined Compact': '400',
  Filled: '500',
  Outlined: '500',
};

export type ListItemProps = {
  variant?: ListItemVariant;
  trailing?: ListItemTrailing;
  state?: ListItemState;
  title?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  showIcon?: boolean;
  showImage?: boolean;
  showEmoji?: boolean;
  emoji?: string;
  /** Shown with trailing "Icon & Text". */
  rightIconText?: string;
  /** Code-only: the glyphs on the two nested iconSlots. Both default to `check`, the slot's own default. */
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Code-only: the image in the image slot. Without it the slot is an empty box. */
  imageSrc?: string;
  imageAlt?: string;
  /** Code-only: with a handler the row is a button; without, a plain row. */
  onClick?: () => void;
  className?: string;
};

export function ListItem({
  variant = 'Transparent',
  trailing = 'Icon',
  state = 'Default',
  title = 'Something dope',
  subtitle = 'Short & crisp.',
  showSubtitle = true,
  showIcon = true,
  showImage = true,
  showEmoji = true,
  emoji = '🔥',
  rightIconText = '9th grade',
  leadingIcon = 'check',
  trailingIcon = 'check',
  imageSrc,
  imageAlt = '',
  onClick,
  className,
}: ListItemProps) {
  const classNames = [
    styles.row,
    styles[variantClass[variant]],
    styles[trailingClass[trailing]],
    styles[`state${state}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className={styles.leading}>
        {showIcon && <IconSlot size={leadingSize[variant]} name={leadingIcon} />}
        {showImage && (
          <span className={styles.image}>
            {/* A slot for whatever the screen supplies; next/image needs fixed
                dimensions and an allowlisted host, which a slot cannot promise. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {imageSrc && <img src={imageSrc} alt={imageAlt} />}
          </span>
        )}
        {showEmoji && (
          <span className={styles.emoji} aria-hidden="true">
            {emoji}
          </span>
        )}
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {showSubtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
      </span>
      {trailing !== 'None' && (
        <span className={styles.trailing}>
          {trailing === 'Icon & Text' && <span className={styles.trailingText}>{rightIconText}</span>}
          <IconSlot size="300" name={trailingIcon} />
        </span>
      )}
    </>
  );

  const data = { 'data-variant': variant, 'data-trailing': trailing, 'data-state': state };

  return onClick ? (
    <button type="button" className={classNames} onClick={onClick} aria-pressed={state === 'Selected'} {...data}>
      {content}
    </button>
  ) : (
    <div className={classNames} {...data}>
      {content}
    </div>
  );
}
