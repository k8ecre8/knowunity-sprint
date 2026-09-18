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

**size S and captionTone (added Sep 2026).** \`size="S"\` sets Headline S with the caption Space/050 below, as the review summary's comparison draws it; the app home hero and the test-day panel use it too. \`captionTone="secondary"\` sets the caption in text/secondary, for the test-day panel's quieter line.

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

/** Review summary comparison: Headline S over a text/primary line, Space/050 apart. */
export const SizeS: Story = {
  name: 'size=S',
  args: {
    size: 'S',
    as: 'h3',
    headline: 'You felt less confident, but your answers got better.',
    caption: 'That’s underconfidence. Look at the cards above: the evidence says you know more than you feel.',
    showCaption: true,
  },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 3 });
    const caption = canvas.getByText(/underconfidence/);
    const gap = caption.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
    await expect(Math.round(gap)).toBe(2);
    await expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(document.documentElement).getPropertyValue('--typeScale-headline-s-fontSize').trim());
  },
};

/** Test-day panel: Headline S over a text/secondary line. */
export const SizeSSecondary: Story = {
  name: 'size=S, captionTone=secondary',
  args: {
    size: 'S',
    captionTone: 'secondary',
    headline: 'Your test is tomorrow',
    caption: 'Let’s review the material and make sure it’s still fresh.',
    showCaption: true,
  },
  play: async ({ canvas }) => {
    const caption = canvas.getByText(/still fresh/);
    const secondary = getComputedStyle(document.documentElement).getPropertyValue('--semantic-text-secondary').trim();
    const probe = document.createElement('span');
    probe.style.color = secondary;
    document.body.append(probe);
    await expect(getComputedStyle(caption).color).toBe(getComputedStyle(probe).color);
    probe.remove();
  },
};
