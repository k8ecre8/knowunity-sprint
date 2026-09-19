import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';
import { ExpandableSummaryCard } from './ExpandableSummaryCard';

const description = `
> A \`summaryCard\` that opens itself. The screen picks the starting view by outcome and context; pressing the overflow row opens every term, and the card stays open.
>
> **VIEWS:** \`open\` shows every term. \`overflow\` shows three, then "N more", and shows a list of three or fewer whole. \`collapsed\` shows the header and "N terms".
>
> **WHERE:** the three summaries. Section summary collapses Good and Partial and keeps Needs practice open, so a first pass reads as a list to come back to rather than a score. Review summary collapses Good and Partial and overflows Needs practice, so "How you felt" is on screen on arrival. Exam-eve repeat summary opens Needs practice and overflows Partial and Good.
>
> **DON'T:** close a card again, or collapse Needs practice to a count. Opening changes only the view, never the rows.

---

Promoted Sep 2026 from the \`Card\` wrapper that the review and exam-eve summaries each built inline, when the section summary became the third screen to need it. \`view\` replaces the wrapper's \`open\` boolean, adding \`collapsed\`. No new tokens.
`;

const TERMS = [
  'Convection currents',
  'Subduction',
  'Divergent boundary',
  'Convergent boundary',
  'Transform fault',
];

const meta = {
  title: 'Components/expandableSummaryCard',
  component: ExpandableSummaryCard,
  tags: ['autodocs'],
  args: { tone: 'Good', names: TERMS, view: 'open' },
  argTypes: {
    view: { control: 'inline-radio', options: ['open', 'overflow', 'collapsed'] },
  },
  parameters: { layout: 'padded', docs: { description: { component: description } } },
} satisfies Meta<typeof ExpandableSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  name: 'view=open',
  args: { tone: 'NeedsPractice' },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(TERMS.length);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Overflow: Story = {
  name: 'view=overflow',
  args: { tone: 'Partial', view: 'overflow' },
  play: async ({ canvas }) => {
    // Three terms, then the overflow row.
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await userEvent.click(canvas.getByRole('button', { name: '2 more' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(TERMS.length);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const OverflowShort: Story = {
  name: 'view=overflow, three or fewer',
  args: { tone: 'Partial', view: 'overflow', names: TERMS.slice(0, 3) },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Collapsed: Story = {
  name: 'view=collapsed',
  args: { tone: 'Good', view: 'collapsed' },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: '5 terms' }));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(TERMS.length);
  },
};

export const CollapsedOne: Story = {
  name: 'view=collapsed, one term',
  args: { tone: 'Good', view: 'collapsed', names: TERMS.slice(0, 1) },
  play: async ({ canvas }) => {
    // "1 term" would take the same height as the name, so the name shows.
    await expect(canvas.getByText(TERMS[0])).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
