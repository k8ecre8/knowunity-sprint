import Link from 'next/link';
import { IconSlot, type IconName } from './IconSlot';
import styles from './BottomNav.module.css';

/**
 * `bottomNav` — the app tab bar. See docs/design-system.md → Components built
 * this sprint → `bottomNav`. Four tabs (chat, plans, trophy, profile), one
 * `active` value; the rest are tertiary. A tab with an entry in `hrefs` is a
 * link, except the active one; the rest are inert.
 *
 * Promoted Sep 2026 from the exam plan home's inline bar when the app home
 * needed the same bar with `chat` active.
 */
export type BottomNavTab = 'chat' | 'plans' | 'trophy' | 'profile';

/* `myai-chat` is not in IconSlot. Its placeholder is marked with the glyph
   it stands in for, so it can be swapped when added. */
type Tab = { id: BottomNavTab; label: string; icon: IconName; placeholderFor?: string };

const tabs: readonly Tab[] = [
  { id: 'chat', label: 'Chat', icon: 'send-01', placeholderFor: 'myai-chat' },
  { id: 'plans', label: 'Plans', icon: 'target-04' },
  { id: 'trophy', label: 'Achievements', icon: 'trophy-02' },
  { id: 'profile', label: 'Profile', icon: 'user-circle' },
];

export type BottomNavProps = {
  /** Figma axis `active`: the section the student is in. */
  active?: BottomNavTab;
  /** Where each tab goes. Tabs left out, and the active tab, are inert. */
  hrefs?: Partial<Record<BottomNavTab, string>>;
  className?: string;
};

export function BottomNav({ active = 'plans', hrefs = {}, className }: BottomNavProps) {
  return (
    <nav className={[styles.bar, className].filter(Boolean).join(' ')} aria-label="App sections">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const href = isActive ? undefined : hrefs[tab.id];
        const shared = {
          className: styles.tab,
          'data-tab': tab.id,
          'data-active': isActive || undefined,
          'data-placeholder-glyph': tab.placeholderFor,
        };
        const icon = <IconSlot size="300" name={tab.icon} label={tab.label} />;
        return href ? (
          <Link key={tab.id} href={href} {...shared}>
            {icon}
          </Link>
        ) : (
          <span key={tab.id} {...shared} aria-current={isActive ? 'page' : undefined}>
            {icon}
          </span>
        );
      })}
    </nav>
  );
}
