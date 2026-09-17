import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { NoteCard } from './NoteCard';

/**
 * Figma: `noteCard`, 12 variants (tone × leading). Code builds all four
 * tones and all three leading values.
 */
const description = `
**\`noteCard\`** for a standalone container that carries one message, with an optional leading icon or badge and an optional trailing chevron. Not a list row: rows sit against neighbours in a list (use \`listItem\`); a noteCard stands alone.

**Promoted Sep 2026** from the section summary's inline note when the review summary needed the same card in tone \`highlight\`. \`leading=badge\` was added when the exam plan home needed the plan-complete card.

**tone:** neutral (background/surface, body text/secondary) | highlight (highlight/surface + highlight/border) | outlined (background/input + border/strong, used for the plan-complete card) | plain (no container, horizontal padding 0; the inline note).

**leading:** \`icon\` (iconSlot 400 in accent/brand/bold; pass \`icon\`) | \`badge\` (a nested \`planNode\` at state done, size S; pass \`badge\` with the node's tone, as in Figma you would select the nested node) | none (leave both out).

**Properties:** \`showTitle\` (Body M Bold), \`title\`, body as children (Body S Regular), \`showChevron\` (iconSlot 250, text/tertiary). Radius/400, padding Space/400, gap Space/300. Height hugs content; width fills the parent.
`;

const meta = {
  title: 'Components/noteCard',
  component: NoteCard,
  tags: ['autodocs'],
  args: {
    tone: 'neutral',
    children: 'Divergent boundaries will be in the review before your test.',
  },
  parameters: { docs: { description: { component: description } } },
} satisfies Meta<typeof NoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  name: 'tone=neutral, leading=none',
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/will be in the review/)).toBeVisible();
  },
};

/** Review summary: the come-back line. */
export const HighlightIcon: Story = {
  name: 'tone=highlight, leading=icon',
  args: {
    tone: 'highlight',
    icon: 'calendar',
    children:
      'Knowie will remind you to review this material the day before your test. You’ll see new questions, Transform boundaries first.',
  },
};

/** Section summary: the "will be in the review" note. */
export const OutlinedIcon: Story = {
  name: 'tone=outlined, leading=icon',
  args: { tone: 'outlined', icon: 'refresh-cw-01' },
};

export const Plain: Story = {
  name: 'tone=plain, leading=icon',
  args: { tone: 'plain', icon: 'check' },
};

export const TitleAndChevron: Story = {
  name: 'tone=outlined, showTitle, showChevron',
  args: {
    tone: 'outlined',
    icon: 'calendar-check-01',
    showTitle: true,
    title: 'Plan complete',
    showChevron: true,
    children: 'Warm up tomorrow morning before your test.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Plan complete')).toBeVisible();
  },
};

/** Exam plan home, complete mode: the path collapses into this card. */
export const OutlinedBadge: Story = {
  name: 'tone=outlined, leading=badge',
  args: {
    tone: 'outlined',
    badge: 'blue',
    showTitle: true,
    title: 'Plan complete',
    showChevron: true,
    children: '9 steps over 4 days',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Plan complete')).toBeVisible();
    const node = canvasElement.querySelector('[data-state="done"][data-size="S"]');
    await expect(node).not.toBeNull();
  },
};

/** A 40% longer body wraps without clipping and the icon stays on the first line. */
export const LongBody: Story = {
  name: 'string expansion',
  args: {
    tone: 'highlight',
    icon: 'calendar',
    children:
      'Knowie will remind you to review all of this material again on the day before your test. You’ll see completely new questions, with Transform boundaries and Convergent boundaries first.',
  },
};
