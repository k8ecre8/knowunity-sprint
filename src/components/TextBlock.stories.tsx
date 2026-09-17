import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TextBlock } from './TextBlock';

/**
 * There is no Figma component for `textBlock`; `docs/design-system.md` names
 * it and the summary frames draw it by hand. The description below is what
 * this build does and why.
 */
const description = `
**\`textBlock\`** for a heading with an optional caption. Not for body copy.

**Promoted Sep 2026** from the inline headline in the section summary, when the exam-eve repeat summary needed the same thing with its caption shown. No Figma component exists: the summary frames draw a \`verdict\` frame of two text nodes — Headline M over Body M Regular, both text/primary, centred, Space/150 apart — and that is the geometry here.

**Properties:** \`headline\`, \`caption\`, \`showCaption\` (off by default, as the section summary hides its subhead). Code-only: \`as\` picks the heading level for the document outline; the look does not change.

**Fills its parent.** The screen's padding decides the margin, per the "rows and cards fill" convention.
`;

const meta = {
  title: 'Components/textBlock',
  component: TextBlock,
  tags: ['autodocs'],
  args: { headline: 'Here’s how it went', showCaption: false },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Section summary: the headline alone; the subhead is hidden. */
export const HeadlineOnly: Story = {
  name: 'showCaption=false',
  args: { headline: 'Here’s how it went', caption: '1 of 3 without help' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Here’s how it went' })).toBeVisible();
    await expect(canvas.queryByText('1 of 3 without help')).toBeNull();
  },
};

/** Repeat summary: the verdict with its caption. */
export const WithCaption: Story = {
  name: 'showCaption',
  args: {
    headline: 'You’re ready!',
    caption: 'You got all 12 correct without help, asked a new way, the day before your test.',
    showCaption: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'You’re ready!' })).toBeVisible();
    await expect(canvas.getByText(/asked a new way/)).toBeVisible();
  },
};

/** Both strings 40% longer wrap without clipping. */
export const LongStrings: Story = {
  name: 'string expansion',
  args: {
    headline: 'You’re almost ready for tomorrow morning.',
    caption:
      'Transform boundaries and convergent boundaries are still shaky, but you still have the whole of tonight to review them before your test.',
    showCaption: true,
  },
};
