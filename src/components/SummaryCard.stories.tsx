import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { SummaryCard } from './SummaryCard';

/**
 * The block quote is the component's description as written in Figma, which is
 * the source of truth. Everything after it is what this build does differently
 * and why.
 */
const description = `
> The per-category breakdown on the session summary. One card per outcome, listing the terms that landed there.
>
> **USE:** the learning summary at the end of a session. Stack the cards that apply — a clean session shows only Good.
>
> **DON'T:** use it for a single term's detail. This is a grouping, and the rows are labels rather than tappable items.
>
> **TONES:** Good, Partial, NeedsPractice, Skipped. Each takes feedback/<tone>/bold as the card, feedback/<tone>/onBold as both the header text and the row background, and feedback/<tone>/onSubtle for the icon. Skipped uses background/inverse and text/inverse, because a skip is not a judgement.
>
> **PROPERTIES:** showRow2 and showRow3 reveal further terms, up to three. header and term1 to term3 swap the text. Rows hug, so a long term wraps to two lines without breaking the card.
>
> **WHY PARTIAL EXISTS:** the shipped summary has three categories, so a term that took two hints is presented identically to one answered cold. Partial gives that its own category. It is a proposal, not something the app does today.
>
> **ICONS (resolved Sep 2026):** check, refresh-cw-01, x-close, skip-forward. They are placed as raw instances rather than through iconSlot; the code goes through iconSlot. The overflow row's plus is an unpublished orphan and cannot join iconSlot's swap list until a published plus is imported. There is no header property despite PROPERTIES above; each tone bakes its string in. There is still no Revealed category, which is the other gap in the shipped summary.
>
> **OVERFLOW / COLLAPSE (added Sep 2026):** Row overflow (showOverflowRow, overflowText) is the collapse affordance, not just overflow handling. Plus icon in the row-icon position, chevron-down trailing; both take the tone colour. showRow1 lets a card collapse to header + count row ("8 terms").
> The component never decides how many rows to show; the screen does, by category and context:
> - Section summary (3 to 5 items): everything open, no overflow row.
> - Repeat summary: Needs practice fully open; Needed a hint up to 3 then "N more"; Correct without help can collapse to header + "N terms" when the list is long.
> Expanded is the same card with rows on and the overflow row off; build it as a second frame for the prototype.

---

### How this build differs from the Figma set

**Icons go through \`IconSlot\`** at size 250 (20px). The Figma masters place \`check\`, \`plus\` and \`chevron-down\` as raw instances rather than through \`iconSlot\` — the file breaks its own rule there; the code doesn't. The row glyphs are the ones the OUTSTANDING note asked for, and the masters now carry them: check, \`refresh-cw-01\`, \`x-close\`, \`skip-forward\`.

**\`plus\` is new to \`IconSlot\`, in code only.** It was not among the 59 glyphs on the Figma swap list, and it still isn't: the \`plus\` these masters use is an unpublished orphan — \`importComponentByKeyAsync\` cannot find it — so it can't be put on the swap list. The package glyph is real, so the code list is 60. Parity waits on a published \`plus\` being imported into the file.

**There is no \`header\` prop.** The description says "header … swap the text", but the set has no such property — each tone bakes its string in. The code does the same.

**The headers are in capitals, as drawn.** That breaks the sentence-case rule in \`design-system.md\`; it was decided deliberately (Sep 2026) and recorded there as an exception. The strings are stored in capitals rather than transformed with CSS, so the DOM says what the student sees.

**The overflow row is a \`<button>\`.** The description calls it the collapse affordance, so it is pressable; \`onOverflowPress\` is a code-only prop for what pressing does. The other rows are \`<li>\` labels, as the DON'T says.

**Skipped's icon is \`text/tertiary\`,** which the description leaves out — it names only the inverse pair. The overflow glyphs are drawn filled at 0.75 stroke in the file; \`IconSlot\` renders them at the system's one stroke weight.
`;

const meta = {
  title: 'Components/summaryCard',
  component: SummaryCard,
  tags: ['autodocs'],
  args: { tone: 'Good', onOverflowPress: fn() },
  argTypes: {
    tone: { control: 'inline-radio', options: ['Good', 'Partial', 'NeedsPractice', 'Skipped'] },
  },
  parameters: {
    docs: { description: { component: description } },
  },
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --- the tone axis, as the masters ship: one row, no overflow ----------- */

export const Good: Story = {
  name: 'tone=Good',
  args: { tone: 'Good' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'GOOD EXPLANATIONS' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Partial: Story = {
  name: 'tone=Partial',
  args: { tone: 'Partial' },
};

export const NeedsPractice: Story = {
  name: 'tone=NeedsPractice',
  args: { tone: 'NeedsPractice' },
};

export const Skipped: Story = {
  name: 'tone=Skipped',
  args: { tone: 'Skipped' },
};

/* --- property states -------------------------------------------------- */

/** Section summary: everything open, no overflow row. */
export const ThreeRows: Story = {
  name: 'tone=Good, showRow2, showRow3',
  args: {
    tone: 'Good',
    showRow2: true,
    showRow3: true,
    term1: 'One-step equations',
    term2: 'Order of operations',
    term3: 'Negative numbers',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** Repeat summary: up to three shown, then "N more". Pressing the row is the screen's job. */
export const OverflowRow: Story = {
  name: 'tone=Partial, showOverflowRow',
  args: {
    tone: 'Partial',
    showRow2: true,
    showRow3: true,
    term1: 'Simplifying fractions',
    term2: 'Ratios',
    term3: 'Percentages',
    showOverflowRow: true,
    overflowText: '3 more',
  },
  play: async ({ canvas, args }) => {
    const more = canvas.getByRole('button', { name: '3 more' });
    await userEvent.click(more);
    await expect(args.onOverflowPress).toHaveBeenCalledTimes(1);
  },
};

/** Collapsed to header + count: showRow1 off, overflow on. */
export const Collapsed: Story = {
  name: 'tone=Good, showRow1=false, showOverflowRow',
  args: {
    tone: 'Good',
    showRow1: false,
    showOverflowRow: true,
    overflowText: '8 terms',
  },
  play: async ({ canvas }) => {
    // Only the overflow row remains, and it is the button.
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
    await expect(canvas.getByRole('button', { name: '8 terms' })).toBeVisible();
  },
};

/** Rows hug: a long term wraps to two lines without breaking the card. */
export const LongTerm: Story = {
  name: 'tone=NeedsPractice, long term wraps',
  args: {
    tone: 'NeedsPractice',
    term1: 'Solving simultaneous equations by elimination when neither coefficient matches',
  },
};
