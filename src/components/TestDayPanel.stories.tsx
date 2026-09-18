import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { TestDayPanel } from './TestDayPanel';

const description = `
**\`testDayPanel\`** for the reminder the day before the test: \`mascotSlot\` 2XL (standby), a \`textBlock\` headline, a text/secondary line, and one Primary L action.

**Promoted Sep 2026** from the exam plan home's complete mode, where it was built inline, when the app home's exam-eve hero turned out to be a copy of it.

**Axis:** \`size\` (M, S) sets the headline: the app home frame draws Headline M, the plan home frame Headline S. **Properties:** \`headline\`, \`body\`, \`cta\` (the action's label), \`onAction\`. Code-only: \`as\` sets the heading level.

**Spacing.** Mascot, headline, line and action are Space/300 apart, and the action keeps Space/300 above and below, as both frames draw it. The headline is a \`textBlock\`; the line is Body M Regular in text/secondary.

**Fills its parent.** The screen owns the padding around it.
`;

const meta = {
  title: 'Components/testDayPanel',
  component: TestDayPanel,
  tags: ['autodocs'],
  args: {
    headline: 'Your test is tomorrow',
    body: 'Let’s review the material and make sure it’s still fresh.',
    cta: 'Warm up now',
    onAction: fn(),
  },
  argTypes: { size: { control: 'inline-radio', options: ['M', 'S'] } },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof TestDayPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Exam plan home, complete mode. */
export const PlanHome: Story = {
  name: 'size=S',
  args: { size: 'S' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('heading', { name: 'Your test is tomorrow' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Warm up now' }));
    await expect(args.onAction).toHaveBeenCalledOnce();
  },
};

/** App home, exam-eve reminder. */
export const AppHome: Story = {
  name: 'size=M',
  args: { size: 'M', as: 'h1' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible();
  },
};

/** Both strings 40% longer wrap without clipping, and the action stays whole. */
export const LongStrings: Story = {
  name: 'string expansion',
  args: {
    headline: 'Your big test is tomorrow morning',
    body: 'Let’s review all of the material tonight and make sure every part of it is still fresh for you.',
    cta: 'Warm up for the test now',
  },
};
