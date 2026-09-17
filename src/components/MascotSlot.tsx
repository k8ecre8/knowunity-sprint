import styles from './MascotSlot.module.css';

/** Figma axis `size`. The box, bound to an `Illustration` step. */
export type MascotSlotSize = 'XL' | '2XL' | '3XL' | '4XL';

/**
 * Figma: the `Homie` swap on the nested `.mascotSlotBase`. Every Knowie
 * expression in `public/images/`. `dazed` is a local Figma master with no
 * asset, so it is not offered.
 */
export const mascotNames = [
  'amazed',
  'angry',
  'approving',
  'confused',
  'determined',
  'excited',
  'giggling',
  'laughing',
  'overIt',
  'sad',
  'standby',
  'thinking',
] as const;

export type MascotName = (typeof mascotNames)[number];

/** Three expressions only exist as PNG exports; the rest are SVG. */
const pngNames: ReadonlySet<MascotName> = new Set(['determined', 'sad', 'thinking']);

const sizeClass: Record<MascotSlotSize, string> = {
  XL: styles.sizeXL,
  '2XL': styles.size2XL,
  '3XL': styles.size3XL,
  '4XL': styles.size4XL,
};

export type MascotSlotProps = {
  size?: MascotSlotSize;
  /** Figma: the `Homie` swap. Defaults to the masters' `standby`. */
  name?: MascotName;
  /**
   * Code-only. Knowie is decorative and hidden from assistive tech by default.
   * Pass a label only when the expression carries meaning the screen's text does not.
   */
  label?: string;
  className?: string;
};

export function MascotSlot({ size = 'XL', name = 'standby', label, className }: MascotSlotProps) {
  const src = `/images/${name}.${pngNames.has(name) ? 'png' : 'svg'}`;

  return (
    <span
      className={[styles.slot, sizeClass[size], className].filter(Boolean).join(' ')}
      data-size={size}
      data-name={name}
    >
      {/* A plain img: next/image needs numeric width and height, which would be loose px. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.mascot} src={src} alt={label ?? ''} aria-hidden={label ? undefined : true} />
    </span>
  );
}
