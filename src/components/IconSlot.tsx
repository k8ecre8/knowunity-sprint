import {
  ArrowLeft,
  ArrowNarrowDown,
  ArrowNarrowDownLeft,
  ArrowNarrowDownRight,
  ArrowNarrowLeft,
  ArrowNarrowRight,
  ArrowNarrowUp,
  ArrowNarrowUpLeft,
  ArrowNarrowUpRight,
  ArrowRight,
  ArrowsRight,
  ArrowsTriangle,
  ArrowsUp,
  BookOpen02,
  Calendar,
  CalendarCheck01,
  CalendarCheck02,
  CalendarDate,
  CalendarHeart01,
  CalendarHeart02,
  CalendarMinus01,
  CalendarMinus02,
  CalendarPlus01,
  CalendarPlus02,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronDownDouble,
  ChevronLeft,
  ChevronLeftDouble,
  ChevronRight,
  ChevronRightDouble,
  ChevronSelectorHorizontal,
  ClipboardCheck,
  Clock,
  ClockCheck,
  ClockFastForward,
  ClockPlus,
  ClockRefresh,
  ClockRewind,
  DotsVertical,
  FileQuestion02,
  Globe01,
  GraduationHat02,
  HelpCircle,
  InfoCircle,
  Keyboard01,
  List,
  Loading01,
  Loading02,
  Lock01,
  Microphone01,
  MicrophoneOff01,
  PauseCircle,
  Plus,
  RefreshCw01,
  Send01,
  Send02,
  Send03,
  Share02,
  SkipBack,
  SkipForward,
  Star01,
  Target04,
  ThumbsUp,
  Trash01,
  Trophy02,
  UploadCloud02,
  UserCircle,
  XCircle,
  XClose,
  Zap,
} from '@untitled-ui/icons-react';
import MicrophoneSolid from './icons/MicrophoneSolid';
import styles from './IconSlot.module.css';

/**
 * Figma axis `Size (IGNORE)`. The name cannot survive as a prop, so it is
 * `size` here; the option values are Figma's unchanged. They are Icon ramp
 * steps, which number at 12.5x the pixel value: 100 is 8px, 500 is 40px.
 *
 * `700` (56px) is code-only and has no variant on the Figma axis, added Sep 2026 for
 * `voiceInput`'s idle button: the ramp stopped at 40, a third of that 120 control, and the
 * glyph read as a small drawing floating in it. See design-system.md → Known gaps.
 */
export type IconSlotSize = '100' | '150' | '200' | '250' | '300' | '400' | '500' | '700';

/**
 * The 69 glyphs offered on the Figma slot's instance-swap property, plus three
 * code-only additions, in the system's lower-kebab naming. Every one resolves
 * to an export in `@untitled-ui/icons-react`, so the Figma glyph and the built
 * glyph are the same drawing. A glyph that is not in this list is a gap to
 * report, not a thing to source elsewhere. `plus` was added Sep 2026 for
 * summaryCard's overflow row: it is in the package, but the `plus` the Figma
 * masters use is an unpublished orphan, so it could not be added to the Figma
 * swap list. `dots-vertical` and `share-02` were added Sep 2026 for appBar on the same
 * terms: both are in the package, `dots-vertical` is an orphan in the file and
 * `share-02` is not on the swap list. Ten more were added Sep 2026 in both
 * places at once, for the screens that were showing placeholders: `globe-01`,
 * `target-04`, `book-open-02`, `clipboard-check`, `thumbs-up`, `lock-01`,
 * `trophy-02`, `list`, `graduation-hat-02` and `upload-cloud-02`. The code
 * list is 73.
 *
 * One glyph is not from the package at all: `microphone-01-solid` is drawn locally, because
 * Untitled UI's free tier is line-only and the outlined microphone read weak on `voiceInput`'s
 * filled idle button. See `./icons/README.md` and design-system.md → Known gaps.
 */
