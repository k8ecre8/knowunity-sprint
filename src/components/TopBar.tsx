import { IconSlot } from './IconSlot';
import styles from './TopBar.module.css';

/**
 * `topBar` — the app bar on the two home screens, which fits no `appBar`
 * variant. See docs/design-system.md → Components built this sprint →
 * `topBar`.
 *
 * Promoted Sep 2026 from the two inline bars on the app home and the exam
 * plan home. `variant` picks the bar:
 * - home: menu, the three counters (Pro, XP, streak) and the focus timer.
 * - plan: a kebab on the right and nothing else.
 * Everything on it is app chrome outside this flow, so it is decoration:
 * nothing is a target.
 */
export type TopBarVariant = 'home' | 'plan';

export type TopBarProps = {
  variant?: TopBarVariant;
  /** home only: the XP count. */
  xp?: number;
  /** home only: the streak in days. */
  streak?: number;
  className?: string;
};

/* The counters: a Body S Bold label and an `art/*` asset from public/images. */
const counterArt = {
  pro: '/images/pro-badge-yellow.svg',
  xp: '/images/bolt-blue-sm.svg',
  streak: '/images/flame-orange-sm.svg',
} as const;

export function TopBar({ variant = 'home', xp = 48, streak = 1, className }: TopBarProps) {
  if (variant === 'plan') {
    return (
      <div className={[styles.bar, styles.variantPlan, className].filter(Boolean).join(' ')}>
        <span className={styles.kebab} aria-hidden="true">
          <IconSlot size="300" name="dots-vertical" />
        </span>
      </div>
    );
  }

  const counters = [
    { id: 'pro', label: 'Get', tone: styles.counterPro, wide: true },
    { id: 'xp', label: String(xp), tone: styles.counterInfo, wide: false },
    { id: 'streak', label: String(streak), tone: styles.counterCoral, wide: false },
  ] as const;

  return (
    <div className={[styles.bar, styles.variantHome, className].filter(Boolean).join(' ')}>
      <span className={styles.barIcon} aria-hidden="true">
        <IconSlot size="300" name="list" />
      </span>
      <ul className={styles.counters} aria-label="Account">
        {counters.map((counter) => (
          <li key={counter.id} className={[styles.counter, counter.tone].join(' ')} data-counter={counter.id}>
            <span>{counter.label}</span>
            {/* Decorative art; the label beside it is the content. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={[styles.counterArt, counter.wide && styles.counterArtWide].filter(Boolean).join(' ')}
              src={counterArt[counter.id]}
              alt=""
            />
          </li>
        ))}
      </ul>
      <span className={styles.barIcon} aria-hidden="true">
        <IconSlot size="300" name="clock" />
      </span>
    </div>
  );
}