export const icons = {
  'arrow-left': ArrowLeft,
  // Local, not from the package: see ./icons/README.md.
  'microphone-01-solid': MicrophoneSolid,
  'arrow-narrow-down': ArrowNarrowDown,
  'arrow-narrow-down-left': ArrowNarrowDownLeft,
  'arrow-narrow-down-right': ArrowNarrowDownRight,
  'arrow-narrow-left': ArrowNarrowLeft,
  'arrow-narrow-right': ArrowNarrowRight,
  'arrow-narrow-up': ArrowNarrowUp,
  'arrow-narrow-up-left': ArrowNarrowUpLeft,
  'arrow-narrow-up-right': ArrowNarrowUpRight,
  'arrow-right': ArrowRight,
  'arrows-right': ArrowsRight,
  'arrows-triangle': ArrowsTriangle,
  'arrows-up': ArrowsUp,
  'book-open-02': BookOpen02,
  calendar: Calendar,
  'calendar-check-01': CalendarCheck01,
  'calendar-check-02': CalendarCheck02,
  'calendar-date': CalendarDate,
  'calendar-heart-01': CalendarHeart01,
  'calendar-heart-02': CalendarHeart02,
  'calendar-minus-01': CalendarMinus01,
  'calendar-minus-02': CalendarMinus02,
  'calendar-plus-01': CalendarPlus01,
  'calendar-plus-02': CalendarPlus02,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-down-double': ChevronDownDouble,
  'chevron-left': ChevronLeft,
  'chevron-left-double': ChevronLeftDouble,
  'chevron-right': ChevronRight,
  'chevron-right-double': ChevronRightDouble,
  'chevron-selector-horizontal': ChevronSelectorHorizontal,
  'clipboard-check': ClipboardCheck,
  clock: Clock,
  'clock-check': ClockCheck,
  'clock-fast-forward': ClockFastForward,
  'clock-plus': ClockPlus,
  'clock-refresh': ClockRefresh,
  'clock-rewind': ClockRewind,
  'dots-vertical': DotsVertical,
  'file-question-02': FileQuestion02,
  'globe-01': Globe01,
  'graduation-hat-02': GraduationHat02,
  'help-circle': HelpCircle,
  'info-circle': InfoCircle,
  'keyboard-01': Keyboard01,
  list: List,
  'loading-01': Loading01,
  'loading-02': Loading02,
  'lock-01': Lock01,
  'microphone-01': Microphone01,
  'microphone-off-01': MicrophoneOff01,
  'pause-circle': PauseCircle,
  plus: Plus,
  'refresh-cw-01': RefreshCw01,
  'send-01': Send01,
  'send-02': Send02,
  'send-03': Send03,
  'share-02': Share02,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  'star-01': Star01,
  'target-04': Target04,
  'thumbs-up': ThumbsUp,
  'trash-01': Trash01,
  'trophy-02': Trophy02,
  'upload-cloud-02': UploadCloud02,
  'user-circle': UserCircle,
  'x-circle': XCircle,
  'x-close': XClose,
  zap: Zap,
} as const;

/** Figma's instance-swap property, as a union of the glyph names. */
export type IconName = keyof typeof icons;

export const iconNames = Object.keys(icons) as IconName[];

export type IconSlotProps = {
  size?: IconSlotSize;
  name?: IconName;
  /**
   * Code-only, with no Figma counterpart. An icon inside another component is
   * decorative and is hidden from assistive tech by default. Pass a label only
   * when the icon is the only thing carrying the meaning — an icon-only
   * control — and the label describes the action, not the drawing.
   */
  label?: string;
  className?: string;
};

export function IconSlot({
  size = '400',
  name = 'check',
  label,
  className,
}: IconSlotProps) {
  const Glyph = icons[name];
  const classNames = [styles.slot, styles[`size${size}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classNames}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <Glyph focusable="false" />
    </span>
  );
}
